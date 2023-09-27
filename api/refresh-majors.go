package handler

import (
	"net/http"

	"github.com/dorukgezici/ituscheduler/crawler"
)

func RefreshMajors(w http.ResponseWriter, r *http.Request) {
	crawler.InitDB()

	if r.Method == "GET" {
		crawler.GetRefreshMajors(w, r)
	} else if r.Method == "POST" {
		crawler.PostRefreshMajors(w, r)
	}
}
