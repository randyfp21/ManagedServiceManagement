package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"resource-management-system/middleware"
)

func TestRevenueHandlers(t *testing.T) {
	setupTestDB()

	r := gin.New()
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		api.GET("/revenue/analysis", GetRevenueAnalysis)
	}

	authHeader := generateAuthHeader(1, "admin", "Manager")

	t.Run("Get Revenue Analysis", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/revenue/analysis", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}

		var resp struct {
			Success bool                    `json:"success"`
			Data    RevenueAnalysisResponse `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if !resp.Success || len(resp.Data.Items) == 0 {
			t.Errorf("expected revenue analysis items, got %+v", resp)
		}
		if resp.Data.TotalRevenueNett == 0 {
			t.Errorf("expected non-zero total revenue, got 0")
		}
	})
}
