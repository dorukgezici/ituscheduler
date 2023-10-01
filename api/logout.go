package handler

import (
	"net/http"

	"github.com/dorukgezici/ituscheduler/admin"
)

func Logout(w http.ResponseWriter, r *http.Request) {
	admin.InitDB()

	if r.Method == "GET" {
		admin.GetLogout(w, r)
	}
}
