package oauth

import "golang.org/x/oauth2"

type OAuth struct {
	Config      *oauth2.Config
	UserDataURL string
}
