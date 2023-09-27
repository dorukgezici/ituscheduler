package crawler

import (
	"net/http"
)

func GetRefreshMajors(w http.ResponseWriter, r *http.Request) {
	render("refresh-majors.gohtml", w, r, nil)
}

func PostRefreshMajors(w http.ResponseWriter, r *http.Request) {
	ScrapeMajors()
	var majors []Major
	DB.Find(&majors)

	render("refresh-majors.gohtml", w, r, map[string]interface{}{
		"Majors": majors,
	})
}

func GetRefreshCourses(w http.ResponseWriter, r *http.Request) {
	var majors []Major
	DB.Find(&majors)
	render("refresh-courses.gohtml", w, r, map[string]interface{}{
		"Majors": majors,
	})
}

func PostRefreshCourses(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		panic(err)
	}
	majorCodes := r.PostForm["majorCodes"]

	var majors []Major
	DB.Find(&majors, "code IN (?)", majorCodes)
	ScrapeCoursesOfMajors(majors)
	DB.Find(&majors, "code IN (?)", majorCodes)

	render("refresh-courses.gohtml", w, r, map[string]interface{}{
		"Majors":      majors,
		"IsRefreshed": true,
	})
}
