package admin

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"strings"
	"time"

	"dario.cat/mergo"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitDB() {
	var err error
	dsn := fmt.Sprintf("host=%s dbname=%s user=%s password=%s port=%s sslmode=%s", DBHost, DBName, DBUser, DBPassword, DBPort, DBSSLMode)
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{CreateBatchSize: 100})
	if err != nil {
		panic(err)
	} else {
		log.Println("Successfully connected to the database at: " + DBHost)
	}
}

func AutoMigrateDB() {
	if err := DB.AutoMigrate(&User{}, &Session{}, &Major{}, &Course{}, &Lecture{}, &Schedule{}, &Post{}); err != nil {
		panic(err)
	} else {
		log.Println("Successfully auto-migrated the database.")
	}
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
			str := fmt.Sprintf("%s | %s | %s | %s", course.CRN, course.Code, course.Title, course.Instructor)
			for _, lecture := range course.Lectures {
				str += fmt.Sprintf(" | %s %s %s %s", lecture.Building, lecture.Room, lecture.Day, lecture.Time)
			}
			str += fmt.Sprintf(" | %d/%d", course.Enrolled, course.Capacity)
			return template.HTML(str)
		},
		// helpers
		"increment": func(i int) int {
			return i + 1
		},
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
	tpl := template.Must(template.New(filename).Funcs(fm).ParseFS(Templates, "templates/base.gohtml", "templates/"+filename))

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
