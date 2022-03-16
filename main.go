package main

import (
	"fmt"
	"github.com/dorukgezici/ituscheduler-go/app"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"log"
	"net/http"
)

func main() {
	// connect to db
	var err error
	dsn := fmt.Sprintf("host=%s dbname=%s user=%s password=%s port=%d sslmode=%s", app.DBHost, app.DBName, app.DBUser, app.DBPassword, 5432, app.DBSSLMode)
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
		r.Get("/share/{username}", app.GetShare)
		r.Get("/login", app.GetLogin)
		r.Post("/login", app.PostLogin)
		r.Get("/register", app.GetRegister)
		r.Post("/register", app.PostRegister)
		r.Get("/logout", app.GetLogout)
		r.Get("/privacy-policy", app.GetPrivacyPolicy)
		// APIs
		r.Route("/api", func(r chi.Router) {
			r.Use(middleware.AllowContentType("application/x-www-form-urlencoded"))
			r.Use(app.AuthRequired)
			r.Delete("/my-courses", app.DeleteMyCourses)
			r.Post("/my-courses/{course}", app.PostMyCourse)
			r.Post("/my-schedule/{schedule}", app.PostMySchedule)
			r.Post("/my-schedule-courses", app.PostMyScheduleCourses)
			r.Get("/schedules/{schedule}", app.GetSchedule)
			r.Delete("/schedules/{schedule}", app.DeleteSchedule)
			r.Delete("/schedule-courses/{course}", app.DeleteScheduleCourse)
		})
		// admin
		r.Route("/admin", func(r chi.Router) {
			r.Use(app.AdminRequired)
			r.Get("/refresh-majors", app.GetRefreshMajors)
			r.Post("/refresh-majors", app.PostRefreshMajors)
			r.Get("/refresh-courses", app.GetRefreshCourses)
			r.Post("/refresh-courses", app.PostRefreshCourses)
			r.Get("/populate-db", app.GetPopulateDB)
			r.Post("/populate-db", app.PostPopulateDB)
		})
	})
	// static files
	router.Get("/favicon.ico", app.GetFavicon)
	router.Get("/ads.txt", app.GetAds)
	router.Handle("/static/*", http.FileServer(http.Dir(".")))

	// run server on PORT
	log.Println("Server is running on: http://localhost:" + app.Port)
	log.Fatalln(http.ListenAndServe(":"+app.Port, router))
}
