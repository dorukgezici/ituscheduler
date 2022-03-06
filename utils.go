package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"
)

func loadPostFixtures(filename string, posts *[]Post) {
	jsonFile, err := os.Open(filename)
	if err != nil {
		log.Printf("failed to open json file: %s, error: %v", filename, err)
	}

	jsonData, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		log.Printf("failed to read json file, error: %v", err)
	}

	if err = json.Unmarshal(jsonData, posts); err != nil {
		log.Printf("failed to unmarshal json file, error: %v\n", err)
		log.Printf("failed to close jsonFile, error: %s", jsonFile.Close().Error())
	}
}

func renderTemplate(filename string, wr http.ResponseWriter, data map[string]interface{}) {
	fm := template.FuncMap{
		"safe": func(value interface{}) template.HTML {
			return template.HTML(fmt.Sprint(value))
		},
		"date": func(date time.Time) template.HTML {
			return template.HTML(date.Format("Jan 2, 2006, 3:04 PM"))
		},
		"slugify": func(value interface{}) template.HTML {
			return template.HTML(fmt.Sprint(value))
		},
	}
	tpl := template.Must(template.New(filename).Funcs(fm).ParseFiles("templates/base.gohtml", "templates/"+filename))

	if err := tpl.Execute(wr, data); err != nil {
		log.Printf("failed to render template: %s, error: %v", filename, err)
		panic(err)
	}
}
