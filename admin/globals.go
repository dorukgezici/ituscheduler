package admin

import (
	"embed"
	"os"

	"gorm.io/gorm"
)

var (
	DBStr          = os.Getenv("POSTGRES_STR")
	ADMIN_PASSWORD = os.Getenv("ADMIN_PASSWORD")
	DB             *gorm.DB
	//go:embed templates/*
	Templates embed.FS
)
