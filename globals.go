package main

import (
	"gorm.io/gorm"
	"os"
)

var (
	dbHost     = os.Getenv("ITUSCHEDULER_POSTGRES_HOST")
	dbName     = os.Getenv("ITUSCHEDULER_POSTGRES_NAME")
	dbUser     = os.Getenv("ITUSCHEDULER_POSTGRES_USER")
	dbPassword = os.Getenv("ITUSCHEDULER_POSTGRES_PASSWORD")
	db         *gorm.DB
)
