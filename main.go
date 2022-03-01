package main

import (
	"fmt"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// load env variables
	err := godotenv.Load(".env")
	if err != nil {
		panic(err)
	}

	// connect to db
	dsn := fmt.Sprintf("host=%s dbname=%s user=%s password=%s port=%d sslmode=disable", host, dbname, user, password, port)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{CreateBatchSize: 100})
	if err != nil {
		panic(err)
	} else {
		fmt.Println("Successfully connected to the database!")
	}

	// scrape majors and save to db
	scrapeMajors(db)

	// get majors, scrape their courses and save to db
	var majors []Major
	db.Find(&majors)
	scrapeCoursesOfMajors(db, majors)
}
