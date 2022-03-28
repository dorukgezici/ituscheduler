package migrations

import (
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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

type User struct {
	gorm.Model
	Username   string  `gorm:"unique"`
	Email      *string `gorm:"unique"`
	Password   *string
	FacebookID *string `gorm:"unique"`
	TwitterID  *string `gorm:"unique"`
}

func MigrateUsers(db *gorm.DB) {
	djangoDb := connectToDjangoDB()
	var djangoUsers []DjangoUser
	djangoDb.Find(&djangoUsers)

	var users []User
	for _, djangoUser := range djangoUsers {

		var email *string
		if djangoUser.Email != nil && *djangoUser.Email == "" {
			email = nil
		}
		users = append(users, User{
			Model:    gorm.Model{ID: djangoUser.ID, CreatedAt: djangoUser.DateJoined},
			Username: djangoUser.Username,
			Email:    email,
			Password: djangoUser.Password,
		})
	}

	db.Clauses(clause.OnConflict{DoNothing: true}).Create(&users)
}
