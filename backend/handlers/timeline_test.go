package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"resource-management-system/middleware"
)

func TestTimelineHandlers(t *testing.T) {
	setupTestDB()

	r := gin.New()
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		api.GET("/timeline/events", GetTimelineEvents)
		api.GET("/v1/bench-timeline", GetBenchTimeline)
	}

	authHeader := generateAuthHeader(1, "admin", "Manager")

	t.Run("Get Timeline Events & Bench List", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/timeline/events", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}

		var resp struct {
			Success bool                  `json:"success"`
			Data    BenchTimelineResponse `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if !resp.Success || len(resp.Data.Data) == 0 {
			t.Errorf("expected timeline events data, got %+v", resp)
		}
	})

	t.Run("Get Bench Timeline V1", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/bench-timeline?year=2026", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}

		var resp struct {
			Success bool                  `json:"success"`
			Data    BenchTimelineResponse `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if !resp.Success || len(resp.Data.Data) == 0 {
			t.Errorf("expected timeline weekly matrix data, got %+v", resp)
		}
	})
}
