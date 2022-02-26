package main

import (
	"gorm.io/gorm"
	"time"
)

type Major struct {
	gorm.Model
	Code        string `gorm:"unique"`
	RefreshedAt time.Time
}

type Course struct {
	gorm.Model
	MajorID          int
	Major            Major
	CRN              string `gorm:"unique"`
	Code             string
	Catalogue        string
	Title            string
	TeachingMethod   string
	Instructor       string
	Capacity         int
	Enrolled         int
	Reservation      string
	MajorRestriction string
	Prerequisites    string
	ClassRestriction string
}

type Lecture struct {
	gorm.Model
	CourseID int
	Course   Course
	Building string
	Day      string
	Time     string
	Room     string
}
