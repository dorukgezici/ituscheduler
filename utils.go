package main

import (
	"github.com/gocolly/colly"
	"strings"
)

func splitLecture(el *colly.HTMLElement, selector string, lectureCount int) []string {
	html, err := el.DOM.Find(selector).Html()
	if err != nil {
		panic(err)
	}

	// split by <br/>, then trim spaces
	var items []string
	for _, item := range strings.Split(html, "<br/>") {
		items = append(items, strings.TrimSpace(item))
	}

	// remove last item if empty
	if items[len(items)-1] == "" {
		items = items[:len(items)-1]
	}

	// avoid index out of range
	if lectureCount > 0 {
		for i := 0; i < (lectureCount - len(items)); i++ {
			items = append(items, "----")
		}
	}

	return items
}
