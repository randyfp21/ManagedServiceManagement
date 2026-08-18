package database

import (
	"os"
	"testing"

	"resource-management-system/models"
)

func TestInitDB_PostgreSQL(t *testing.T) {
	// Set default environment for PostgreSQL local test
	os.Setenv("DB_HOST", "localhost")
	os.Setenv("DB_PORT", "5432")
	os.Setenv("DB_USER", "user")
	os.Setenv("DB_NAME", "resource_management_db")
	os.Setenv("DB_SSLMODE", "disable")

	db := InitDB()
	if db == nil {
		t.Fatalf("InitDB returned nil for PostgreSQL connection")
	}

	// Verify PostgreSQL tables are migrated and populated
	var userCount int64
	db.Model(&models.User{}).Count(&userCount)
	if userCount == 0 {
		t.Errorf("Expected seeded users in PostgreSQL, got 0")
	}

	var groupCount int64
	db.Model(&models.Group{}).Count(&groupCount)
	if groupCount == 0 {
		t.Errorf("Expected seeded groups in PostgreSQL, got 0")
	}

	var customerCount int64
	db.Model(&models.Customer{}).Count(&customerCount)
	if customerCount == 0 {
		t.Errorf("Expected seeded customers in PostgreSQL, got 0")
	}

	var employeeCount int64
	db.Model(&models.Employee{}).Count(&employeeCount)
	if employeeCount == 0 {
		t.Errorf("Expected seeded employees in PostgreSQL, got 0")
	}

	var assignmentHistoriesCount int64
	db.Model(&models.AssignmentHistory{}).Count(&assignmentHistoriesCount)
	if assignmentHistoriesCount == 0 {
		t.Errorf("Expected seeded assignment histories in PostgreSQL, got 0")
	}
}

func TestSeedData_Idempotent(t *testing.T) {
	db := InitDB()
	if db == nil {
		t.Fatalf("Failed to initialize PostgreSQL DB for idempotency test")
	}

	// Call SeedData twice to ensure idempotency
	SeedData(db)
	SeedData(db)

	var userCount int64
	db.Model(&models.User{}).Count(&userCount)
	if userCount < 1 {
		t.Errorf("Expected at least 1 admin user, got %d", userCount)
	}

	var groupCount int64
	db.Model(&models.Group{}).Count(&groupCount)
	if groupCount < 3 {
		t.Errorf("Expected at least 3 groups, got %d", groupCount)
	}
}
