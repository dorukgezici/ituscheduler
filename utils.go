package main

import (
	"github.com/gocolly/colly"
	"strings"
)

func splitElement(el *colly.HTMLElement, selector string) []string {
	html, err := el.DOM.Find(selector).Html()
	if err != nil {
		panic(err)
	}

	// split by <br/>, then trim spaces
	var items []string
	for _, item := range strings.Split(html, "<br/>") {
		item = strings.TrimSpace(item)
		if item != "" {
			items = append(items, item)
		}
	}

	return items
}
