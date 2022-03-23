package migrations

import (
	"github.com/dorukgezici/ituscheduler-go/app"
)

type DjangoUserOAuth struct {
	UID      string
	UserID   uint
	Provider string
}

func (DjangoUserOAuth) TableName() string {
	return "social_auth_usersocialauth"
}

func MigrateUserAssociations() {
	db := connectToDjangoDB()
	var userAssociations []DjangoUserOAuth
	db.Find(&userAssociations)

	for _, userAssociation := range userAssociations {
		q := app.DB.Model(&app.User{}).Where("id = ?", userAssociation.UserID)

		if userAssociation.Provider == "facebook" {
			q.Update("facebook_id", userAssociation.UID)
		} else if userAssociation.Provider == "twitter" {
			q.Update("twitter_id", userAssociation.UID)
		}
	}
}
