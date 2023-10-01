package handler

import (
	"net/http"

	"github.com/dorukgezici/ituscheduler/admin"
)

func Login(w http.ResponseWriter, r *http.Request) {
	admin.InitDB()

	if r.Method == "GET" {
		admin.GetLogin(w, r)
	} else if r.Method == "POST" {
		admin.PostLogin(w, r)
	}
}
