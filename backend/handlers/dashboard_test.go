package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"resource-management-system/middleware"
	"resource-management-system/models"
)

func TestDashboardHandlers(t *testing.T) {
	setupTestDB()

	r := gin.New()
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		api.GET("/dashboard/overview", GetDashboardOverview)
		api.GET("/dashboard/customer-distribution", GetCustomerDistribution)
		api.GET("/dashboard/expiring-contracts", GetExpiringContractsAlert)
		api.GET("/dashboard/role-summary", GetRoleSummary)
		api.GET("/dashboard/idle-summary", GetIdleSummary)
	}

	authHeader := generateAuthHeader(1, "admin", "Manager")

	t.Run("Get Dashboard Overview", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/dashboard/overview", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}

		var resp struct {
			Success bool              `json:"success"`
			Data    DashboardOverview `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if !resp.Success || resp.Data.TotalEmployees == 0 {
			t.Errorf("unexpected overview data: %+v", resp)
		}
	})

	t.Run("Get Customer Distribution", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/dashboard/customer-distribution", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}

		var resp struct {
			Success bool                       `json:"success"`
			Data    []CustomerDistributionItem `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if !resp.Success || len(resp.Data) == 0 {
			t.Errorf("unexpected distribution data: %+v", resp)
		}
	})

	t.Run("Get Expiring Contracts Alert", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/dashboard/expiring-contracts", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}

		var resp struct {
			Success bool              `json:"success"`
			Data    []models.Employee `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if !resp.Success {
			t.Errorf("failed to fetch expiring contracts: %+v", resp)
		}
	})

	t.Run("Get Role Summary", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/dashboard/role-summary", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}

		var resp struct {
			Success bool              `json:"success"`
			Data    []RoleSummaryItem `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if !resp.Success || len(resp.Data) == 0 {
			t.Errorf("failed to fetch role summary: %+v", resp)
		}
	})

	t.Run("Get Idle Summary", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/dashboard/idle-summary", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}

		var resp struct {
			Success bool                `json:"success"`
			Data    IdleSummaryResponse `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if !resp.Success {
			t.Errorf("failed to fetch idle summary: %+v", resp)
		}
	})
}
