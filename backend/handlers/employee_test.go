package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"resource-management-system/database"
	"resource-management-system/middleware"
	"resource-management-system/models"
)

func TestEmployeeHandlers(t *testing.T) {
	setupTestDB()

	r := gin.New()
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		api.GET("/employees", GetEmployees)
		api.GET("/employees/:id", GetEmployeeByID)
		api.POST("/employees", CreateEmployee)
		api.PUT("/employees/:id", UpdateEmployee)
		api.DELETE("/employees/:id", DeleteEmployee)
	}

	authHeader := generateAuthHeader(1, "admin", "Manager")

	t.Run("Get All Employees - Default & Pagination", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/employees?page=1&limit=5", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}

		var resp struct {
			Success bool                      `json:"success"`
			Data    PaginatedEmployeeResponse `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if !resp.Success || len(resp.Data.Employees) == 0 {
			t.Errorf("expected paginated employees, got %+v", resp)
		}
		if resp.Data.Page != 1 || resp.Data.Limit != 5 {
			t.Errorf("pagination params mismatch: page=%d, limit=%d", resp.Data.Page, resp.Data.Limit)
		}
	})

	t.Run("Get Employees - Search Filter", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/employees?search=ahmad", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}

		var resp struct {
			Success bool                      `json:"success"`
			Data    PaginatedEmployeeResponse `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if len(resp.Data.Employees) == 0 {
			t.Errorf("expected at least 1 match for search 'ahmad'")
		}
	})

	t.Run("Get Employees - Filter by Group & Customer & Bench", func(t *testing.T) {
		// Group filter
		reqGrp, _ := http.NewRequest("GET", "/api/employees?id_group=1", nil)
		reqGrp.Header.Set("Authorization", authHeader)
		wGrp := httptest.NewRecorder()
		r.ServeHTTP(wGrp, reqGrp)
		if wGrp.Code != http.StatusOK {
			t.Errorf("expected 200 for group filter, got %d", wGrp.Code)
		}

		// Customer filter
		reqCust, _ := http.NewRequest("GET", "/api/employees?id_customer=1", nil)
		reqCust.Header.Set("Authorization", authHeader)
		wCust := httptest.NewRecorder()
		r.ServeHTTP(wCust, reqCust)
		if wCust.Code != http.StatusOK {
			t.Errorf("expected 200 for customer filter, got %d", wCust.Code)
		}

		// Bench filter
		reqBench, _ := http.NewRequest("GET", "/api/employees?id_customer=bench", nil)
		reqBench.Header.Set("Authorization", authHeader)
		wBench := httptest.NewRecorder()
		r.ServeHTTP(wBench, reqBench)
		if wBench.Code != http.StatusOK {
			t.Errorf("expected 200 for bench filter, got %d", wBench.Code)
		}
	})

	t.Run("Get Employee By ID", func(t *testing.T) {
		var firstEmp models.Employee
		database.DB.First(&firstEmp)

		req, _ := http.NewRequest("GET", fmt.Sprintf("/api/employees/%d", firstEmp.IDEmployee), nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}

		var resp struct {
			Success bool            `json:"success"`
			Data    models.Employee `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if !resp.Success || resp.Data.IDEmployee != firstEmp.IDEmployee {
			t.Errorf("expected employee ID %d, got %+v", firstEmp.IDEmployee, resp)
		}
	})

	t.Run("Get Nonexistent Employee ID", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/employees/99999", nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d", w.Code)
		}
	})

	t.Run("Create Employee Success & Validation", func(t *testing.T) {
		// Test validation: Missing required fields
		invalidBody := map[string]interface{}{
			"employee_name": "",
		}
		bBytes, _ := json.Marshal(invalidBody)
		reqErr, _ := http.NewRequest("POST", "/api/employees", bytes.NewBuffer(bBytes))
		reqErr.Header.Set("Authorization", authHeader)
		reqErr.Header.Set("Content-Type", "application/json")
		wErr := httptest.NewRecorder()
		r.ServeHTTP(wErr, reqErr)

		if wErr.Code != http.StatusBadRequest {
			t.Errorf("expected 400 for empty fields, got %d", wErr.Code)
		}

		// Test validation: Invalid Koefisien (1.8 is not 1.3, 1.4, or 1.5)
		invalidKoef := map[string]interface{}{
			"employee_name":  "Invalid Koef User",
			"employee_role":  "Tester",
			"start_contract": "2026-01-01",
			"end_contract":   "2026-12-31",
			"koefisien":      1.8,
		}
		kBytes, _ := json.Marshal(invalidKoef)
		reqKoef, _ := http.NewRequest("POST", "/api/employees", bytes.NewBuffer(kBytes))
		reqKoef.Header.Set("Authorization", authHeader)
		reqKoef.Header.Set("Content-Type", "application/json")
		wKoef := httptest.NewRecorder()
		r.ServeHTTP(wKoef, reqKoef)

		if wKoef.Code != http.StatusBadRequest {
			t.Errorf("expected 400 for koefisien 1.8, got %d", wKoef.Code)
		}

		// Test successful employee creation
		grpID := uint(1)
		validEmp := models.Employee{
			EmployeeName:        "New Engineer",
			EmployeeRole:        "DevSecOps",
			IDGroup:             &grpID,
			StartContract:       "2026-01-01",
			EndContract:         "2026-12-31",
			SallaryGross:        15000000,
			TunjanganPenempatan: 1000000,
			TunjanganKeahlian:   2000000,
			Koefisien:           1.4,
			RevenueNett:         25000000,
		}
		cBytes, _ := json.Marshal(validEmp)
		req, _ := http.NewRequest("POST", "/api/employees", bytes.NewBuffer(cBytes))
		req.Header.Set("Authorization", authHeader)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201 created, got %d. Body: %s", w.Code, w.Body.String())
		}
	})

	t.Run("Update Employee Success & Validation & 404", func(t *testing.T) {
		updateBody := map[string]interface{}{
			"employee_name": "Ahmad Fauzi Updated",
			"koefisien":     1.5,
		}
		bBytes, _ := json.Marshal(updateBody)

		var firstEmp models.Employee
		database.DB.First(&firstEmp)

		// Successful update on first employee ID
		req, _ := http.NewRequest("PUT", fmt.Sprintf("/api/employees/%d", firstEmp.IDEmployee), bytes.NewBuffer(bBytes))
		req.Header.Set("Authorization", authHeader)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d. Body: %s", w.Code, w.Body.String())
		}

		// Invalid koefisien update
		badKoefBody := map[string]interface{}{
			"koefisien": 2.0,
		}
		bkBytes, _ := json.Marshal(badKoefBody)
		reqBk, _ := http.NewRequest("PUT", fmt.Sprintf("/api/employees/%d", firstEmp.IDEmployee), bytes.NewBuffer(bkBytes))
		reqBk.Header.Set("Authorization", authHeader)
		reqBk.Header.Set("Content-Type", "application/json")
		wBk := httptest.NewRecorder()
		r.ServeHTTP(wBk, reqBk)

		if wBk.Code != http.StatusBadRequest {
			t.Errorf("expected 400 for bad koefisien on update, got %d", wBk.Code)
		}

		// 404 Update
		req404, _ := http.NewRequest("PUT", "/api/employees/99999", bytes.NewBuffer(bBytes))
		req404.Header.Set("Authorization", authHeader)
		req404.Header.Set("Content-Type", "application/json")
		w404 := httptest.NewRecorder()
		r.ServeHTTP(w404, req404)

		if w404.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d", w404.Code)
		}
	})

	t.Run("Delete Employee", func(t *testing.T) {
		var targetEmp models.Employee
		database.DB.Last(&targetEmp)

		req, _ := http.NewRequest("DELETE", fmt.Sprintf("/api/employees/%d", targetEmp.IDEmployee), nil)
		req.Header.Set("Authorization", authHeader)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}
	})
}
