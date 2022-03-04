package main

import (
	"encoding/json"
	"fmt"
	"github.com/gocolly/colly"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
)

func splitElement(el *colly.HTMLElement, selector string) []string {
	html, err := el.DOM.Find(selector).Html()
	if err != nil {
		panic(err)
	}

	// split by <br/>, then trim spaces
	var items []string
	for _, item := range strings.Split(html, "<br/>") {
		item = strings.TrimSpace(item)
		if item != "" {
			items = append(items, item)
		}
	}

	return items
}

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

func renderTemplate(filename string, wr http.ResponseWriter, data interface{}) {
	fm := template.FuncMap{
		"html": func(value interface{}) template.HTML {
			return template.HTML(fmt.Sprint(value))
		},
	}
	tpl := template.Must(template.New(filename).Funcs(fm).ParseFiles("templates/"+filename, "templates/base.gohtml"))

	if err := tpl.Execute(wr, data); err != nil {
		log.Printf("failed to render template: %s, error: %v", filename, err)
		panic(err)
	}
}
