package main

import "github.com/gocolly/colly"

func main() {
	c := colly.NewCollector(
		colly.AllowedDomains("en.wikipedia.org"),
	)
}
