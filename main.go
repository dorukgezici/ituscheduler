package main

import (
	"fmt"
	"github.com/dorukgezici/ituscheduler-go/app"
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
	if err = app.DB.AutoMigrate(&app.User{}, &app.Session{}, &app.Major{}, &app.Course{}, &app.Lecture{}, &app.Schedule{}, &app.Post{}); err != nil {
		panic(err)
	} else {
		log.Println("Successfully auto-migrated the database.")
	}

	// scrape ITU SIS and save to db if data wasn't refreshed within the last hour
	var majors []app.Major
	app.DB.Find(&majors, "refreshed_at > ?", time.Now().Add(-time.Hour))

	if len(majors) == 0 {
		app.ScrapeMajors(app.DB)

		// scrape courses and lectures of all majors using concurrency
		app.DB.Find(&majors)
		app.ScrapeCoursesOfMajors(app.DB, majors)

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
	// app
	router.Group(func(r chi.Router) {
		// templates
		r.Use(app.SessionAuth)
		r.Get("/", app.GetIndex)
		r.Post("/", app.PostIndex)
		r.Get("/courses", app.GetMyCourses)
		r.Get("/courses/{major}", app.GetCourses)
		r.Get("/info", app.GetInfo)
		r.Get("/login", app.GetLogin)
		r.Post("/login", app.PostLogin)
		r.Get("/register", app.GetRegister)
		r.Post("/register", app.PostRegister)
		r.Get("/logout", app.GetLogout)
		r.Get("/privacy-policy", app.GetPrivacyPolicy)
		// APIs
		r.Group(func(r chi.Router) {
			r.Use(middleware.AllowContentType("application/x-www-form-urlencoded"))
			r.Use(app.AuthRequired)
			r.Delete("/api/my-courses", app.DeleteMyCourses)
			r.Post("/api/my-courses/{course}", app.PostMyCourse)
			r.Post("/api/my-schedule/{schedule}", app.PostMySchedule)
			r.Post("/api/my-schedule-courses", app.PostMyScheduleCourses)
			r.Get("/api/schedules/{schedule}", app.GetSchedule)
			r.Delete("/api/schedules/{schedule}", app.DeleteSchedule)
			r.Delete("/api/schedule-courses/{course}", app.DeleteScheduleCourse)
		})
		// admin
		r.Group(func(r chi.Router) {
			r.Use(app.AdminRequired)
			r.Get("/admin/populate", app.PopulateDB)
		})
	})
	// static files
	router.Get("/favicon.ico", app.GetFavicon)
	router.Get("/ads.txt", app.GetAds)
	router.Handle("/static/*", http.FileServer(http.Dir(".")))

	// run server on 8080
	log.Println("Server is running on: http://localhost:8080")
	log.Fatalln(http.ListenAndServe(":8080", router))
}
