package main

import (
	"github.com/go-chi/chi/v5"
	"github.com/vcraescu/go-paginator/v2"
	"github.com/vcraescu/go-paginator/v2/adapter"
	"github.com/vcraescu/go-paginator/v2/view"
	"log"
	"net/http"
	"strconv"
)

// templates
func getIndex(w http.ResponseWriter, r *http.Request) {
	renderTemplate("index.gohtml", w, nil)
}

func getCourses(w http.ResponseWriter, r *http.Request) {
	type CourseCode struct {
		Code string
	}
	type Day struct {
		NameTr string
		NameEn string
	}
	var (
		majorCode   = chi.URLParam(r, "major")
		courseCode  = CourseCode{r.URL.Query().Get("code")}
		dayKey      = r.URL.Query().Get("day")
		majors      []Major
		major       Major
		courseCodes []CourseCode
		courses     []Course
		days        = map[string]Day{
			"1": {"Pazartesi", "Monday"},
			"2": {"Salı", "Tuesday"},
			"3": {"Çarşamba", "Wednesday"},
			"4": {"Perşembe", "Thursday"},
			"5": {"Cuma", "Friday"},
		}
		day = days[dayKey]
	)

	db.Order("code").Find(&majors)
	db.Where("code = ?", majorCode).First(&major)

	db.Model(&Course{}).Distinct("code").Order("code").Where("major_code = ?", majorCode).Find(&courseCodes)

	// query courses and lectures
	q := db.Model(&Course{}).Preload("Lectures").Order("code").Where("major_code = ?", majorCode)
	if courseCode.Code != "" {
		q = q.Where("code = ?", courseCode.Code)
	}
	if dayKey != "" {
		q = q.Joins("JOIN lectures ON lectures.course_crn = courses.crn AND day = ?", day.NameTr)
	}
	q.Find(&courses)

	renderTemplate("courses.gohtml", w, map[string]interface{}{
		"Majors":      majors,
		"Major":       major,
		"CourseCodes": courseCodes,
		"CourseCode":  courseCode,
		"Courses":     courses,
		"Days":        days,
		"Day":         day,
	})
}

func getInfo(w http.ResponseWriter, r *http.Request) {
	p := paginator.New(adapter.NewGORMAdapter(db.Model(&Major{}).Order("code")), 25)
	if page, err := strconv.Atoi(r.URL.Query().Get("page")); err == nil {
		p.SetPage(page)
	}

	var majors []Major
	if err := p.Results(&majors); err != nil {
		panic(err)
	}

	renderTemplate("info.gohtml", w, map[string]interface{}{
		"Posts":     posts,
		"Majors":    majors,
		"Paginator": view.New(p),
	})
}

func getLogin(w http.ResponseWriter, r *http.Request) {
	renderTemplate("login.gohtml", w, nil)
}

func getRegister(w http.ResponseWriter, r *http.Request) {
	renderTemplate("register.gohtml", w, nil)
}

func getPrivacyPolicy(w http.ResponseWriter, r *http.Request) {
	renderTemplate("privacy-policy.gohtml", w, nil)
}

// static files
func getFavicon(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/icons/favicon.ico")
}

func getAds(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/ads.txt")
}

// middlewares
func panicHandler(w http.ResponseWriter, r *http.Request, err interface{}) {
	log.Println("PANIC:", r.Method, r.URL.Path, err)
	w.WriteHeader(http.StatusInternalServerError)
}
