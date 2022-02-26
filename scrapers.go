package main

import (
	"github.com/gocolly/colly"
	"gorm.io/gorm"
	"strconv"
	"time"
)

func scrapeMajors(db *gorm.DB, c *colly.Collector) {
	err := db.AutoMigrate(&Major{})
	if err != nil {
		panic(err)
	}

	c.OnHTML("select[name=derskodu]", func(e *colly.HTMLElement) {
		var (
			codes  = e.ChildAttrs("option:nth-child(n+2)", "value")
			majors []Major
		)
		for _, code := range codes {
			majors = append(majors, Major{Code: code})
		}
		db.Create(&majors)
	})

	err = c.Visit(SisUrl)
	if err != nil {
		panic(err)
	}
}

func scrapeCoursesOfMajors(db *gorm.DB, c *colly.Collector, majors []Major) {
	err := db.AutoMigrate(&Course{}, &Lecture{})
	if err != nil {
		panic(err)
	}

	for _, major := range majors {
		<-scrapeCoursesOfMajor(db, c, major)
	}
}

func scrapeCoursesOfMajor(db *gorm.DB, c *colly.Collector, major Major) <-chan bool {
	r := make(chan bool)

	go func() {
		defer close(r)

		c.OnHTML("table.table.table-bordered.table-striped.table-hover.table-responsive", func(e *colly.HTMLElement) {
			e.ForEach("tr:nth-child(n+3)", func(_ int, el *colly.HTMLElement) {
				// scrape and save course to db
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
					Code:             el.ChildText("td:nth-child(2)"),
					Catalogue:        el.ChildAttr("td:nth-child(2)", "href"),
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
				db.Create(&course)

				// scrape and save lectures to db
				var (
					days      = splitLecture(el, "td:nth-child(7)", 0)
					buildings = splitLecture(el, "td:nth-child(6) > a", len(days))
					times     = splitLecture(el, "td:nth-child(8)", len(days))
					rooms     = splitLecture(el, "td:nth-child(9)", len(days))
					lectures  []Lecture
				)
				for i := range days {
					lectures = append(lectures, Lecture{
						Course:   course,
						Building: buildings[i],
						Day:      days[i],
						Time:     times[i],
						Room:     rooms[i],
					})
				}
				db.Create(&lectures)

				// update major.refreshed_at
				db.Model(&major).Update("refreshed_at", time.Now())
			})
		})

		r <- true
	}()

	err := c.Post(SisUrl, map[string]string{"seviye": "LS", "derskodu": major.Code})
	if err != nil {
		panic(err)
	}

	return r
}
