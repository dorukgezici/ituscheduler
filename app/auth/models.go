package auth

import (
	"gorm.io/gorm"
	"time"
)

type User struct {
	gorm.Model
	Email     string `gorm:"unique"`
	Username  string
	Password  string
	FirstName string
	LastName  string
	IsAdmin   bool
	Sessions  []Session
}

type Session struct {
	Token     string `gorm:"primarykey"`
	UserID    uint
	User      User
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}
