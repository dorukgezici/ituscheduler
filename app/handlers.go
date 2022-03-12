package app

import (
	"errors"
	"github.com/go-chi/chi/v5"
	"github.com/gofrs/uuid"
	"github.com/vcraescu/go-paginator/v2"
	"github.com/vcraescu/go-paginator/v2/adapter"
	"github.com/vcraescu/go-paginator/v2/view"
	"gorm.io/gorm"
	"net/http"
	"strconv"
	"time"
)

// templates

func GetIndex(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value("user").(User)
	if ok {
		DB.Preload("Courses.Lectures").Preload("Schedules").Preload("Schedule.Courses.Lectures").Omit("password").First(&user)
	}

	render("index.gohtml", w, r, map[string]interface{}{
		"User":  user,
		"Hours": hours,
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
	schedule := Schedule{}

	_ = DB.Transaction(func(tx *gorm.DB) error {
		tx.Create(&schedule)
		if err := tx.Model(&user).Association("Schedule").Replace(&schedule); err != nil {
			return err
		}
		if err := tx.Model(&user).Association("Schedules").Append(&schedule); err != nil {
			return err
		}
		if err := tx.Model(&schedule).Association("Courses").Append(courses); err != nil {
			return err
		}
		return nil
	})

	DB.Preload("Courses.Lectures").Preload("Schedules").Preload("Schedule.Courses.Lectures").Omit("password").First(&user)

	render("index.gohtml", w, r, map[string]interface{}{
		"User":  user,
		"Hours": hours,
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
	type Day struct {
		NameTr string
		NameEn string
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
		days        = map[string]Day{
			"1": {"Pazartesi", "Monday"},
			"2": {"Salı", "Tuesday"},
			"3": {"Çarşamba", "Wednesday"},
			"4": {"Perşembe", "Thursday"},
			"5": {"Cuma", "Friday"},
		}
		day = days[dayKey]
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
		"Days":        days,
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
	DB.Omit("password").First(&user, "username = ? AND password = ?", username, password)
	if user.ID == 0 {
		render("login.gohtml", w, r, map[string]interface{}{
			"Error": "I could not recognize you, please check your username and password.",
		})
		return
	}

	session := Session{
		Token: uuid.Must(uuid.NewV4()).String(),
		User:  user,
	}
	DB.Create(&session)

	cookie := http.Cookie{
		Name:     "session",
		Value:    session.Token,
		Expires:  time.Now().Add(time.Hour * 24 * 30),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, &cookie)

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
	} else {
		render("register.gohtml", w, r, nil)
	}
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
	DB.Model(&user).Update("schedule_id", scheduleId)
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
	DB.Find(&schedule, user.ScheduleID)
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
	DB.Delete(&schedule)
	jsonResponse(w, http.StatusOK, nil, nil)
}

func DeleteScheduleCourse(w http.ResponseWriter, r *http.Request) {
	var (
		user, _   = r.Context().Value("user").(User)
		courseCrn = chi.URLParam(r, "course")
		course    Course
	)

	DB.Preload("Schedule").Omit("password").First(&user)
	DB.First(&course, courseCrn)
	if course.CRN == "" {
		jsonResponse(w, http.StatusNotFound, errors.New("course not found"), nil)
		return
	}

	if err := DB.Model(&user.Schedule).Association("Courses").Delete(course); err != nil {
		panic(err)
	}
	jsonResponse(w, http.StatusOK, nil, nil)
}

// admin

func PopulateDB(_ http.ResponseWriter, r *http.Request) {
	user, _ := r.Context().Value("user").(User)

	// query 10 courses
	var courses []Course
	DB.Limit(10).Find(&courses)

	// append to user's courses
	_ = DB.Model(&user).Association("Courses").Append(courses)

	// create schedules
	schedules := []Schedule{{}, {}, {}}
	DB.Create(&schedules)

	// set user's schedule
	DB.Model(&user).Update("schedule_id", schedules[0].ID)

	// append to user's schedules
	_ = DB.Model(&user).Association("Schedules").Append(schedules)

	// append to schedule's courses
	for _, schedule := range schedules {
		_ = DB.Model(&schedule).Association("Courses").Append(courses)
	}
}

// static files

func GetFavicon(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/icons/favicon.ico")
}

func GetAds(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/ads.txt")
}
