package main

import (
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
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
	} else {
		log.Println("Successfully auto-migrated the database.")
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
	log.Println("Loading fixtures...")
	loadPostFixtures("fixtures/posts.json", &posts)
	for i, post := range posts {
		log.Printf("POST#%d: Author: %s Date: %s", i, post.Author, post.Date)
	}

	// register handlers
	router := chi.NewRouter()
	router.Use(middleware.Logger)
	router.Use(middleware.Heartbeat("/health"))
	// templates
	router.Get("/", getIndex)
	router.Get("/courses/{major}", getCourses)
	router.Get("/info", getInfo)
	router.Get("/login", getLogin)
	router.Get("/register", getRegister)
	router.Get("/privacy-policy", getPrivacyPolicy)
	// APIs
	//router.GET("/api/majors", getMajors)
	// static files
	router.Get("/favicon.ico", getFavicon)
	router.Get("/ads.txt", getAds)
	router.Handle("/static/*", http.FileServer(http.Dir(".")))

	// run server on 8080
	log.Println("Server is running on: http://localhost:8080")
	log.Fatalln(http.ListenAndServe(":8080", router))
}
