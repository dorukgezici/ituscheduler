package main

import (
	"github.com/julienschmidt/httprouter"
	"github.com/vcraescu/go-paginator/v2"
	"github.com/vcraescu/go-paginator/v2/adapter"
	"github.com/vcraescu/go-paginator/v2/view"
	"log"
	"net/http"
	"strconv"
)

// templates
func getIndex(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	renderTemplate("index.gohtml", w, nil)
}

func getInfo(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	p := paginator.New(adapter.NewGORMAdapter(db.Model(&Major{}).Order("code")), 25)
	if page, err := strconv.Atoi(r.URL.Query().Get("page")); err == nil {
		p.SetPage(page)
	}

	var majors []Major
	if err := p.Results(&majors); err != nil {
		panic(err)
	}

	renderTemplate("info.gohtml", w, map[string]interface{}{
		"Posts":     posts,
		"Majors":    majors,
		"Paginator": view.New(p),
	})
}

func getPrivacyPolicy(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	renderTemplate("privacy-policy.gohtml", w, nil)
}

// static files
func getFavicon(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	http.ServeFile(w, r, "static/icons/favicon.ico")
}

func getAds(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	http.ServeFile(w, r, "static/ads.txt")
}

// middlewares
func panicHandler(w http.ResponseWriter, r *http.Request, err interface{}) {
	log.Println("PANIC:", r.Method, r.URL.Path, err)
	w.WriteHeader(http.StatusInternalServerError)
}
