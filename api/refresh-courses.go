package handler

import (
	"net/http"

	"github.com/dorukgezici/ituscheduler/crawler"
)

func RefreshCourses(w http.ResponseWriter, r *http.Request) {
	crawler.InitDB()

	if r.Method == "GET" {
		crawler.GetRefreshCourses(w, r)
	} else if r.Method == "POST" {
		crawler.PostRefreshCourses(w, r)
	}
}