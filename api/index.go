package handler

import (
	"net/http"

	"github.com/dorukgezici/ituscheduler/admin"
)

func AdminDashboard(w http.ResponseWriter, r *http.Request) {
	fn := func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			admin.AdminDashboard(w, r)
		}
	}

	admin.AuthHandler(http.HandlerFunc(fn)).ServeHTTP(w, r)
}
