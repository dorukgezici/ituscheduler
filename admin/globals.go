package admin

import (
	"embed"
	"os"

	"gorm.io/gorm"
)

var (
	DBHost     = os.Getenv("POSTGRES_HOST")
	DBPort     = os.Getenv("POSTGRES_PORT")
	DBName     = os.Getenv("POSTGRES_DATABASE")
	DBUser     = os.Getenv("POSTGRES_USER")
	DBPassword = os.Getenv("POSTGRES_PASSWORD")
	DB         *gorm.DB
	//go:embed templates/*
	Templates embed.FS
)
