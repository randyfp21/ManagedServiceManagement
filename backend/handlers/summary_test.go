package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"resource-management-system/middleware"
)

func TestSummaryHandlers(t *testing.T) {
	setupTestDB()

	r := gin.New()
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		api.GET("/summary/monthly-allocation", GetMonthlySummary)
	}

	authHeader := generateAuthHeader(1, "admin", "Manager")

	t.Run("Get Monthly Summary Matrix", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/summary/monthly-allocation?year=2025", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}

		var resp struct {
			Success bool                  `json:"success"`
			Data    SummaryMatrixResponse `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if !resp.Success || resp.Data.Year != 2025 || len(resp.Data.Rows) == 0 {
			t.Errorf("unexpected summary matrix response: %+v", resp)
		}
		if len(resp.Data.Months) != 12 {
			t.Errorf("expected 12 months in response, got %d", len(resp.Data.Months))
		}
	})
}
