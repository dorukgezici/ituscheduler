package main

import (
	"github.com/julienschmidt/httprouter"
	"log"
	"net/http"
)

// templates
func getIndex(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	renderTemplate("index.gohtml", w, nil)
}

func getInfo(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	renderTemplate("info.gohtml", w, map[string]interface{}{
		"Posts": posts,
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
