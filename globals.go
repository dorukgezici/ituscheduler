package main

import (
	"gorm.io/gorm"
	"os"
)

var (
	host     = os.Getenv("ITUSCHEDULER_POSTGRES_HOST")
	dbname   = os.Getenv("ITUSCHEDULER_POSTGRES_NAME")
	user     = os.Getenv("ITUSCHEDULER_POSTGRES_USER")
	password = os.Getenv("ITUSCHEDULER_POSTGRES_PASSWORD")
	db       *gorm.DB
	posts    []Post
)
