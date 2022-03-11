package app

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/imdario/mergo"
	"gorm.io/gorm/clause"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

func LoadUserFixtures(filename string) {
	jsonFile, err := os.Open(filename)
	if err != nil {
		log.Printf("failed to open json file: %s, error: %v", filename, err)
	}

	jsonData, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		log.Printf("failed to read json file, error: %v", err)
	}

	var users []User
	if err = json.Unmarshal(jsonData, &users); err != nil {
		log.Printf("failed to unmarshal json file, error: %v\n", err)
		log.Printf("failed to close jsonFile, error: %s", jsonFile.Close().Error())
	}

	DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&users)
	for i, user := range users {
		log.Printf("USER#%d: ID: %d Username: %s", i, user.ID, user.Username)
	}
}

func LoadPostFixtures(filename string) {
	jsonFile, err := os.Open(filename)
	if err != nil {
		log.Printf("failed to open json file: %s, error: %v", filename, err)
	}

	jsonData, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		log.Printf("failed to read json file, error: %v", err)
	}

	var posts []Post
	if err = json.Unmarshal(jsonData, &posts); err != nil {
		log.Printf("failed to unmarshal json file, error: %v\n", err)
		log.Printf("failed to close jsonFile, error: %s", jsonFile.Close().Error())
	}

	DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&posts)
	for i, post := range posts {
		log.Printf("POST#%d: Author: %s Date: %s", i, post.Author, post.Date)
	}
}

func authenticate(r *http.Request) (*User, error) {
	if cookie, err := r.Cookie("session"); err == nil {
		var user User
		DB.Joins("JOIN sessions ON sessions.user_id = users.id AND sessions.token = ? AND sessions.deleted_at IS NULL", cookie.Value).Omit("password").First(&user)
		if user.ID != 0 {
			return &user, nil
		}
	}
	return nil, errors.New("i could not recognize you, please check your username and password")
}

func render(filename string, w http.ResponseWriter, r *http.Request, data map[string]interface{}) {
	fm := template.FuncMap{
		// formatters
		"safe": func(value interface{}) template.HTML {
			return template.HTML(fmt.Sprint(value))
		},
		"date": func(date time.Time) template.HTML {
			return template.HTML(date.Format("Jan 2, 2006, 3:04 PM"))
		},
		"course": func(course Course) template.HTML {
			return template.HTML(fmt.Sprintf("%s | %s | %s | %v", course.CRN, course.Code, course.Title, course.Lectures))
		},
		// helpers
		"pathContains": func(path string) bool {
			return strings.Contains(r.URL.Path, path)
		},
		"coursesContains": func(courses []Course, crn string) bool {
			for _, course := range courses {
				if course.CRN == crn {
					return true
				}
			}
			return false
		},
	}
	tpl := template.Must(template.New(filename).Funcs(fm).ParseFiles("templates/base.gohtml", "templates/"+filename))

	user, _ := r.Context().Value("user").(User)
	initialData := map[string]interface{}{
		"Time": time.Now(),
		"Path": r.URL.Path,
		"User": user,
	}
	if err := mergo.Merge(&initialData, data, mergo.WithOverride); err != nil {
		panic(err)
	}

	if err := tpl.Execute(w, initialData); err != nil {
		log.Printf("failed to render template: %s, error: %v", filename, err)
		panic(err)
	}
}

func jsonResponse(w http.ResponseWriter, statusCode int, err error, data interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(statusCode)

	initialData := map[string]interface{}{}
	if err != nil {
		initialData["successful"] = false
		initialData["error"] = err.Error()
	} else {
		initialData["successful"] = true
	}

	switch data.(type) {
	case map[string]interface{}:
		if err = mergo.Merge(&initialData, data, mergo.WithOverride); err != nil {
			panic(err)
		}
		_ = json.NewEncoder(w).Encode(initialData)
	case nil:
		_ = json.NewEncoder(w).Encode(initialData)
	default:
		_ = json.NewEncoder(w).Encode(data)
	}
}
