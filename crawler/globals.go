package crawler

import (
	"os"

	"gorm.io/gorm"
)

var (
	DBHost     = os.Getenv("ITUSCHEDULER_POSTGRES_HOST")
	DBName     = os.Getenv("ITUSCHEDULER_POSTGRES_NAME")
	DBUser     = os.Getenv("ITUSCHEDULER_POSTGRES_USER")
	DBPassword = os.Getenv("ITUSCHEDULER_POSTGRES_PASSWORD")
	DBPort     = os.Getenv("ITUSCHEDULER_POSTGRES_PORT")
	DBSSLMode  = os.Getenv("ITUSCHEDULER_POSTGRES_SSLMODE")
	Stage      = os.Getenv("ITUSCHEDULER_STAGE")
	DB         *gorm.DB
)
