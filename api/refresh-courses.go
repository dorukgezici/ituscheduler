package handler

import (
	"net/http"

	"github.com/dorukgezici/ituscheduler/admin"
)

func RefreshCourses(w http.ResponseWriter, r *http.Request) {
	fn := func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			admin.GetRefreshCourses(w, r)
		} else if r.Method == "POST" {
			admin.PostRefreshCourses(w, r)
		}
	}

	admin.AuthHandler(http.HandlerFunc(fn)).ServeHTTP(w, r)
}
