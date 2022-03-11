package app

import (
	"gorm.io/gorm"
	"html/template"
	"time"
)

type User struct {
	gorm.Model
	Email      string `gorm:"unique"`
	Username   string
	Password   string
	FirstName  string
	LastName   string
	IsAdmin    bool
	MajorCode  *string
	Major      Major `gorm:"foreignKey:MajorCode"`
	ScheduleID *uint
	Schedule   Schedule
	Courses    []Course   `gorm:"many2many:user_courses;"`
	Schedules  []Schedule `gorm:"many2many:user_schedules;"`
	Sessions   []Session
}

type Session struct {
	Token     string `gorm:"primarykey"`
	UserID    uint
	User      User
	ExpiresAt time.Time
	CreatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

type Major struct {
	Code        string `gorm:"primarykey"`
	RefreshedAt time.Time
	Courses     []Course
}

type Course struct {
	CRN              string `gorm:"primarykey"`
	MajorCode        string
	Major            Major `gorm:"foreignKey:MajorCode"`
	Code             string
	Catalogue        string
	Title            string
	TeachingMethod   string
	Instructor       string
	Lectures         []Lecture
	Capacity         int
	Enrolled         int
	Reservation      string
	MajorRestriction string
	Prerequisites    string
	ClassRestriction string
	CreatedAt        time.Time
	UpdatedAt        time.Time
	DeletedAt        gorm.DeletedAt `gorm:"index"`
}

type Lecture struct {
	gorm.Model
	CourseCRN string `gorm:"uniqueIndex:idx_lecture"`
	Course    Course `gorm:"foreignKey:CourseCRN"`
	Building  string
	Day       string `gorm:"uniqueIndex:idx_lecture"`
	Time      string `gorm:"uniqueIndex:idx_lecture"`
	Room      string
}

type Schedule struct {
	gorm.Model
	Courses []Course `gorm:"many2many:schedule_courses;"`
}

type Post struct {
	gorm.Model
	Author  string        `json:"author"`
	Date    string        `json:"date"`
	Content template.HTML `json:"content"`
}