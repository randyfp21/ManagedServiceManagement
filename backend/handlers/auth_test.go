package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"resource-management-system/database"
	"resource-management-system/middleware"
	"resource-management-system/models"
)

func setupTestDB() *gorm.DB {
	gin.SetMode(gin.TestMode)
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("failed to connect to memory database: " + err.Error())
	}

	db.AutoMigrate(&models.User{}, &models.Group{}, &models.Customer{}, &models.PersonalNote{}, &models.Employee{}, &models.AuditLog{}, &models.AssignmentHistory{})
	database.DB = db
	database.SeedData(db)
	return db
}

func generateAuthHeader(userID uint, username, role string) string {
	claims := jwt.MapClaims{
		"user_id":  userID,
		"username": username,
		"role":     role,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, _ := token.SignedString(middleware.JWTSecret)
	return "Bearer " + tokenStr
}

func TestLoginHandler(t *testing.T) {
	setupTestDB()

	r := gin.New()
	r.POST("/api/auth/login", Login)

	t.Run("Successful Login", func(t *testing.T) {
		body := LoginRequest{
			Username: "admin",
			Password: "admin123",
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d. Body: %s", w.Code, w.Body.String())
		}

		var resp struct {
			Success bool          `json:"success"`
			Data    LoginResponse `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if !resp.Success || resp.Data.Token == "" {
			t.Errorf("login failed or token empty: %+v", resp)
		}
	})

	t.Run("Invalid Password", func(t *testing.T) {
		body := LoginRequest{
			Username: "admin",
			Password: "wrongpassword",
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d", w.Code)
		}
	})

	t.Run("Nonexistent User", func(t *testing.T) {
		body := LoginRequest{
			Username: "nonexistentuser",
			Password: "password",
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d", w.Code)
		}
	})

	t.Run("Missing Payload", func(t *testing.T) {
		req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewBufferString("{}"))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d", w.Code)
		}
	})
}

func TestGetMeHandler(t *testing.T) {
	db := setupTestDB()

	r := gin.New()
	r.GET("/api/auth/me", middleware.AuthMiddleware(), GetMe)

	t.Run("Successful GetMe", func(t *testing.T) {
		var admin models.User
		db.First(&admin, "username = ?", "admin")

		req, _ := http.NewRequest("GET", "/api/auth/me", nil)
		req.Header.Set("Authorization", generateAuthHeader(admin.ID, admin.Username, admin.Role))
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d. Body: %s", w.Code, w.Body.String())
		}

		var resp struct {
			Success bool        `json:"success"`
			Data    models.User `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if !resp.Success || resp.Data.Username != "admin" {
			t.Errorf("unexpected user profile data: %+v", resp)
		}
	})

	t.Run("Unauthenticated GetMe", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/auth/me", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d", w.Code)
		}
	})

	t.Run("User Context Missing / User Not Found", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/auth/me", nil)
		req.Header.Set("Authorization", generateAuthHeader(99999, "ghost", "Manager"))
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404 for deleted/nonexistent user, got %d", w.Code)
		}
	})
}

func TestMain(m *testing.M) {
	os.Exit(m.Run())
}
