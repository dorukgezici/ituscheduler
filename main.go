package main

import (
	"fmt"
	"github.com/dorukgezici/ituscheduler-go/app"
	"github.com/dorukgezici/ituscheduler-go/app/auth"
	"github.com/dorukgezici/ituscheduler-go/app/blog"
	"github.com/dorukgezici/ituscheduler-go/app/scheduler"
	"github.com/dorukgezici/ituscheduler-go/app/scraper"
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
	dsn := fmt.Sprintf("host=%s dbname=%s user=%s password=%s port=%d sslmode=disable", app.DBHost, app.DBName, app.DBUser, app.DBPassword, 5432)
	app.DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{CreateBatchSize: 100})
	if err != nil {
		panic(err)
	} else {
		log.Println("Successfully connected to the database at: " + app.DBHost)
	}

	// migrate db
	if err = app.DB.AutoMigrate(&scraper.Major{}, &scraper.Course{}, &scraper.Lecture{}, &scheduler.Schedule{}, &blog.Post{}, &auth.User{}, &auth.Session{}); err != nil {
		panic(err)
	} else {
		log.Println("Successfully auto-migrated the database.")
	}

	// scrape ITU SIS and save to db if data wasn't refreshed within the last hour
	var majors []scraper.Major
	app.DB.Find(&majors, "refreshed_at > ?", time.Now().Add(-time.Hour))

	if len(majors) == 0 {
		scraper.ScrapeMajors(app.DB)

		// scrape courses and lectures of all majors using concurrency
		app.DB.Find(&majors)
		scraper.ScrapeCoursesOfMajors(app.DB, majors)

		log.Printf("%d majors were scraped and saved to db.", len(majors))
	} else {
		log.Println("Majors were refreshed within the last hour, skipped scraping.")
	}

	// load fixtures
	log.Println("Loading fixtures...")
	app.LoadUserFixtures("fixtures/users.json")
	app.LoadPostFixtures("fixtures/posts.json")

	// register handlers
	router := chi.NewRouter()
	router.Use(middleware.Logger)
	router.Use(middleware.Heartbeat("/health"))
	router.Use(middleware.Recoverer)
	// templates
	router.Get("/", app.GetIndex)
	router.Get("/courses/{major}", app.GetCourses)
	router.Get("/info", app.GetInfo)
	router.Get("/login", app.GetLogin)
	router.Post("/login", app.PostLogin)
	router.Get("/register", app.GetRegister)
	router.Post("/register", app.PostRegister)
	router.Get("/logout", app.GetLogout)
	router.Get("/privacy-policy", app.GetPrivacyPolicy)
	// APIs
	//router.GET("/api/majors", getMajors)
	// static files
	router.Get("/favicon.ico", app.GetFavicon)
	router.Get("/ads.txt", app.GetAds)
	router.Handle("/static/*", http.FileServer(http.Dir(".")))

	// run server on 8080
	log.Println("Server is running on: http://localhost:8080")
	log.Fatalln(http.ListenAndServe(":8080", router))
}
