package main

import (
	"github.com/dorukgezici/ituscheduler-go/auth"
	"gorm.io/gorm"
	"html/template"
	"time"
)

type Major struct {
	Code        string `gorm:"primarykey"`
	RefreshedAt time.Time
}

type Course struct {
	MajorCode        string
	Major            Major  `gorm:"foreignKey:MajorCode"`
	CRN              string `gorm:"primarykey"`
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
	CourseCRN string `gorm:"primarykey"`
	Course    Course `gorm:"foreignKey:CourseCRN"`
	Building  string
	Day       string `gorm:"primarykey"`
	Time      string `gorm:"primarykey"`
	Room      string
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

type Schedule struct {
	gorm.Model
	UserID  uint
	User    auth.User
	Courses []Course `gorm:"many2many:schedule_courses;"`
}

type Post struct {
	gorm.Model
	Author  string        `json:"author"`
	Date    string        `json:"date"`
	Content template.HTML `json:"content"`
}
