package migrations

import (
	"github.com/dorukgezici/ituscheduler-go/app"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"log"
	"time"
)

type DjangoUser struct {
	ID         uint
	DateJoined time.Time
	Username   string
	Email      *string
	Password   *string
}

func (DjangoUser) TableName() string {
	return "scheduler_extendeduser"
}

func MigrateUsers() {
	db := connectToDjangoDB()
	var djangoUsers []DjangoUser
	db.Find(&djangoUsers)
	log.Println("Django User Count:", len(djangoUsers))

	var users []app.User
	for _, djangoUser := range djangoUsers {

		var email *string
		if djangoUser.Email != nil && *djangoUser.Email == "" {
			email = nil
		}
		users = append(users, app.User{
			Model:    gorm.Model{ID: djangoUser.ID, CreatedAt: djangoUser.DateJoined},
			Username: djangoUser.Username,
			Email:    email,
			Password: djangoUser.Password,
		})
	}

	app.DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&users)
}
