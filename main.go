package main

import (
	"fmt"
	"github.com/gocolly/colly"
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
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err)
	} else {
		fmt.Println("Successfully connected to the database!")
	}

	// initialize scraper
	c := colly.NewCollector()
	c.OnRequest(func(r *colly.Request) {
		r.ResponseCharacterEncoding = "windows-1254"
	})

	// scrape majors and save to db
	scrapeMajors(db, c)

	// get majors, scrape their courses and save to db
	var majors []Major
	db.Find(&majors)
	//db.Limit(1).Find(&majors)
	scrapeCoursesOfMajors(db, c, majors)
}
