package handler

import (
	"net/http"

	"github.com/dorukgezici/ituscheduler/admin"
)

func RefreshMajors(w http.ResponseWriter, r *http.Request) {
	fn := func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			admin.GetRefreshMajors(w, r)
		} else if r.Method == "POST" {
			admin.PostRefreshMajors(w, r)
		}
	}

	admin.AuthHandler(http.HandlerFunc(fn)).ServeHTTP(w, r)
}
