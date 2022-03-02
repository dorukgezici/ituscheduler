package main

import (
	"net/http"
)

func index(res http.ResponseWriter, req *http.Request) {
	err := tpl.ExecuteTemplate(res, "index.gohtml", nil)
	if err != nil {
		http.Error(res, err.Error(), http.StatusInternalServerError)
	}
}

func privacyPolicy(res http.ResponseWriter, req *http.Request) {
	err := tpl.ExecuteTemplate(res, "privacy-policy.gohtml", nil)
	if err != nil {
		http.Error(res, err.Error(), http.StatusInternalServerError)
	}
}

// files
func favicon(res http.ResponseWriter, req *http.Request) {
	http.ServeFile(res, req, "static/icons/favicon.ico")
}

func adsTxt(res http.ResponseWriter, req *http.Request) {
	http.ServeFile(res, req, "static/ads.txt")
}
