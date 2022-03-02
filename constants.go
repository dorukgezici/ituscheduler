package main

import "os"

const (
	SisUrl string = "https://www.sis.itu.edu.tr/TR/ogrenci/ders-programi/ders-programi.php?seviye=LS"
	port   string = "8080"
)

var (
	host     = os.Getenv("ITUSCHEDULER_POSTGRES_HOST")
	dbname   = os.Getenv("ITUSCHEDULER_POSTGRES_NAME")
	user     = os.Getenv("ITUSCHEDULER_POSTGRES_USER")
	password = os.Getenv("ITUSCHEDULER_POSTGRES_PASSWORD")
)
