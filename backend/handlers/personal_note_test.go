package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"resource-management-system/middleware"
	"resource-management-system/models"
)

func TestPersonalNoteHandlers(t *testing.T) {
	setupTestDB()

	r := gin.New()
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		api.GET("/personal-notes", GetPersonalNotes)
		api.POST("/personal-notes", CreatePersonalNote)
		api.PUT("/personal-notes/:id", UpdatePersonalNote)
		api.DELETE("/personal-notes/:id", DeletePersonalNote)

		api.GET("/v1/personal-notes", GetPersonalNotes)
		api.POST("/v1/personal-notes", CreatePersonalNote)
		api.PUT("/v1/personal-notes/:id", UpdatePersonalNote)
		api.DELETE("/v1/personal-notes/:id", DeletePersonalNote)
	}

	authHeader := generateAuthHeader(1, "admin", "Manager")

	t.Run("Get All Personal Notes", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/personal-notes", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}

		var resp struct {
			Success bool                  `json:"success"`
			Data    []models.PersonalNote `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if !resp.Success || len(resp.Data) == 0 {
			t.Errorf("expected personal notes data, got %+v", resp)
		}
	})

	t.Run("Create Personal Note", func(t *testing.T) {
		f1 := 15000000.0
		f2 := 16000000.0
		newNote := PersonalNoteRequestPayload{
			NetSalary: 14000000.0,
			TK0K0:     &f1,
			K1K2:      &f2,
		}
		bBytes, _ := json.Marshal(newNote)

		req, _ := http.NewRequest("POST", "/api/v1/personal-notes", bytes.NewBuffer(bBytes))
		req.Header.Set("Authorization", authHeader)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201 created, got %d", w.Code)
		}
	})

	t.Run("Update Personal Note Success & 404", func(t *testing.T) {
		fVal := 9900000.0
		updNote := PersonalNoteRequestPayload{
			NetSalary: 8800000.0,
			K1K2:      &fVal,
		}
		bBytes, _ := json.Marshal(updNote)

		req, _ := http.NewRequest("PUT", "/api/v1/personal-notes/1", bytes.NewBuffer(bBytes))
		req.Header.Set("Authorization", authHeader)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}

		req404, _ := http.NewRequest("PUT", "/api/v1/personal-notes/99999", bytes.NewBuffer(bBytes))
		req404.Header.Set("Authorization", authHeader)
		req404.Header.Set("Content-Type", "application/json")
		w404 := httptest.NewRecorder()
		r.ServeHTTP(w404, req404)

		if w404.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d", w404.Code)
		}
	})

	t.Run("Delete Personal Note", func(t *testing.T) {
		req, _ := http.NewRequest("DELETE", "/api/v1/personal-notes/1", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}
	})
}
