package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"resource-management-system/database"
	"resource-management-system/middleware"
	"resource-management-system/models"
)

type PaginatedEmployeeResponse struct {
	Employees  []models.Employee `json:"employees"`
	Total      int64             `json:"total"`
	Page       int               `json:"page"`
	Limit      int               `json:"limit"`
	TotalPages int               `json:"total_pages"`
}

func GetEmployees(c *gin.Context) {
	query := database.DB.Session(&gorm.Session{}).Model(&models.Employee{}).Preload("Group").Preload("Customer")

	// Status filter (Active / Resign / Expiring 3M / All)
	statusFilter := strings.ToLower(c.Query("status"))
	if statusFilter == "resign" {
		query = query.Where("LOWER(status) IN ('resign', 'resigned', 'inactive') OR is_active = ?", false)
	} else if statusFilter == "expiring" || statusFilter == "expiring_3m" {
		now := time.Now()
		threeMonthsLater := now.AddDate(0, 3, 0)
		todayStr := now.Format("2006-01-02")
		threeMonthsStr := threeMonthsLater.Format("2006-01-02")
		query = query.Where("(LOWER(status) = 'active' OR status IS NULL OR status = '') AND (is_active = ? OR is_active IS NULL) AND LOWER(end_contract) != 'permanent' AND end_contract != '' AND end_contract >= ? AND end_contract <= ?", true, todayStr, threeMonthsStr)
	} else if statusFilter == "active" || statusFilter == "" {
		query = query.Where("(LOWER(status) = 'active' OR status IS NULL OR status = '') AND (is_active = ? OR is_active IS NULL)", true)
	} // if "all", do not restrict status

	// Search filter
	search := c.Query("search")
	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(employee_name) LIKE ? OR LOWER(employee_role) LIKE ?", searchPattern, searchPattern)
	}

	// Group filter
	groupID := c.Query("id_group")
	if groupID != "" && groupID != "all" {
		query = query.Where("id_group = ?", groupID)
	}

	// Customer filter
	customerID := c.Query("id_customer")
	if customerID != "" && customerID != "all" {
		if customerID == "bench" {
			query = query.Where("id_customer IS NULL OR id_customer = 0")
		} else {
			query = query.Where("id_customer = ?", customerID)
		}
	}

	// Koefisien filter
	koef := c.Query("koefisien")
	if koef != "" && koef != "all" {
		query = query.Where("koefisien = ?", koef)
	}

	// Total count before pagination (use isolated session to prevent query statement mutation)
	var total int64
	if err := query.Session(&gorm.Session{}).Count(&total).Error; err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	var employees []models.Employee
	orderClause := "id_employee DESC"
	if statusFilter == "expiring" || statusFilter == "expiring_3m" {
		orderClause = "end_contract ASC"
	}

	sortBy := c.Query("sort_by")
	order := strings.ToUpper(c.Query("order"))
	if order != "ASC" && order != "DESC" {
		order = "ASC"
	}

	if sortBy != "" {
		switch sortBy {
		case "employee_name":
			orderClause = "employee_name " + order
		case "employee_role":
			orderClause = "employee_role " + order
		case "status":
			orderClause = "status " + order
		case "end_contract":
			orderClause = "end_contract " + order
		case "last_salary_increment_date":
			orderClause = "last_salary_increment_date " + order
		case "sallary_gross":
			orderClause = "sallary_gross " + order
		case "koefisien":
			orderClause = "koefisien " + order
		case "revenue_nett":
			orderClause = "revenue_nett " + order
		}
	}

	if err := query.Session(&gorm.Session{}).Order(orderClause).Offset(offset).Limit(limit).Find(&employees).Error; err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	if totalPages == 0 {
		totalPages = 1
	}

	middleware.RespondSuccess(c, http.StatusOK, "Employees retrieved successfully", PaginatedEmployeeResponse{
		Employees:  employees,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	})
}

func GetEmployeeByID(c *gin.Context) {
	id := c.Param("id")
	var emp models.Employee
	if err := database.DB.Preload("Group").Preload("Customer").First(&emp, id).Error; err != nil {
		middleware.RespondError(c, http.StatusNotFound, "Not Found", "Employee not found")
		return
	}

	middleware.RespondSuccess(c, http.StatusOK, "Employee detail retrieved", emp)
}

func validateKoefisien(k float64) bool {
	// Koefisien must be in (1.3, 1.4, 1.5)
	return fmt.Sprintf("%.1f", k) == "1.3" || fmt.Sprintf("%.1f", k) == "1.4" || fmt.Sprintf("%.1f", k) == "1.5"
}

func CreateEmployee(c *gin.Context) {
	var emp models.Employee
	if err := c.ShouldBindJSON(&emp); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Invalid employee payload: "+err.Error())
		return
	}

	if emp.EmployeeName == "" || emp.EmployeeRole == "" || emp.StartContract == "" || emp.EndContract == "" {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "employee_name, employee_role, start_contract, and end_contract are required")
		return
	}

	if !validateKoefisien(emp.Koefisien) {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Koefisien must be either 1.3, 1.4, or 1.5")
		return
	}

	if strings.EqualFold(emp.StartContract, "Permanent") || strings.EqualFold(emp.EndContract, "Permanent") || emp.IsPermanent {
		emp.StartContract = "Permanent"
		emp.EndContract = "Permanent"
		emp.IsPermanent = true
	}

	if emp.Status == "" {
		emp.Status = "Active"
	}
	emp.IsActive = (emp.Status != "Resign")

	if err := database.DB.Create(&emp).Error; err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}

	// Preload relationships for response
	database.DB.Preload("Group").Preload("Customer").First(&emp, emp.IDEmployee)

	LogAudit("CREATE", "Employee", fmt.Sprintf("%d", emp.IDEmployee), "Menambahkan karyawan baru: "+emp.EmployeeName+" ("+emp.EmployeeRole+")", fmt.Sprintf(`{"name":"%s","role":"%s","gross":%.2f}`, emp.EmployeeName, emp.EmployeeRole, emp.SallaryGross), "admin", c.ClientIP())

	middleware.RespondSuccess(c, http.StatusCreated, "Employee created successfully", emp)
}

func UpdateEmployee(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Invalid employee ID")
		return
	}

	var emp models.Employee
	if err := database.DB.First(&emp, id).Error; err != nil {
		middleware.RespondError(c, http.StatusNotFound, "Not Found", "Employee not found")
		return
	}

	oldStatus := emp.Status

	var req models.Employee
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Invalid payload: "+err.Error())
		return
	}

	if !validateKoefisien(req.Koefisien) && req.Koefisien != 0 {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Koefisien must be either 1.3, 1.4, or 1.5")
		return
	}

	// Update fields safely
	if req.EmployeeName != "" {
		emp.EmployeeName = req.EmployeeName
	}
	if req.EmployeeRole != "" {
		emp.EmployeeRole = req.EmployeeRole
	}
	if req.Status != "" {
		emp.Status = req.Status
	}
	if req.StartContract != "" {
		emp.StartContract = req.StartContract
	}
	if req.EndContract != "" {
		emp.EndContract = req.EndContract
	}

	if strings.EqualFold(req.StartContract, "Permanent") || strings.EqualFold(req.EndContract, "Permanent") || req.IsPermanent {
		emp.StartContract = "Permanent"
		emp.EndContract = "Permanent"
		emp.IsPermanent = true
	} else {
		emp.IsPermanent = false
	}

	if strings.EqualFold(emp.Status, "Resign") || strings.EqualFold(emp.Status, "Resigned") || strings.EqualFold(emp.Status, "Inactive") {
		emp.IsActive = false
	} else {
		emp.IsActive = true
	}

	emp.IDGroup = req.IDGroup
	emp.IDCustomer = req.IDCustomer
	emp.SallaryGross = req.SallaryGross
	emp.TunjanganPenempatan = req.TunjanganPenempatan
	emp.TunjanganKeahlian = req.TunjanganKeahlian
	emp.LastSalaryIncrementDate = req.LastSalaryIncrementDate
	if req.Koefisien != 0 {
		emp.Koefisien = req.Koefisien
	}
	emp.RevenueNett = req.RevenueNett

	if err := database.DB.Select("*").Save(&emp).Error; err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}

	database.DB.Preload("Group").Preload("Customer").First(&emp, emp.IDEmployee)

	actionType := "UPDATE"
	summaryStr := "Mengubah data karyawan: " + emp.EmployeeName
	if req.Status != "" && req.Status != oldStatus {
		actionType = "STATUS_CHANGE"
		summaryStr = fmt.Sprintf("Mengubah status karyawan %s dari %s menjadi %s", emp.EmployeeName, oldStatus, req.Status)
	}
	LogAudit(actionType, "Employee", fmt.Sprintf("%d", emp.IDEmployee), summaryStr, fmt.Sprintf(`{"name":"%s","status":"%s","gross":%.2f}`, emp.EmployeeName, emp.Status, emp.SallaryGross), "admin", c.ClientIP())

	middleware.RespondSuccess(c, http.StatusOK, "Employee updated successfully", emp)
}

func DeleteEmployee(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Invalid employee ID")
		return
	}

	if err := database.DB.Delete(&models.Employee{}, id).Error; err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}

	LogAudit("DELETE", "Employee", fmt.Sprintf("%d", id), fmt.Sprintf("Menghapus data karyawan ID %d", id), fmt.Sprintf(`{"id":%d}`, id), "admin", c.ClientIP())

	middleware.RespondSuccess(c, http.StatusOK, "Employee deleted successfully", nil)
}
