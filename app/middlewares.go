package app

import (
	"context"
	"net/http"
)

func SessionAuth(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		if user, err := authenticate(r); err == nil {
			r = r.WithContext(context.WithValue(r.Context(), "user", *user))
		} else {
			r = r.WithContext(context.WithValue(r.Context(), "error", err.Error()))
		}
		next.ServeHTTP(w, r)
	}

	return http.HandlerFunc(fn)
}

func AuthRequired(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		_, ok := r.Context().Value("user").(User)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
		}
		next.ServeHTTP(w, r)
	}

	return http.HandlerFunc(fn)
}
