package app

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/gofrs/uuid"
	"github.com/gosimple/slug"
	_ "github.com/gosimple/slug"
	"golang.org/x/oauth2"
	"net/http"
	"os"
	"time"
)

var (
	endpoint = oauth2.Endpoint{
		AuthURL:  "https://www.facebook.com/v13.0/dialog/oauth",
		TokenURL: "https://graph.facebook.com/v13.0/oauth/access_token",
	}
	userUrl = "https://graph.facebook.com/v13.0/me"
	config  = &oauth2.Config{
		RedirectURL:  "http://localhost:8080/oauth/facebook/callback",
		ClientID:     os.Getenv("ITUSCHEDULER_FACEBOOK_CLIENT_ID"),
		ClientSecret: os.Getenv("ITUSCHEDULER_FACEBOOK_CLIENT_SECRET"),
		Scopes:       []string{"email"},
		Endpoint:     endpoint,
	}
)

func OAuthFacebookLogin(w http.ResponseWriter, r *http.Request) {
	// CSRF check - set OAuth state cookie
	state := uuid.Must(uuid.NewV4()).String()
	cookie := http.Cookie{
		Name:    "oauth",
		Value:   state,
		Expires: time.Now().Add(20 * time.Minute),
	}
	http.SetCookie(w, &cookie)

	http.Redirect(w, r, config.AuthCodeURL(state), http.StatusTemporaryRedirect)
}

func OAuthFacebookCallback(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("oauth")
	if err != nil {
		http.Error(w, "oauth cookie required", http.StatusBadRequest)
		return
	}

	// CSRF check - check OAuth state cookie
	if r.FormValue("state") != cookie.Value {
		http.Error(w, "invalid OAuth state", http.StatusForbidden)
		return
	}

	code := r.FormValue("code")
	data, err := getFacebookUserData(code)
	if err != nil {
		http.Error(w, err.Error(), http.StatusTemporaryRedirect)
		return
	}

	var user User
	DB.Model(&user).Where("facebook_id = ? OR email = ?", data.ID, data.Email).FirstOrCreate(&user, User{
		FacebookID: data.ID,
		Username:   slug.Make(data.Name),
		Email:      data.Email,
	})

	// Login
	initSession(w, user)
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

type FacebookUserData struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func getFacebookUserData(code string) (*FacebookUserData, error) {
	token, err := config.Exchange(context.Background(), code)
	if err != nil {
		return nil, fmt.Errorf("failed code exchange: %s", err.Error())
	}

	response, err := http.Get(userUrl + "?fields=id,name,email&access_token=" + token.AccessToken)
	if err != nil {
		return nil, fmt.Errorf("failed getting user info: %s", err.Error())
	}

	var data FacebookUserData
	if err = json.NewDecoder(response.Body).Decode(&data); err != nil {
		return nil, fmt.Errorf("failed read response: %s", err.Error())
	}

	return &data, nil
}
