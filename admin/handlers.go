package admin

import (
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

// auth

func GetLogin(w http.ResponseWriter, r *http.Request) {
	render("login.gohtml", w, r, nil)
}

func PostLogin(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		panic(err)
	}
	username := r.FormValue("username")
	password := r.FormValue("password")

	var user User
	DB.First(&user, "username = ?", username)
	if user.ID == 0 || user.Password == nil {
		render("login.gohtml", w, r, map[string]interface{}{
			"Error": "Authentication failed, please check your username and password.",
		})
		return
	}

	// check password
	if err := bcrypt.CompareHashAndPassword([]byte(*user.Password), []byte(password)); err != nil {
		render("login.gohtml", w, r, map[string]interface{}{
			"Error": "Authentication failed, please check your username and password.",
		})
		return
	}

	startSession(w, user)
	http.Redirect(w, r, "/api", http.StatusSeeOther)
}

func GetLogout(w http.ResponseWriter, r *http.Request) {
	endSession(w, r)
	http.Redirect(w, r, "/api", http.StatusTemporaryRedirect)
}

// admin

func AdminDashboard(w http.ResponseWriter, r *http.Request) {
	user, _ := r.Context().Value("user").(User)
	render("dashboard.gohtml", w, r, map[string]interface{}{"User": user})
}

func GetRefreshMajors(w http.ResponseWriter, r *http.Request) {
	user, _ := r.Context().Value("user").(User)
	render("refresh-majors.gohtml", w, r, map[string]interface{}{"User": user})
}

func PostRefreshMajors(w http.ResponseWriter, r *http.Request) {
	user, _ := r.Context().Value("user").(User)
	ScrapeMajors()
	var majors []Major
	DB.Find(&majors)

	render("refresh-majors.gohtml", w, r, map[string]interface{}{
		"User":   user,
		"Majors": majors,
	})
}

func GetRefreshCourses(w http.ResponseWriter, r *http.Request) {
	user, _ := r.Context().Value("user").(User)
	var majors []Major
	DB.Find(&majors)
	render("refresh-courses.gohtml", w, r, map[string]interface{}{
		"User":   user,
		"Majors": majors,
	})
}

func PostRefreshCourses(w http.ResponseWriter, r *http.Request) {
	user, _ := r.Context().Value("user").(User)
	if err := r.ParseForm(); err != nil {
		panic(err)
	}
	majorCodes := r.PostForm["majorCodes"]

	var majors []Major
	DB.Find(&majors, "code IN (?)", majorCodes)
	ScrapeCoursesOfMajors(majors)
	DB.Find(&majors, "code IN (?)", majorCodes)

	render("refresh-courses.gohtml", w, r, map[string]interface{}{
		"User":        user,
		"Majors":      majors,
		"IsRefreshed": true,
	})
}
