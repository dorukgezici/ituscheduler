package oauth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/dorukgezici/ituscheduler/app"
	"github.com/gofrs/uuid"
	"github.com/gosimple/slug"
	"golang.org/x/oauth2"
)

var facebook = OAuth{
	Config: &oauth2.Config{
		RedirectURL:  os.Getenv("ITUSCHEDULER_URL") + "/oauth/facebook/callback",
		ClientID:     os.Getenv("ITUSCHEDULER_FACEBOOK_CLIENT_ID"),
		ClientSecret: os.Getenv("ITUSCHEDULER_FACEBOOK_CLIENT_SECRET"),
		Scopes:       []string{"email"},
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://www.facebook.com/v13.0/dialog/oauth",
			TokenURL: "https://graph.facebook.com/v13.0/oauth/access_token",
		},
	},
	UserDataURL: "https://graph.facebook.com/v13.0/me",
}

func FacebookLogin(w http.ResponseWriter, r *http.Request) {
	// CSRF check - set OAuth state cookie
	state := uuid.Must(uuid.NewV4()).String()
	cookie := http.Cookie{
		Name:    "oauth",
		Value:   state,
		Expires: time.Now().Add(20 * time.Minute),
	}
	http.SetCookie(w, &cookie)

	http.Redirect(w, r, facebook.Config.AuthCodeURL(state), http.StatusTemporaryRedirect)
}

func FacebookCallback(w http.ResponseWriter, r *http.Request) {
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

	user := getOrCreateFacebookUser(*data)

	// Login
	app.StartSession(w, user)
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

type FacebookUserData struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func getFacebookUserData(code string) (*FacebookUserData, error) {
	token, err := facebook.Config.Exchange(context.Background(), code)
	if err != nil {
		return nil, fmt.Errorf("failed code exchange: %s", err.Error())
	}

	response, err := http.Get(facebook.UserDataURL + "?fields=id,name,email&access_token=" + token.AccessToken)
	if err != nil {
		return nil, fmt.Errorf("failed getting user info: %s", err.Error())
	}

	var data FacebookUserData
	if err = json.NewDecoder(response.Body).Decode(&data); err != nil {
		return nil, fmt.Errorf("failed read response: %s", err.Error())
	}

	return &data, nil
}

func getOrCreateFacebookUser(data FacebookUserData) app.User {
	var user app.User
	app.DB.First(&user, "facebook_id = ?", data.ID)

	if user.ID == 0 {
		var (
			username       = slug.Make(data.Name)
			count    int64 = -1
		)

		for count != 0 {
			app.DB.Model(&app.User{}).Where("username = ?", username).Count(&count)

			if count != 0 {
				username += "-"
			}
		}

		user = app.User{
			FacebookID: &data.ID,
			Username:   username,
			Email:      &data.Email,
		}
		app.DB.Create(&user)
	}

	return user
}
