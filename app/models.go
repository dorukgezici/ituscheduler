package app

import (
	"html/template"
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username   string  `gorm:"unique" validate:"required"`
	Email      *string `gorm:"unique" validate:"required,email"`
	Password   *string `validate:"required"`
	IsAdmin    bool
	FacebookID *string `gorm:"unique"`
	TwitterID  *string `gorm:"unique"`
	MajorCode  *string
	Major      Major    `gorm:"foreignKey:MajorCode"`
	Courses    []Course `gorm:"many2many:user_courses_go;"`
	Schedules  []Schedule
	Sessions   []Session
}

type Session struct {
	Token     string `gorm:"primarykey"`
	UserID    uint   `gorm:"not null"`
	User      User   `gorm:"constraint:OnDelete:CASCADE"`
	ExpiresAt time.Time
	CreatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

type Major struct {
	Code        string `gorm:"primarykey"`
	Courses     []Course
	CreatedAt   time.Time
	RefreshedAt time.Time
}

type Course struct {
	CRN              string `gorm:"primarykey"`
	MajorCode        string `gorm:"not null"`
	Major            Major  `gorm:"foreignKey:MajorCode;constraint:OnDelete:CASCADE"`
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
	CourseCRN string `gorm:"uniqueIndex:idx_lecture;not null"`
	Course    Course `gorm:"foreignKey:CourseCRN;constraint:OnDelete:CASCADE"`
	Building  string
	Day       string `gorm:"uniqueIndex:idx_lecture"`
	Time      string `gorm:"uniqueIndex:idx_lecture"`
	TimeStart int
	TimeEnd   int
	Room      string
}

type Schedule struct {
	gorm.Model
	UserID     uint `gorm:"not null"`
	User       User `gorm:"constraint:OnDelete:CASCADE;"`
	IsSelected bool
	Courses    []Course `gorm:"many2many:schedule_courses_go;"`
}

func (Schedule) TableName() string {
	return "schedules_go"
}

type Post struct {
	gorm.Model
	Author  string        `json:"author"`
	Date    string        `json:"date"`
	Content template.HTML `json:"content"`
}
