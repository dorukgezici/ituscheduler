package scheduler

import (
	"github.com/dorukgezici/ituscheduler-go/app/auth"
	"github.com/dorukgezici/ituscheduler-go/app/scraper"
	"gorm.io/gorm"
)

type Schedule struct {
	gorm.Model
	UserID  uint
	User    auth.User
	Courses []scraper.Course `gorm:"many2many:schedule_courses;"`
}
