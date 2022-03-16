package app

import (
	"gorm.io/gorm"
	"os"
)

var (
	Port       = os.Getenv("PORT")
	DBHost     = os.Getenv("ITUSCHEDULER_POSTGRES_HOST")
	DBName     = os.Getenv("ITUSCHEDULER_POSTGRES_NAME")
	DBUser     = os.Getenv("ITUSCHEDULER_POSTGRES_USER")
	DBPassword = os.Getenv("ITUSCHEDULER_POSTGRES_PASSWORD")
	DBSSLMode  = os.Getenv("ITUSCHEDULER_POSTGRES_SSLMODE")
	DB         *gorm.DB
)

type Day struct {
	NameTr string
	NameEn string
}
type Hour struct {
	Time      string
	TimeStart uint
	TimeEnd   uint
}

var (
	daySlots = map[string]Day{
		"1": {"Pazartesi", "Monday"},
		"2": {"Salı", "Tuesday"},
		"3": {"Çarşamba", "Wednesday"},
		"4": {"Perşembe", "Thursday"},
		"5": {"Cuma", "Friday"},
	}
	hourSlots = []Hour{
		{"8:30-9:29", 830, 929},
		{"9:30-10:29", 930, 1029},
		{"10:30-11:29", 1030, 1129},
		{"11:30-12:29", 1130, 1229},
		{"12:30-13:29", 1230, 1329},
		{"13:30-14:29", 1330, 1429},
		{"14:30-15:29", 1430, 1529},
		{"15:30-16:29", 1530, 1629},
		{"16:30-17:29", 1630, 1729},
		{"17:30-18:29", 1730, 1829},
	}
)
