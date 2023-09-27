package handler

import (
	"net/http"

	"github.com/dorukgezici/ituscheduler/crawler"
)

func RefreshCourses(w http.ResponseWriter, r *http.Request) {
	crawler.InitDB()
	crawler.GetRefreshCourses(w, r)
}
