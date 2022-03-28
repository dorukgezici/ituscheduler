package migrations

import (
	"gorm.io/gorm"
)

type DjangoUserOAuth struct {
	UID      string
	UserID   uint
	Provider string
}

func (DjangoUserOAuth) TableName() string {
	return "social_auth_usersocialauth"
}

func MigrateUserAssociations(db *gorm.DB) {
	djangoDb := connectToDjangoDB()
	var userAssociations []DjangoUserOAuth
	djangoDb.Find(&userAssociations)

	for _, userAssociation := range userAssociations {
		q := db.Model(&User{}).Where("id = ?", userAssociation.UserID)

		if userAssociation.Provider == "facebook" {
			q.Update("facebook_id", userAssociation.UID)
		} else if userAssociation.Provider == "twitter" {
			q.Update("twitter_id", userAssociation.UID)
		}
	}
}
