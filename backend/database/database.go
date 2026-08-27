package database

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"resource-management-system/models"
)

var DB *gorm.DB

func InitDB() *gorm.DB {
	var err error
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		host := os.Getenv("DB_HOST")
		if host == "" {
			host = "localhost"
		}
		user := os.Getenv("DB_USER")
		if user == "" {
			user = "user"
		}
		dbname := os.Getenv("DB_NAME")
		if dbname == "" {
			dbname = "resource_management_db"
		}
		port := os.Getenv("DB_PORT")
		if port == "" {
			port = "5432"
		}
		sslmode := os.Getenv("DB_SSLMODE")
		if sslmode == "" {
			sslmode = "disable"
		}
		password := os.Getenv("DB_PASSWORD")
		if password != "" {
			dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s", host, user, password, dbname, port, sslmode)
		} else {
			dsn = fmt.Sprintf("host=%s user=%s dbname=%s port=%s sslmode=%s", host, user, dbname, port, sslmode)
		}
	}

	log.Printf("Connecting STRICTLY to PostgreSQL DB with DSN: %s", dsn)
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		log.Fatalf("Fatal Error: Could not connect to local PostgreSQL database: %v", err)
	}

	log.Println("PostgreSQL Database connection established successfully.")
	return DB
}

func SeedData(db *gorm.DB) {
	// Seed Admin User
	var adminCount int64
	db.Model(&models.User{}).Where("username = ?", "admin").Count(&adminCount)
	if adminCount == 0 {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		admin := models.User{
			Username: "admin",
			Password: string(hashedPassword),
			Name:     "Resource Manager",
			Role:     "Manager",
		}
		db.Create(&admin)
		log.Println("Seeded default admin user (admin / admin123)")
	}

	// Seed Viewer User
	var viewerCount int64
	db.Model(&models.User{}).Where("username = ?", "viewer").Count(&viewerCount)
	if viewerCount == 0 {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("viewer123"), bcrypt.DefaultCost)
		viewer := models.User{
			Username: "viewer",
			Password: string(hashedPassword),
			Name:     "Read-Only Viewer",
			Role:     "Viewer",
		}
		db.Create(&viewer)
		log.Println("Seeded default viewer user (viewer / viewer123)")
	}

	// Seed Groups (3 Records)
	db.Exec("DELETE FROM groups")
	groups := []models.Group{
		{IDGroup: 1, GroupName: "AIGEN", BrandName: "AIGEN"},
		{IDGroup: 2, GroupName: "GS", BrandName: "GS"},
		{IDGroup: 3, GroupName: "NFT", BrandName: "NFT"},
	}
	db.Create(&groups)
	log.Println("Seeded 3 groups (AIGEN, GS, NFT)")

	// Seed Customers (12 Records)
	db.Exec("DELETE FROM customers")
	customers := []models.Customer{
		{IDCustomer: 1, CustomerName: "BRI", CustomerStartContract: "2026-01-01", CustomerEndContract: "2026-12-31"},
		{IDCustomer: 2, CustomerName: "Bank BSI", CustomerStartContract: "2026-01-01", CustomerEndContract: "2026-12-31"},
		{IDCustomer: 3, CustomerName: "Bank CIMB", CustomerStartContract: "2026-01-01", CustomerEndContract: "2026-12-31"},
		{IDCustomer: 4, CustomerName: "Bank Indonesia", CustomerStartContract: "2026-01-01", CustomerEndContract: "2026-12-31"},
		{IDCustomer: 5, CustomerName: "Bank Indonesia (Java Developer)", CustomerStartContract: "2026-01-01", CustomerEndContract: "2026-12-31"},
		{IDCustomer: 6, CustomerName: "Bank Jakarta (App Migration)", CustomerStartContract: "2026-07-01", CustomerEndContract: "2026-12-31"},
		{IDCustomer: 7, CustomerName: "Bank Jakarta (Corporat Web)", CustomerStartContract: "2026-01-01", CustomerEndContract: "2026-12-31"},
		{IDCustomer: 8, CustomerName: "Bank Jakarta (MB Vello)", CustomerStartContract: "2026-01-01", CustomerEndContract: "2026-12-31"},
		{IDCustomer: 9, CustomerName: "Bank OCBC", CustomerStartContract: "2026-01-01", CustomerEndContract: "2026-12-31"},
		{IDCustomer: 10, CustomerName: "Bank Permata", CustomerStartContract: "2026-01-01", CustomerEndContract: "2026-12-31"},
		{IDCustomer: 11, CustomerName: "HIBANK", CustomerStartContract: "2026-01-01", CustomerEndContract: "2026-12-31"},
		{IDCustomer: 12, CustomerName: "TELKOMSEL", CustomerStartContract: "2026-01-01", CustomerEndContract: "2026-12-31"},
	}
	db.Create(&customers)
	log.Println("Seeded 12 customers")

	// Seed Employees (53 Records)
	db.Exec("DELETE FROM employees")

	g := func(val uint) *uint { return &val }
	c := func(val uint) *uint { return &val }

	employees := []models.Employee{
		{EmployeeName: "Sukma Aspriliyawan", EmployeeRole: "Webmethods Developer", IDGroup: g(2), IDCustomer: c(2), StartContract: "2026-01-01", EndContract: "2026-09-01", SallaryGross: 8926054.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 0.00, Koefisien: 1.5, RevenueNett: 19765099.10, Status: "Active", IsActive: true},
		{EmployeeName: "Ahri Maulana", EmployeeRole: "Webmethods Developer", IDGroup: g(2), IDCustomer: c(4), StartContract: "2026-01-01", EndContract: "2026-10-11", SallaryGross: 7331379.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 500000.00, Koefisien: 1.4, RevenueNett: 19800000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Rizki Maulana Rajabi", EmployeeRole: "Webmethods Developer", IDGroup: g(2), IDCustomer: c(4), StartContract: "2026-01-01", EndContract: "2027-07-11", SallaryGross: 8400992.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 1000000.00, Koefisien: 1.3, RevenueNett: 19800000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Aldy Suryanto ", EmployeeRole: "Monitoring Engineer", IDGroup: g(1), IDCustomer: c(4), StartContract: "2026-01-01", EndContract: "2027-07-30", SallaryGross: 6800000.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 500000.00, Koefisien: 1.5, RevenueNett: 19800000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Henry Prasetyo", EmployeeRole: "Monitoring Engineer", IDGroup: g(2), IDCustomer: c(4), StartContract: "2026-01-01", EndContract: "2026-10-25", SallaryGross: 6789705.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 500000.00, Koefisien: 1.5, RevenueNett: 19800000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Imron Rosadi ", EmployeeRole: "Monitoring Engineer", IDGroup: g(1), IDCustomer: c(4), StartContract: "2026-01-01", EndContract: "2026-06-16", SallaryGross: 6250884.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 300000.00, Koefisien: 1.4, RevenueNett: 19800000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Ferdy Lasuf Baehaqie", EmployeeRole: "Monitoring Engineer", IDGroup: g(1), IDCustomer: c(4), StartContract: "2026-01-01", EndContract: "2026-08-05", SallaryGross: 8200000.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 1000000.00, Koefisien: 1.4, RevenueNett: 19800000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Rifki Ridha", EmployeeRole: "Backend Developer", IDGroup: g(2), IDCustomer: c(3), StartContract: "2026-01-01", EndContract: "2027-02-05", SallaryGross: 8300000.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 500000.00, Koefisien: 1.4, RevenueNett: 22000000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Dominikus Andrean", EmployeeRole: "Database Administrator", IDGroup: g(2), IDCustomer: c(1), StartContract: "2026-01-01", EndContract: "2026-07-20", SallaryGross: 8926054.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 500000.00, Koefisien: 1.4, RevenueNett: 17000000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Satria Pandega", EmployeeRole: "Middle Backend Engineer ", IDGroup: g(1), IDCustomer: c(3), StartContract: "2026-01-01", EndContract: "2026-07-14", SallaryGross: 6789705.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 0.00, Koefisien: 1.4, RevenueNett: 22000000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Ida Ayu Prima Utami Anissa Wijayanti", EmployeeRole: "Junior Quality Assurance", IDGroup: g(1), IDCustomer: c(1), StartContract: "2026-01-01", EndContract: "2026-07-14", SallaryGross: 6789705.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 0.00, Koefisien: 1.4, RevenueNett: 15000000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Dwi Candra Maulana", EmployeeRole: "Junior Quality Assurance", IDGroup: g(1), IDCustomer: c(1), StartContract: "2026-01-01", EndContract: "2026-07-14", SallaryGross: 6789705.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 0.00, Koefisien: 1.4, RevenueNett: 15000000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Alif Athallah M", EmployeeRole: "Middle Backend", IDGroup: g(2), IDCustomer: c(5), StartContract: "2026-01-01", EndContract: "2030-12-31", SallaryGross: 10000000.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 0.00, Koefisien: 1.4, RevenueNett: 22000000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Fendi Gunawan", EmployeeRole: "Infrastructure Engineer", IDGroup: g(1), IDCustomer: c(6), StartContract: "2026-07-01", EndContract: "2027-01-27", SallaryGross: 10750000.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 4000000.00, Koefisien: 1.4, RevenueNett: 32000000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Yuniar Fitria Hendrawati", EmployeeRole: "Middle Quality Assurance", IDGroup: g(2), IDCustomer: c(6), StartContract: "2026-07-01", EndContract: "2026-09-03", SallaryGross: 7106040.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 1000000.00, Koefisien: 1.4, RevenueNett: 17747800.00, Status: "Active", IsActive: true},
		{EmployeeName: "Daniel D", EmployeeRole: "Senior Change Management", IDGroup: g(1), IDCustomer: c(6), StartContract: "2026-07-01", EndContract: "2030-12-31", SallaryGross: 32000000.00, TunjanganPenempatan: 0.00, TunjanganKeahlian: 0.00, Koefisien: 1.3, RevenueNett: 50000000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Kahfi Kurnia Aji", EmployeeRole: "Java Backend Developer", IDGroup: g(1), IDCustomer: c(7), StartContract: "2026-01-01", EndContract: "2026-09-13", SallaryGross: 9500000.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 1000000.00, Koefisien: 1.4, RevenueNett: 30500000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Muhammad Daffa Arviano Putra", EmployeeRole: "Java Backend Developer", IDGroup: g(1), IDCustomer: c(7), StartContract: "2026-01-01", EndContract: "2026-09-01", SallaryGross: 10750000.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 500000.00, Koefisien: 1.4, RevenueNett: 30500000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Mohammad Radja Alyfa Amri", EmployeeRole: "Frontend Developer", IDGroup: g(1), IDCustomer: c(7), StartContract: "2026-01-01", EndContract: "2026-09-01", SallaryGross: 10750000.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 1000000.00, Koefisien: 1.4, RevenueNett: 30500000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Della Fitrisia", EmployeeRole: "UI/UX Designer ", IDGroup: g(1), IDCustomer: c(7), StartContract: "2026-01-01", EndContract: "2026-09-01", SallaryGross: 9500000.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 0.00, Koefisien: 1.4, RevenueNett: 29500000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Putra Aditama", EmployeeRole: "UI/UX Designer ", IDGroup: g(1), IDCustomer: c(7), StartContract: "2026-01-01", EndContract: "2026-09-01", SallaryGross: 10750000.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 1000000.00, Koefisien: 1.4, RevenueNett: 29500000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Ersa Andhini", EmployeeRole: "Scrum Master", IDGroup: g(1), IDCustomer: c(7), StartContract: "2026-01-01", EndContract: "2026-09-01", SallaryGross: 10750000.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 2000000.00, Koefisien: 1.4, RevenueNett: 36000000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Nurullah", EmployeeRole: "Scrum Master", IDGroup: g(1), IDCustomer: c(7), StartContract: "2026-01-01", EndContract: "2026-09-08", SallaryGross: 16659228.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 3000000.00, Koefisien: 1.4, RevenueNett: 36000000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Khairul Pandunata", EmployeeRole: "Business Analyst (Middle)", IDGroup: g(1), IDCustomer: c(7), StartContract: "2026-01-01", EndContract: "2026-09-01", SallaryGross: 8441493.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 1000000.00, Koefisien: 1.4, RevenueNett: 30000000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Duwi Sulistianingsih - BA (Internal Aigen)", EmployeeRole: "Business Analyst (Middle)", IDGroup: g(1), IDCustomer: c(7), StartContract: "2026-01-01", EndContract: "2026-09-01", SallaryGross: 5442000.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 1500000.00, Koefisien: 1.4, RevenueNett: 30000000.00, Status: "Active", IsActive: true},
		{EmployeeName: "M Januar", EmployeeRole: "Business Analyst (Middle)", IDGroup: g(1), IDCustomer: c(8), StartContract: "2026-01-01", EndContract: "2026-09-01", SallaryGross: 7210000.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 2000000.00, Koefisien: 1.4, RevenueNett: 30000000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Fadilah Arifki", EmployeeRole: "Fullstack Developer ", IDGroup: g(1), IDCustomer: c(8), StartContract: "2026-01-01", EndContract: "2027-04-01", SallaryGross: 10750000.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 4000000.00, Koefisien: 1.4, RevenueNett: 32000000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Widianingrum", EmployeeRole: "Middle QA Tester/ Engineer", IDGroup: g(1), IDCustomer: c(12), StartContract: "2026-01-01", EndContract: "2030-12-31", SallaryGross: 8926054.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 1500000.00, Koefisien: 1.4, RevenueNett: 18288000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Arrico Hardyanto", EmployeeRole: "Middle BE Engineer", IDGroup: g(1), IDCustomer: c(11), StartContract: "2026-01-01", EndContract: "2027-07-27", SallaryGross: 12524067.00, TunjanganPenempatan: 500000.00, TunjanganKeahlian: 0.00, Koefisien: 1.4, RevenueNett: 21012000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Tahir Shadaqat Ahmad", EmployeeRole: "Middle webMethods", IDGroup: g(1), IDCustomer: c(11), StartContract: "2026-01-01", EndContract: "2030-12-31", SallaryGross: 14297210.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 1000000.00, Koefisien: 1.3, RevenueNett: 35315316.00, Status: "Active", IsActive: true},
		{EmployeeName: "Danu Prasetyo", EmployeeRole: "Mandiri Ansible", IDGroup: g(2), IDCustomer: c(12), StartContract: "2026-01-01", EndContract: "2027-01-26", SallaryGross: 9000000.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 1000000.00, Koefisien: 1.5, RevenueNett: 18500000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Rajesh Rivalda", EmployeeRole: "Monitoring Engineer", IDGroup: g(1), IDCustomer: c(9), StartContract: "2026-01-01", EndContract: "2026-10-07", SallaryGross: 10713395.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 0.00, Koefisien: 1.3, RevenueNett: 20668200.00, Status: "Active", IsActive: true},
		{EmployeeName: "Asep Supriyadi", EmployeeRole: "L2 Security Engineer", IDGroup: g(3), IDCustomer: c(10), StartContract: "2026-01-01", EndContract: "2026-09-23", SallaryGross: 11296249.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 3500000.00, Koefisien: 1.3, RevenueNett: 19291667.00, Status: "Active", IsActive: true},
		{EmployeeName: "Faudzan Adim", EmployeeRole: "Security Engineer", IDGroup: g(3), IDCustomer: c(10), StartContract: "2026-01-01", EndContract: "2026-10-09", SallaryGross: 10056338.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 0.00, Koefisien: 1.3, RevenueNett: 19291667.00, Status: "Active", IsActive: true},
		{EmployeeName: "Yoga Ajiputro Sapakoly", EmployeeRole: "Security Engineer", IDGroup: g(3), IDCustomer: c(10), StartContract: "2026-01-01", EndContract: "2027-01-08", SallaryGross: 10713395.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 0.00, Koefisien: 1.3, RevenueNett: 19291667.00, Status: "Active", IsActive: true},
		{EmployeeName: "Agma Setiawan", EmployeeRole: "Security Engineer", IDGroup: g(3), IDCustomer: c(10), StartContract: "2026-01-01", EndContract: "2026-09-13", SallaryGross: 9482748.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 500000.00, Koefisien: 1.3, RevenueNett: 19291667.00, Status: "Active", IsActive: true},
		{EmployeeName: "Faried Abimanyu Bhakti Nusantara", EmployeeRole: "Security Engineer", IDGroup: g(3), IDCustomer: c(10), StartContract: "2026-01-01", EndContract: "2027-01-20", SallaryGross: 8926054.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 300000.00, Koefisien: 1.3, RevenueNett: 19291667.00, Status: "Active", IsActive: true},
		{EmployeeName: "Sukma Wijaya", EmployeeRole: "Security Engineer", IDGroup: g(3), IDCustomer: c(10), StartContract: "2026-01-01", EndContract: "2027-02-08", SallaryGross: 10056338.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 300000.00, Koefisien: 1.3, RevenueNett: 19291667.00, Status: "Active", IsActive: true},
		{EmployeeName: "Ragil Aria Dewanto", EmployeeRole: "Security Engineer", IDGroup: g(3), IDCustomer: c(10), StartContract: "2026-01-01", EndContract: "2026-08-12", SallaryGross: 11000000.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 1000000.00, Koefisien: 1.3, RevenueNett: 19291667.00, Status: "Active", IsActive: true},
		{EmployeeName: "Deki Tri Rizmawan", EmployeeRole: "Security Engineer", IDGroup: g(3), IDCustomer: c(10), StartContract: "2026-01-01", EndContract: "2026-09-13", SallaryGross: 10056338.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 300000.00, Koefisien: 1.3, RevenueNett: 19291667.00, Status: "Active", IsActive: true},
		{EmployeeName: "Chandra Farizka", EmployeeRole: "Security Engineer", IDGroup: g(3), IDCustomer: c(10), StartContract: "2026-01-01", EndContract: "2026-12-26", SallaryGross: 8405962.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 800000.00, Koefisien: 1.3, RevenueNett: 19291667.00, Status: "Active", IsActive: true},
		{EmployeeName: "Arrumaisha Ruhama Nafisah", EmployeeRole: "Security Engineer", IDGroup: g(3), IDCustomer: c(10), StartContract: "2026-01-01", EndContract: "2027-06-10", SallaryGross: 10700165.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 0.00, Koefisien: 1.3, RevenueNett: 19291667.00, Status: "Active", IsActive: true},
		{EmployeeName: "Nor Alip", EmployeeRole: "Security Engineer", IDGroup: g(3), IDCustomer: c(10), StartContract: "2026-01-01", EndContract: "2027-01-01", SallaryGross: 10713395.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 500000.00, Koefisien: 1.3, RevenueNett: 19291667.00, Status: "Active", IsActive: true},
		{EmployeeName: "Fatma Rahma W", EmployeeRole: "Security Engineer", IDGroup: g(3), IDCustomer: c(10), StartContract: "2026-01-01", EndContract: "2027-01-01", SallaryGross: 6250884.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 1000000.00, Koefisien: 1.3, RevenueNett: 19291667.00, Status: "Active", IsActive: true},
		{EmployeeName: "Moses Tri Xavario", EmployeeRole: "Security Engineer", IDGroup: g(3), IDCustomer: c(10), StartContract: "2026-01-01", EndContract: "2027-01-01", SallaryGross: 5442000.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 500000.00, Koefisien: 1.3, RevenueNett: 19291667.00, Status: "Active", IsActive: true},
		{EmployeeName: "Hafizh Shiba", EmployeeRole: "Security Engineer", IDGroup: g(3), IDCustomer: c(10), StartContract: "2026-01-01", EndContract: "2027-01-01", SallaryGross: 6789705.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 500000.00, Koefisien: 1.3, RevenueNett: 19291667.00, Status: "Active", IsActive: true},
		{EmployeeName: "Falyan Zuril", EmployeeRole: "Devops Engineer", IDGroup: g(1), IDCustomer: c(12), StartContract: "2026-01-01", EndContract: "2026-10-27", SallaryGross: 6500000.00, TunjanganPenempatan: 0.00, TunjanganKeahlian: 0.00, Koefisien: 1.4, RevenueNett: 22000000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Ivan Habibi", EmployeeRole: "Devops Engineer", IDGroup: g(1), IDCustomer: c(12), StartContract: "2026-01-01", EndContract: "2030-12-31", SallaryGross: 11986097.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 0.00, Koefisien: 1.4, RevenueNett: 22000000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Zhiddan P", EmployeeRole: "Infrastructure Engineer", IDGroup: g(1), IDCustomer: c(12), StartContract: "2026-01-01", EndContract: "2030-12-31", SallaryGross: 11986097.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 0.00, Koefisien: 1.4, RevenueNett: 22000000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Tefa Arya G", EmployeeRole: "Infrastructure Engineer", IDGroup: g(1), IDCustomer: c(12), StartContract: "2026-01-01", EndContract: "2030-12-31", SallaryGross: 11986097.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 0.00, Koefisien: 1.4, RevenueNett: 22000000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Zhiddan P (2)", EmployeeRole: "Infrastructure Engineer", IDGroup: g(1), IDCustomer: c(12), StartContract: "2026-01-01", EndContract: "2030-12-31", SallaryGross: 11986097.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 0.00, Koefisien: 1.4, RevenueNett: 22000000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Sutrisno", EmployeeRole: "Devops Engineer", IDGroup: g(1), IDCustomer: c(12), StartContract: "2026-01-01", EndContract: "2026-12-31", SallaryGross: 9482748.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 0.00, Koefisien: 1.4, RevenueNett: 22000000.00, Status: "Active", IsActive: true},
		{EmployeeName: "Saiful W L", EmployeeRole: "Devops Engineer", IDGroup: g(1), IDCustomer: c(12), StartContract: "2026-01-01", EndContract: "2026-12-31", SallaryGross: 11986097.00, TunjanganPenempatan: 1000000.00, TunjanganKeahlian: 0.00, Koefisien: 1.4, RevenueNett: 22000000.00, Status: "Active", IsActive: true},
	}
	db.Create(&employees)
	log.Println("Seeded 53 real employees")

	// Seed Personal Notes
	var personalNotesCount int64
	db.Model(&models.PersonalNote{}).Count(&personalNotesCount)
	if personalNotesCount == 0 {
		db.Exec("DELETE FROM personal_notes")

		f := func(v float64) *float64 { return &v }

		notes := []models.PersonalNote{
			{NetSalary: 4500000.00, TK0K0: nil, K1K2: nil},
			{NetSalary: 5000000.00, TK0K0: f(5154639.00), K1K2: f(5154639.00)},
			{NetSalary: 5500000.00, TK0K0: f(5714895.00), K1K2: f(5670103.00)},
			{NetSalary: 6000000.00, TK0K0: f(6250884.00), K1K2: f(6201773.00)},
			{NetSalary: 6250000.00, TK0K0: f(6528562.00), K1K2: f(6477147.00)},
			{NetSalary: 6500000.00, TK0K0: f(6789705.00), K1K2: f(6753967.00)},
			{NetSalary: 7000000.00, TK0K0: f(7331379.00), K1K2: f(7292698.00)},
			{NetSalary: 7250000.00, TK0K0: nil, K1K2: nil},
			{NetSalary: 7500000.00, TK0K0: f(7855049.00), K1K2: f(7813605.00)},
			{NetSalary: 8000000.00, TK0K0: f(8400992.00), K1K2: f(8334512.00)},
			{NetSalary: 8250000.00, TK0K0: nil, K1K2: nil},
			{NetSalary: 8500000.00, TK0K0: f(8926054.00), K1K2: f(8902389.00)},
			{NetSalary: 9000000.00, TK0K0: nil, K1K2: f(9426059.00)},
			{NetSalary: 9250000.00, TK0K0: nil, K1K2: nil},
			{NetSalary: 9500000.00, TK0K0: f(10056338.00), K1K2: f(9949729.00)},
			{NetSalary: 10000000.00, TK0K0: f(10700165.00), K1K2: f(10529223.00)},
			{NetSalary: 10500000.00, TK0K0: f(11296249.00), K1K2: f(11174727.00)},
			{NetSalary: 12000000.00, TK0K0: f(13047038.00), K1K2: f(12905435.00)},
		}
		db.Create(&notes)
		log.Println("Seeded personal notes reference data (PRD Page 8)")
	}

	// Seed Audit Logs
	var auditCount int64
	db.Model(&models.AuditLog{}).Count(&auditCount)
	if auditCount == 0 {
		logs := []models.AuditLog{
			{Action: "LOGIN", Entity: "Auth", EntityID: "1", Summary: "User Randy Farhan berhasil login ke sistem", Details: `{"username":"admin","role":"Manager"}`, PerformedBy: "admin", IPAddress: "127.0.0.1"},
			{Action: "CREATE", Entity: "Employee", EntityID: "1", Summary: "Menambahkan karyawan baru: Ahmad Fauzi (Senior Backend Engineer)", Details: `{"name":"Ahmad Fauzi","role":"Senior Backend Engineer","customer":"PT Bank Central Asia Tbk","gross_salary":15000000}`, PerformedBy: "admin", IPAddress: "127.0.0.1"},
			{Action: "UPDATE", Entity: "Employee", EntityID: "2", Summary: "Mengubah alokasi penempatan Siti Rahmawati ke PT Bank Central Asia Tbk", Details: `{"field":"id_customer","old":null,"new":1}`, PerformedBy: "admin", IPAddress: "127.0.0.1"},
			{Action: "STATUS_CHANGE", Entity: "Employee", EntityID: "15", Summary: "Mengubah status karyawan Joko Susilo menjadi Resign", Details: `{"old_status":"Active","new_status":"Resign"}`, PerformedBy: "admin", IPAddress: "127.0.0.1"},
			{Action: "CREATE", Entity: "Customer", EntityID: "1", Summary: "Menambahkan customer bank baru: PT Bank Central Asia Tbk", Details: `{"customer_name":"PT Bank Central Asia Tbk","start_contract":"2025-01-01","end_contract":"2027-12-31"}`, PerformedBy: "admin", IPAddress: "127.0.0.1"},
			{Action: "UPDATE", Entity: "PersonalNote", EntityID: "2", Summary: "Memperbarui acuan gaji Net Salary Rp 5.000.000,00", Details: `{"net_salary":5000000,"tk0_k0":5154639,"k1_k2":5154639}`, PerformedBy: "admin", IPAddress: "127.0.0.1"},
		}
		db.Create(&logs)
		log.Println("Seeded initial audit logs")
	}

	SeedAssignmentHistories(db)
}

func SeedAssignmentHistories(db *gorm.DB) {
	months := []string{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"}
	year := 2026

	var employees []models.Employee
	db.Preload("Group").Preload("Customer").Find(&employees)

	for _, emp := range employees {
		if emp.Customer == nil || emp.IDCustomer == nil {
			continue
		}

		isPermanent := emp.IsPermanent || strings.EqualFold(emp.StartContract, "Permanent") || strings.EqualFold(emp.EndContract, "Permanent")

		custStartStr := "1970-01-01"
		custEndStr := "2099-12-31"
		if emp.Customer != nil {
			if emp.Customer.CustomerStartContract != "" {
				custStartStr = emp.Customer.CustomerStartContract
			}
			if emp.Customer.CustomerEndContract != "" {
				custEndStr = emp.Customer.CustomerEndContract
			}
		}

		for mIdx, mName := range months {
			monthNum := mIdx + 1

			mStartStr := fmt.Sprintf("%04d-%02d-01", year, monthNum)
			lastDay := time.Date(year, time.Month(monthNum+1), 0, 0, 0, 0, 0, time.UTC).Day()
			mEndStr := fmt.Sprintf("%04d-%02d-%02d", year, monthNum, lastDay)

			empActive := isPermanent || (emp.StartContract <= mEndStr && emp.EndContract >= mStartStr)
			custActive := custStartStr <= mEndStr && custEndStr >= mStartStr

			if empActive && custActive {
				groupName := "-"
				brandName := "-"
				if emp.Group != nil {
					groupName = emp.Group.GroupName
					if emp.Group.BrandName != "" {
						brandName = emp.Group.BrandName
					} else {
						brandName = emp.Group.GroupName
					}
				}

				var count int64
				db.Model(&models.AssignmentHistory{}).Where("year = ? AND month = ? AND (id_employee = ? OR LOWER(employee_name) = LOWER(?))", year, monthNum, emp.IDEmployee, emp.EmployeeName).Count(&count)
				if count == 0 {
					history := models.AssignmentHistory{
						Year:           year,
						Month:          monthNum,
						MonthName:      mName,
						IDEmployee:     emp.IDEmployee,
						EmployeeName:   emp.EmployeeName,
						EmployeeRole:   emp.EmployeeRole,
						IDCustomer:     emp.IDCustomer,
						CustomerName:   emp.Customer.CustomerName,
						IDGroup:        emp.IDGroup,
						GroupName:      groupName,
						BrandName:      brandName,
						SallaryGross:   emp.SallaryGross,
						StartContract:  emp.StartContract,
						EndContract:    emp.EndContract,
						IsPermanent:    isPermanent,
						EmployeeStatus: emp.Status,
					}
					db.Create(&history)
				}
			}
		}
	}
	log.Println("Seeded assignment histories snapshots for year 2026")
}
