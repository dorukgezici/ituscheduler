package main

import (
	"fmt"
	"github.com/joho/godotenv"
	"github.com/julienschmidt/httprouter"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"log"
	"net/http"
	"time"
)

func main() {
	// load env variables
	err := godotenv.Load(".env")
	if err != nil {
		panic(err)
	}

	// connect to db
	dsn := fmt.Sprintf("host=%s dbname=%s user=%s password=%s port=%d sslmode=disable", host, dbname, user, password, 5432)
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{CreateBatchSize: 100})
	if err != nil {
		panic(err)
	} else {
		log.Println("Successfully connected to the database at: " + host)
	}

	// migrate db
	if err = db.AutoMigrate(&Major{}, &Course{}, &Lecture{}); err != nil {
		panic(err)
	}

	// scrape ITU SIS and save to db if data wasn't refreshed within the last hour
	var majors []Major
	db.Where("refreshed_at > ?", time.Now().Add(-time.Hour)).Find(&majors)

	if len(majors) == 0 {
		scrapeMajors()

		// scrape courses and lectures of all majors using concurrency
		db.Find(&majors)
		scrapeCoursesOfMajors(majors)

		log.Printf("%d majors were scraped and saved to db.", len(majors))
	} else {
		log.Println("Majors were refreshed within the last hour, skipped scraping.")
	}

	// load fixtures
	loadPostFixtures("fixtures/posts.json", &posts)
	for i, post := range posts {
		log.Printf("POST#%d: Author: %s Date: %s", i, post.Author, post.Date)
	}

	// register handlers
	router := httprouter.New()
	router.PanicHandler = panicHandler
	router.GET("/", getInfo)
	router.GET("/privacy-policy/", getPrivacyPolicy)
	// static files
	router.GET("/favicon.ico", getFavicon)
	router.GET("/ads.txt", getAds)
	router.ServeFiles("/static/*filepath", http.Dir("static"))

	// run server on 8080
	log.Println("Server is running on: http://localhost:8080")
	log.Fatalln(http.ListenAndServe(":8080", router))
}
