package app

import (
	"gorm.io/gorm"
	"os"
)

var (
	DBHost     = os.Getenv("ITUSCHEDULER_POSTGRES_HOST")
	DBName     = os.Getenv("ITUSCHEDULER_POSTGRES_NAME")
	DBUser     = os.Getenv("ITUSCHEDULER_POSTGRES_USER")
	DBPassword = os.Getenv("ITUSCHEDULER_POSTGRES_PASSWORD")
	DB         *gorm.DB
)
