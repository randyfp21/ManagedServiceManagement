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

func TestCustomerHandlers(t *testing.T) {
	setupTestDB()

	r := gin.New()
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		api.GET("/customers", GetCustomers)
		api.GET("/customers/:id", GetCustomerByID)
		api.POST("/customers", CreateCustomer)
		api.PUT("/customers/:id", UpdateCustomer)
		api.DELETE("/customers/:id", DeleteCustomer)
	}

	authHeader := generateAuthHeader(1, "admin", "Manager")

	t.Run("Get All Customers", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/customers", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}

		var resp struct {
			Success bool                `json:"success"`
			Data    []CustomerWithCount `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if !resp.Success || len(resp.Data) == 0 {
			t.Errorf("expected customers data, got %+v", resp)
		}
	})

	t.Run("Get Customer By ID", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/customers/1", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}

		var resp struct {
			Success bool            `json:"success"`
			Data    models.Customer `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if !resp.Success || resp.Data.IDCustomer != 1 {
			t.Errorf("expected customer ID 1, got %+v", resp)
		}
	})

	t.Run("Get Nonexistent Customer ID", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/customers/99999", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d", w.Code)
		}
	})

	t.Run("Create Customer Success & Validation", func(t *testing.T) {
		// Test validation error (missing required fields)
		invalidBody := map[string]string{"customer_name": ""}
		bBytes, _ := json.Marshal(invalidBody)
		reqErr, _ := http.NewRequest("POST", "/api/customers", bytes.NewBuffer(bBytes))
		reqErr.Header.Set("Authorization", authHeader)
		reqErr.Header.Set("Content-Type", "application/json")
		wErr := httptest.NewRecorder()
		r.ServeHTTP(wErr, reqErr)

		if wErr.Code != http.StatusBadRequest {
			t.Errorf("expected 400 for empty customer name, got %d", wErr.Code)
		}

		// Test successful creation
		validCust := models.Customer{
			CustomerName:         "PT New Customer",
			CustomerStartContract: "2026-01-01",
			CustomerEndContract:   "2027-01-01",
		}
		cBytes, _ := json.Marshal(validCust)
		req, _ := http.NewRequest("POST", "/api/customers", bytes.NewBuffer(cBytes))
		req.Header.Set("Authorization", authHeader)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201 created, got %d", w.Code)
		}
	})

	t.Run("Update Customer Success & 404", func(t *testing.T) {
		updateBody := map[string]string{"customer_name": "PT Updated Name"}
		bBytes, _ := json.Marshal(updateBody)

		// Update ID 1
		req, _ := http.NewRequest("PUT", "/api/customers/1", bytes.NewBuffer(bBytes))
		req.Header.Set("Authorization", authHeader)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}

		// Update 9999 (404)
		req404, _ := http.NewRequest("PUT", "/api/customers/99999", bytes.NewBuffer(bBytes))
		req404.Header.Set("Authorization", authHeader)
		req404.Header.Set("Content-Type", "application/json")
		w404 := httptest.NewRecorder()
		r.ServeHTTP(w404, req404)

		if w404.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d", w404.Code)
		}
	})

	t.Run("Delete Customer", func(t *testing.T) {
		req, _ := http.NewRequest("DELETE", "/api/customers/1", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}
	})
}
