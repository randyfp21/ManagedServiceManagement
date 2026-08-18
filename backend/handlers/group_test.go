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

func TestGroupHandlers(t *testing.T) {
	setupTestDB()

	r := gin.New()
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		api.GET("/groups", GetGroups)
		api.GET("/groups/:id", GetGroupByID)
		api.POST("/groups", CreateGroup)
		api.PUT("/groups/:id", UpdateGroup)
		api.DELETE("/groups/:id", DeleteGroup)
	}

	authHeader := generateAuthHeader(1, "admin", "Manager")

	t.Run("Get All Groups", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/groups", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}

		var resp struct {
			Success bool             `json:"success"`
			Data    []GroupWithCount `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if !resp.Success || len(resp.Data) == 0 {
			t.Errorf("expected groups data, got %+v", resp)
		}
	})

	t.Run("Get Group By ID", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/groups/1", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}

		var resp struct {
			Success bool         `json:"success"`
			Data    models.Group `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if !resp.Success || resp.Data.IDGroup != 1 {
			t.Errorf("expected group ID 1, got %+v", resp)
		}
	})

	t.Run("Get Nonexistent Group ID", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/groups/99999", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d", w.Code)
		}
	})

	t.Run("Create Group Success & Validation", func(t *testing.T) {
		// Empty payload validation
		invalidBody := map[string]string{"group_name": ""}
		bBytes, _ := json.Marshal(invalidBody)
		reqErr, _ := http.NewRequest("POST", "/api/groups", bytes.NewBuffer(bBytes))
		reqErr.Header.Set("Authorization", authHeader)
		reqErr.Header.Set("Content-Type", "application/json")
		wErr := httptest.NewRecorder()
		r.ServeHTTP(wErr, reqErr)

		if wErr.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d", wErr.Code)
		}

		// Valid creation
		validGroup := models.Group{GroupName: "Cloud Infrastructure Operations"}
		cBytes, _ := json.Marshal(validGroup)
		req, _ := http.NewRequest("POST", "/api/groups", bytes.NewBuffer(cBytes))
		req.Header.Set("Authorization", authHeader)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201, got %d", w.Code)
		}
	})

	t.Run("Update Group Success & 404", func(t *testing.T) {
		updateBody := map[string]string{"group_name": "Renamed Group"}
		bBytes, _ := json.Marshal(updateBody)

		req, _ := http.NewRequest("PUT", "/api/groups/1", bytes.NewBuffer(bBytes))
		req.Header.Set("Authorization", authHeader)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}

		req404, _ := http.NewRequest("PUT", "/api/groups/99999", bytes.NewBuffer(bBytes))
		req404.Header.Set("Authorization", authHeader)
		req404.Header.Set("Content-Type", "application/json")
		w404 := httptest.NewRecorder()
		r.ServeHTTP(w404, req404)

		if w404.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d", w404.Code)
		}
	})

	t.Run("Delete Group", func(t *testing.T) {
		req, _ := http.NewRequest("DELETE", "/api/groups/1", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}
	})
}
