package app

import (
	"errors"
	"github.com/go-chi/chi/v5"
	"github.com/go-playground/validator/v10"
	"github.com/gofrs/uuid"
	"github.com/saurabh0719/pswHash"
	"github.com/vcraescu/go-paginator/v2"
	"github.com/vcraescu/go-paginator/v2/adapter"
	"github.com/vcraescu/go-paginator/v2/view"
	"github.com/wagslane/go-password-validator"
	"gorm.io/gorm"
	"net/http"
	"strconv"
	"strings"
)

// templates

func GetIndex(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value("user").(User)
	var schedule Schedule

	if ok {
		DB.Preload("Courses.Lectures").Preload("Schedules", func(db *gorm.DB) *gorm.DB {
			return db.Order("id ASC")
		}).Omit("password").First(&user)
		DB.Preload("Courses.Lectures").First(&schedule, "user_id = ? AND is_selected = true", user.ID)
	}

	render("index.gohtml", w, r, map[string]interface{}{
		"User":     user,
		"Schedule": schedule,
		"Hours":    hourSlots,
	})
}

func PostIndex(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		panic(err)
	}
	crns := r.PostForm["courses"]

	var courses []Course
	DB.Find(&courses, "crn IN (?)", crns)

	user, _ := r.Context().Value("user").(User)
	schedule := Schedule{UserID: user.ID, IsSelected: true}

	_ = DB.Transaction(func(tx *gorm.DB) error {
		tx.Model(&Schedule{}).Where(schedule).Update("is_selected", false)
		tx.Create(&schedule)
		if err := tx.Model(&schedule).Association("Courses").Append(courses); err != nil {
			return err
		}
		return nil
	})

	DB.Preload("Courses.Lectures").Preload("Schedules", func(db *gorm.DB) *gorm.DB {
		return db.Order("id ASC")
	}).Omit("password").First(&user)
	DB.Preload("Courses.Lectures").First(&schedule)

	render("index.gohtml", w, r, map[string]interface{}{
		"User":     user,
		"Schedule": schedule,
		"Hours":    hourSlots,
	})
}

func GetMyCourses(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value("user").(User)
	if ok && user.MajorCode != nil {
		http.Redirect(w, r, "/courses/"+*user.MajorCode, http.StatusSeeOther)
	} else {
		http.Redirect(w, r, "/courses/BLG", http.StatusSeeOther)
	}
}

func GetCourses(w http.ResponseWriter, r *http.Request) {
	type CourseCode struct {
		Code string
	}

	var (
		user, ok    = r.Context().Value("user").(User)
		majorCode   = chi.URLParam(r, "major")
		courseCode  = CourseCode{r.URL.Query().Get("code")}
		dayKey      = r.URL.Query().Get("day")
		majors      []Major
		major       Major
		courseCodes []CourseCode
		courses     []Course
		day         = daySlots[dayKey]
	)

	DB.Order("code").Find(&majors)
	DB.First(&major, "code = ?", majorCode)

	if ok {
		DB.Preload("Courses").Omit("password").First(&user)
		DB.Model(&user).Update("major_code", majorCode)
	}

	DB.Model(&Course{}).Distinct("code").Order("code").Find(&courseCodes, "major_code = ?", majorCode)

	// query courses and lectures
	q := DB.Model(&Course{}).Preload("Lectures").Order("code").Where("major_code = ?", majorCode)
	if courseCode.Code != "" {
		q = q.Where("code = ?", courseCode.Code)
	}
	if dayKey != "" {
		q = q.Joins("JOIN lectures ON lectures.course_crn = courses.crn AND day = ?", day.NameTr)
	}
	q.Find(&courses)

	render("courses.gohtml", w, r, map[string]interface{}{
		"User":        user,
		"Majors":      majors,
		"Major":       major,
		"CourseCodes": courseCodes,
		"CourseCode":  courseCode,
		"Courses":     courses,
		"Days":        daySlots,
		"Day":         day,
	})
}

func GetInfo(w http.ResponseWriter, r *http.Request) {
	var (
		userCount     int64
		scheduleCount int64
		courseCount   int64
		posts         []Post
	)
	DB.Model(&User{}).Count(&userCount)
	DB.Model(Schedule{}).Count(&scheduleCount)
	DB.Model(Course{}).Count(&courseCount)
	DB.Find(&posts)

	p := paginator.New(adapter.NewGORMAdapter(DB.Model(&Major{}).Order("code")), 25)
	if page, err := strconv.Atoi(r.URL.Query().Get("page")); err == nil {
		p.SetPage(page)
	}

	var majors []Major
	if err := p.Results(&majors); err != nil {
		panic(err)
	}

	render("info.gohtml", w, r, map[string]interface{}{
		"UserCount":     userCount,
		"ScheduleCount": scheduleCount,
		"CourseCount":   courseCount,
		"Posts":         posts,
		"Majors":        majors,
		"Paginator":     view.New(p),
	})
}

func GetShare(w http.ResponseWriter, r *http.Request) {
	username := chi.URLParam(r, "username")
	var schedule Schedule

	DB.Preload("User", func(tx *gorm.DB) *gorm.DB {
		return tx.Omit("password")
	}).Preload("Courses.Lectures").Joins("JOIN users ON users.id = schedules.user_id AND users.username = ?", username).First(&schedule)

	render("share.gohtml", w, r, map[string]interface{}{
		"Schedule": schedule,
		"Hours":    hourSlots,
	})
}

func GetLogin(w http.ResponseWriter, r *http.Request) {
	if _, ok := r.Context().Value("user").(User); ok {
		http.Redirect(w, r, "/", http.StatusSeeOther)
	} else {
		render("login.gohtml", w, r, nil)
	}
}

func PostLogin(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		panic(err)
	}
	username := r.FormValue("username")
	password := r.FormValue("password")

	var user User
	DB.First(&user, "username = ?", username)
	if user.ID == 0 || user.Password == nil || !pswHash.Verify(password, *user.Password) {
		render("login.gohtml", w, r, map[string]interface{}{
			"Error": "Authentication failed, please check your username and password.",
		})
		return
	}

	StartSession(w, user)
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func GetRegister(w http.ResponseWriter, r *http.Request) {
	if _, ok := r.Context().Value("user").(User); ok {
		http.Redirect(w, r, "/", http.StatusSeeOther)
	} else {
		render("register.gohtml", w, r, nil)
	}
}

func PostRegister(w http.ResponseWriter, r *http.Request) {
	if _, ok := r.Context().Value("user").(User); ok {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	if err := r.ParseForm(); err != nil {
		panic(err)
	}
	var (
		username  = r.FormValue("username")
		email     = r.FormValue("email")
		password  = r.FormValue("password1")
		password2 = r.FormValue("password2")
	)

	var user User
	DB.First(&user, "username = ?", username)
	if user.ID != 0 {
		render("register.gohtml", w, r, map[string]interface{}{
			"Error": "This username is already taken.",
		})
		return
	}

	if strings.HasSuffix(email, "@itu.edu.tr") == false {
		render("register.gohtml", w, r, map[string]interface{}{
			"Error": "Please enter a valid ITU email address.",
		})
		return
	}

	if password != password2 {
		render("register.gohtml", w, r, map[string]interface{}{
			"Error": "The passwords you entered do not match.",
		})
		return
	}

	err := passwordvalidator.Validate(password, 40)
	if err != nil {
		render("register.gohtml", w, r, map[string]interface{}{
			"Error": err.Error(),
		})
		return
	}

	encodedPassword := pswHash.Encode(password, []byte(uuid.Must(uuid.NewV4()).String()), 320000)
	user = User{Username: username, Email: &email, Password: &encodedPassword}
	validate := validator.New()
	if err = validate.Struct(user); err != nil {
		render("register.gohtml", w, r, map[string]interface{}{
			"Error": err.Error(),
		})
		return
	}

	DB.Create(&user)
	StartSession(w, user)
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func GetLogout(w http.ResponseWriter, r *http.Request) {
	if cookie, err := r.Cookie("session"); err == nil {
		// delete cookie
		cookie.MaxAge = -1
		http.SetCookie(w, cookie)

		// delete session from db
		DB.Delete(&Session{}, "token = ?", cookie.Value)
	}

	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func GetPrivacyPolicy(w http.ResponseWriter, r *http.Request) {
	render("privacy-policy.gohtml", w, r, nil)
}

// APIs

func DeleteMyCourses(w http.ResponseWriter, r *http.Request) {
	user, _ := r.Context().Value("user").(User)

	if err := DB.Model(&user).Association("Courses").Clear(); err != nil {
		panic(err)
	}
	jsonResponse(w, http.StatusOK, nil, nil)
}

func PostMyCourse(w http.ResponseWriter, r *http.Request) {
	var (
		user, _   = r.Context().Value("user").(User)
		courseCrn = chi.URLParam(r, "course")
		course    Course
	)

	DB.First(&course, courseCrn)
	if course.CRN == "" {
		jsonResponse(w, http.StatusNotFound, errors.New("course not found"), nil)
		return
	}

	var userCourses []Course
	if err := DB.Model(&user).Association("Courses").Find(&userCourses); err != nil {
		panic(err)
	}

	alreadyExists := false
	for _, userCourse := range userCourses {
		if userCourse.CRN == course.CRN {
			alreadyExists = true
			break
		}
	}

	if alreadyExists {
		// remove course from user's courses
		if err := DB.Model(&user).Association("Courses").Delete(course); err != nil {
			panic(err)
		}
	} else {
		// add course to user's courses
		if err := DB.Model(&user).Association("Courses").Append(&course); err != nil {
			panic(err)
		}
	}

	jsonResponse(w, http.StatusOK, nil, nil)
}

func PostMySchedule(w http.ResponseWriter, r *http.Request) {
	var (
		user, _    = r.Context().Value("user").(User)
		scheduleId = chi.URLParam(r, "schedule")
	)

	q := DB.Model(&Schedule{}).Where("user_id = ?", user.ID)
	q.Update("is_selected", false)
	q.Where("id = ?", scheduleId).Update("is_selected", true)

	jsonResponse(w, http.StatusOK, nil, nil)
}

func PostMyScheduleCourses(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		panic(err)
	}
	crns := r.PostForm["courses"]

	var courses []Course
	DB.Find(&courses, "crn IN (?)", crns)

	user, _ := r.Context().Value("user").(User)
	var schedule Schedule
	DB.First(&schedule, "user_id = ? AND is_selected = true", user.ID)
	_ = DB.Model(&schedule).Association("Courses").Append(&courses)

	jsonResponse(w, http.StatusOK, nil, nil)
}

func GetSchedule(w http.ResponseWriter, r *http.Request) {
	var (
		scheduleId = chi.URLParam(r, "schedule")
		schedule   Schedule
	)
	DB.Preload("Courses.Lectures").Select("id").First(&schedule, scheduleId)
	jsonResponse(w, http.StatusOK, nil, schedule)
}

func DeleteSchedule(w http.ResponseWriter, r *http.Request) {
	var (
		scheduleId = chi.URLParam(r, "schedule")
		schedule   Schedule
	)
	DB.Select("id").First(&schedule, scheduleId)
	DB.Model(&schedule).Update("is_selected", false)
	DB.Delete(&schedule)
	jsonResponse(w, http.StatusOK, nil, nil)
}

func DeleteScheduleCourse(w http.ResponseWriter, r *http.Request) {
	var (
		user, _   = r.Context().Value("user").(User)
		courseCrn = chi.URLParam(r, "course")
		course    Course
		schedule  Schedule
	)

	DB.First(&course, courseCrn)
	if course.CRN == "" {
		jsonResponse(w, http.StatusNotFound, errors.New("course not found"), nil)
		return
	}

	DB.First(&schedule, "user_id = ? AND is_selected = true", user.ID)
	if err := DB.Model(&schedule).Association("Courses").Delete(course); err != nil {
		panic(err)
	}
	jsonResponse(w, http.StatusOK, nil, nil)
}

// admin

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

func GetPopulateDB(w http.ResponseWriter, r *http.Request) {
	render("populate-db.gohtml", w, r, nil)
}

func PostPopulateDB(w http.ResponseWriter, r *http.Request) {
	user, _ := r.Context().Value("user").(User)

	// query 10 courses
	var courses []Course
	DB.Limit(10).Find(&courses)

	// append to user's courses
	_ = DB.Model(&user).Association("Courses").Append(courses)

	// create schedules
	schedules := []Schedule{{UserID: user.ID, IsSelected: false}, {UserID: user.ID, IsSelected: false}, {UserID: user.ID, IsSelected: false}}
	DB.Create(&schedules)

	// append to schedule's courses
	for _, schedule := range schedules {
		_ = DB.Model(&schedule).Association("Courses").Append(courses)
	}

	http.Redirect(w, r, "/", http.StatusSeeOther)
}

// static files

func GetFavicon(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/icons/favicon.ico")
}

func GetAds(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/ads.txt")
}
