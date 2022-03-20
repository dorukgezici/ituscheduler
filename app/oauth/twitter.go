package oauth

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/dorukgezici/ituscheduler-go/app"
	"github.com/gofrs/uuid"
	"github.com/gosimple/slug"
	"golang.org/x/oauth2"
	"net/http"
	"os"
	"time"
)

var twitter = OAuth{
	Config: &oauth2.Config{
		RedirectURL:  os.Getenv("ITUSCHEDULER_URL") + "/oauth/twitter/callback",
		ClientID:     os.Getenv("ITUSCHEDULER_TWITTER_CLIENT_ID"),
		ClientSecret: os.Getenv("ITUSCHEDULER_TWITTER_CLIENT_SECRET"),
		Scopes:       []string{"users.read", "tweet.read"},
		Endpoint: oauth2.Endpoint{
			AuthURL:   "https://twitter.com/i/oauth2/authorize",
			TokenURL:  "https://api.twitter.com/2/oauth2/token",
			AuthStyle: oauth2.AuthStyleInHeader,
		},
	},
	UserDataURL: "https://api.twitter.com/2/users/me",
}

func TwitterLogin(w http.ResponseWriter, r *http.Request) {
	// CSRF check - set OAuth state cookie
	state := uuid.Must(uuid.NewV4()).String()
	cookie := http.Cookie{
		Name:    "oauth",
		Value:   state,
		Expires: time.Now().Add(20 * time.Minute),
	}
	http.SetCookie(w, &cookie)

	url := twitter.Config.AuthCodeURL(
		state,
		oauth2.SetAuthURLParam("code_challenge", "challenge"),
		oauth2.SetAuthURLParam("code_challenge_method", "plain"),
	)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func TwitterCallback(w http.ResponseWriter, r *http.Request) {
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
	data, err := getTwitterUserData(code)
	if err != nil {
		http.Error(w, err.Error(), http.StatusTemporaryRedirect)
		return
	}

	var user app.User
	q := app.DB.Model(&user).Where("twitter_id = ?", data.Data.ID)
	q.FirstOrCreate(&user, app.User{
		TwitterID: &data.Data.ID,
		Username:  slug.Make(data.Data.Username),
	})

	// Login
	app.InitSession(w, user)
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

type TwitterUserData struct {
	Data struct {
		ID       string `json:"id"`
		Username string `json:"username"`
	} `json:"data"`
}

func getTwitterUserData(code string) (*TwitterUserData, error) {
	token, err := twitter.Config.Exchange(
		context.Background(),
		code,
		oauth2.SetAuthURLParam("code_verifier", "challenge"),
	)
	if err != nil {
		return nil, fmt.Errorf("failed code exchange: %s", err.Error())
	}

	client := &http.Client{}
	req, err := http.NewRequest("GET", twitter.UserDataURL, nil)
	token.SetAuthHeader(req)
	response, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed getting user info: %s", err.Error())
	}

	var data TwitterUserData
	if err = json.NewDecoder(response.Body).Decode(&data); err != nil {
		return nil, fmt.Errorf("failed read response: %s", err.Error())
	}

	return &data, nil
}
