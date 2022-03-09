package scraper

import (
	"github.com/dorukgezici/ituscheduler-go/app"
	"github.com/gocolly/colly"
	"gorm.io/gorm/clause"
	"strconv"
	"time"
)

const sisUrl string = "https://www.sis.itu.edu.tr/TR/ogrenci/ders-programi/ders-programi.php?seviye=LS"

func ScrapeMajors() {
	c := initializeCollector()

	c.OnHTML("select[name=derskodu]", func(e *colly.HTMLElement) {
		var (
			codes  = e.ChildAttrs("option:nth-child(n+2)", "value")
			majors []Major
		)
		for _, code := range codes {
			majors = append(majors, Major{Code: code})
		}
		app.DB.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "code"}},
			DoNothing: true,
		}).Create(&majors)
	})

	err := c.Visit(sisUrl)
	if err != nil {
		panic(err)
	}
}

type Result struct {
	Major    Major
	Courses  []Course
	Lectures []Lecture
}

func ScrapeCoursesOfMajors(majors []Major) {
	majorsLength := len(majors)
	channel := make(chan Result, majorsLength)

	for _, major := range majors {
		go scrapeCoursesOfMajor(major, channel)
	}

	for i := 0; i < majorsLength; i++ {
		result := <-channel

		// create or update (upsert) courses and lectures
		app.DB.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "crn"}},
			UpdateAll: true,
		}).Create(&result.Courses)

		app.DB.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "course_crn"}, {Name: "day"}, {Name: "time"}},
			UpdateAll: true,
		}).Create(&result.Lectures)

		// update major.refreshed_at
		app.DB.Model(&result.Major).Update("refreshed_at", time.Now())
	}
}

func scrapeCoursesOfMajor(major Major, channel chan Result) {
	var (
		c        = initializeCollector()
		courses  []Course
		lectures []Lecture
	)

	c.OnHTML("table.table.table-bordered.table-striped.table-hover.table-responsive", func(e *colly.HTMLElement) {
		e.ForEach("tr:nth-child(n+3)", func(_ int, el *colly.HTMLElement) {
			// scrape course
			capacity, err := strconv.Atoi(el.ChildText("td:nth-child(10)"))
			if err != nil {
				capacity = 0
			}
			enrolled, err := strconv.Atoi(el.ChildText("td:nth-child(11)"))
			if err != nil {
				enrolled = 0
			}

			course := Course{
				Major:            major,
				CRN:              el.ChildText("td:nth-child(1)"),
				Code:             el.ChildText("td:nth-child(2) > a"),
				Catalogue:        el.ChildAttr("td:nth-child(2) > a", "href"),
				Title:            el.ChildText("td:nth-child(3)"),
				TeachingMethod:   el.ChildText("td:nth-child(4)"),
				Instructor:       el.ChildText("td:nth-child(5)"),
				Capacity:         capacity,
				Enrolled:         enrolled,
				Reservation:      el.ChildText("td:nth-child(12)"),
				MajorRestriction: el.ChildText("td:nth-child(13)"),
				Prerequisites:    el.ChildText("td:nth-child(14)"),
				ClassRestriction: el.ChildText("td:nth-child(15)"),
			}
			courses = append(courses, course)

			// scrape lectures
			var (
				buildings = splitElement(el, "td:nth-child(6) > a")
				days      = splitElement(el, "td:nth-child(7)")
				times     = splitElement(el, "td:nth-child(8)")
				rooms     = splitElement(el, "td:nth-child(9)")
				building  string
				timeStr   string
				room      string
			)
			for i, day := range days {
				if i < len(buildings) {
					building = buildings[i]
				} else {
					building = "---"
				}
				if i < len(times) {
					timeStr = times[i]
				} else {
					timeStr = "---"
				}
				if i < len(rooms) {
					room = rooms[i]
				} else {
					room = "---"
				}
				lectures = append(lectures, Lecture{
					Course:   course,
					Building: building,
					Day:      day,
					Time:     timeStr,
					Room:     room,
				})
			}
		})
	})

	err := c.Post(sisUrl, map[string]string{"seviye": "LS", "derskodu": major.Code})
	if err != nil {
		panic(err)
	} else {
		// send scraper result to channel
		channel <- Result{Major: major, Courses: courses, Lectures: lectures}
	}
}
