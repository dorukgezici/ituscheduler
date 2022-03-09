package blog

import (
	"gorm.io/gorm"
	"html/template"
)

type Post struct {
	gorm.Model
	Author  string        `json:"author"`
	Date    string        `json:"date"`
	Content template.HTML `json:"content"`
}
