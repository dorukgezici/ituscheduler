package main

import (
	"fmt"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"html/template"
	"log"
	"net/http"
	"strconv"
	"time"
)

var db *gorm.DB
var tpl *template.Template

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

	// get majors which were refreshed within the last hour from db
	var majors []Major
	db.Where("refreshed_at > ?", time.Now().Add(-time.Hour)).Find(&majors)

	if len(majors) == 0 {
		// scrape majors from ITU SIS
		scrapeMajors()

		// scrape courses and lectures of all majors
		db.Find(&majors)
		scrapeCoursesOfMajors(majors)

		log.Println(strconv.Itoa(len(majors)) + " majors were scraped and saved to db.")
	} else {
		log.Println("Majors were refreshed within the last hour, skipped scraping.")
	}

	// parse templates
	tpl, err = template.ParseGlob("templates/*.gohtml")
	if err != nil {
		log.Fatalln(err)
	}

	// register handlers
	http.HandleFunc("/", index)
	http.HandleFunc("/privacy-policy/", privacyPolicy)
	// static files
	http.HandleFunc("/favicon.ico", favicon)
	http.HandleFunc("/ads.txt", adsTxt)
	http.Handle("/static/", http.FileServer(http.Dir(".")))

	// run server on `port`
	log.Println("Server is running on: http://localhost:" + port)
	log.Fatalln(http.ListenAndServe(":"+port, nil))
}
