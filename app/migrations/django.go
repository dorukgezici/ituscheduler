package migrations

import (
	"fmt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"os"
)

var (
	host     = os.Getenv("ITUSCHEDULER_POSTGRES_DJANGO_HOST")
	name     = os.Getenv("ITUSCHEDULER_POSTGRES_DJANGO_NAME")
	user     = os.Getenv("ITUSCHEDULER_POSTGRES_DJANGO_USER")
	password = os.Getenv("ITUSCHEDULER_POSTGRES_DJANGO_PASSWORD")
	port     = 5432
	sslMode  = "require"
)

func connectToDjangoDB() *gorm.DB {
	dsn := fmt.Sprintf("host=%s dbname=%s user=%s password=%s port=%d sslmode=%s", host, name, user, password, port, sslMode)
	db, err := gorm.Open(postgres.Open(dsn))
	if err != nil {
		panic(err)
	}
	return db
}
