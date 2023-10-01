package admin

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/gofrs/uuid"
)

func AuthHandler(next http.Handler) http.Handler {
	InitDB()

	fn := func(w http.ResponseWriter, r *http.Request) {
		if user, err := authenticate(r); err == nil {
			r = r.WithContext(context.WithValue(r.Context(), "user", *user))

			if !user.IsAdmin {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			} else {
				next.ServeHTTP(w, r)
			}
		} else {
			http.Redirect(w, r, "/api/login", http.StatusSeeOther)
			return
		}
	}

	return http.HandlerFunc(fn)
}

func authenticate(r *http.Request) (*User, error) {
	if cookie, err := r.Cookie("session"); err == nil {
		var user User
		DB.Joins("JOIN sessions ON sessions.user_id = users.id AND sessions.token = ? AND sessions.deleted_at IS NULL", cookie.Value).Omit("password").First(&user)
		if user.ID != 0 {
			return &user, nil
		}
	}
	return nil, errors.New("i could not recognize you, please check your username and password")
}

func startSession(w http.ResponseWriter, user User) {
	session := Session{
		Token:     uuid.Must(uuid.NewV4()).String(),
		User:      user,
		ExpiresAt: time.Now().Add(time.Hour * 24 * 30),
	}
	DB.Create(&session)

	cookie := http.Cookie{
		Name:     "session",
		Value:    session.Token,
		Expires:  session.ExpiresAt,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, &cookie)
}

func endSession(w http.ResponseWriter, r *http.Request) {
	if cookie, err := r.Cookie("session"); err == nil {
		// delete cookie
		cookie.MaxAge = -1
		http.SetCookie(w, cookie)

		// delete session from db
		DB.Delete(&Session{}, "token = ?", cookie.Value)
	}
}
