package handlers

import (
	"encoding/json"
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

type AuditLogResponse struct {
	Logs       []models.AuditLog `json:"logs"`
	Total      int64             `json:"total"`
	Page       int               `json:"page"`
	Limit      int               `json:"limit"`
	TotalPages int               `json:"total_pages"`
	Summary    struct {
		TotalLogs    int64 `json:"total_logs"`
		CreateCount  int64 `json:"create_count"`
		UpdateCount  int64 `json:"update_count"`
		DeleteCount  int64 `json:"delete_count"`
		StatusCount  int64 `json:"status_count"`
		LoginCount   int64 `json:"login_count"`
	} `json:"summary"`
}

func LogAudit(action, entity, entityID, summary, details, performedBy, ip string) {
	if database.DB == nil {
		return
	}
	if performedBy == "" {
		performedBy = "admin"
	}
	if ip == "" {
		ip = "127.0.0.1"
	}

	log := models.AuditLog{
		Action:      action,
		Entity:      entity,
		EntityID:    entityID,
		Summary:     summary,
		Details:     details,
		PerformedBy: performedBy,
		IPAddress:   ip,
		CreatedAt:   time.Now(),
	}
	database.DB.Create(&log)
}

func GetAuditLogs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	query := database.DB.Session(&gorm.Session{}).Model(&models.AuditLog{})

	// Filter Date Range (start_date & end_date)
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	if startDate != "" {
		if tStart, err := time.Parse("2006-01-02", startDate); err == nil {
			query = query.Where("created_at >= ?", tStart)
		}
	}
	if endDate != "" {
		if tEnd, err := time.Parse("2006-01-02", endDate); err == nil {
			// Add 23:59:59 to include full end date
			query = query.Where("created_at <= ?", tEnd.Add(24*time.Hour-time.Second))
		}
	}

	// Filter Action
	action := strings.ToUpper(c.Query("action"))
	if action != "" && action != "ALL" {
		query = query.Where("action = ?", action)
	}

	// Filter Entity
	entity := c.Query("entity")
	if entity != "" && entity != "all" {
		query = query.Where("LOWER(entity) = ?", strings.ToLower(entity))
	}

	// Search Filter
	search := c.Query("search")
	if search != "" {
		sPattern := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(summary) LIKE ? OR LOWER(performed_by) LIKE ? OR LOWER(details) LIKE ?",
			sPattern, sPattern, sPattern)
	}

	var total int64
	query.Count(&total)

	var logs []models.AuditLog
	query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&logs)

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	if totalPages == 0 {
		totalPages = 1
	}

	// Calculate summary metrics
	var totalLogs, createCount, updateCount, deleteCount, statusCount, loginCount int64
	database.DB.Model(&models.AuditLog{}).Count(&totalLogs)
	database.DB.Model(&models.AuditLog{}).Where("action = ?", "CREATE").Count(&createCount)
	database.DB.Model(&models.AuditLog{}).Where("action = ?", "UPDATE").Count(&updateCount)
	database.DB.Model(&models.AuditLog{}).Where("action = ?", "DELETE").Count(&deleteCount)
	database.DB.Model(&models.AuditLog{}).Where("action = ?", "STATUS_CHANGE").Count(&statusCount)
	database.DB.Model(&models.AuditLog{}).Where("action = ?", "LOGIN").Count(&loginCount)

	resp := AuditLogResponse{
		Logs:       logs,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}
	resp.Summary.TotalLogs = totalLogs
	resp.Summary.CreateCount = createCount
	resp.Summary.UpdateCount = updateCount
	resp.Summary.DeleteCount = deleteCount
	resp.Summary.StatusCount = statusCount
	resp.Summary.LoginCount = loginCount

	middleware.RespondSuccess(c, http.StatusOK, "Audit logs retrieved successfully", resp)
}

func SeedSampleAuditLog(c *gin.Context) {
	LogAudit("CREATE", "Employee", fmt.Sprintf("%d", time.Now().Unix()), "Menambahkan data karyawan secara manual", `{"detail":"Sample audit entry"}`, "admin", c.ClientIP())
	middleware.RespondSuccess(c, http.StatusOK, "Sample audit log created", nil)
}

// RevertAuditLog restores an entity state back to prior state or undoes a create/delete operation
func RevertAuditLog(c *gin.Context) {
	id := c.Param("id")
	var auditLog models.AuditLog
	if err := database.DB.First(&auditLog, id).Error; err != nil {
		middleware.RespondError(c, http.StatusNotFound, "Not Found", "Audit log record not found")
		return
	}

	if auditLog.Action == "REVERT" {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Cannot revert a REVERT audit action")
		return
	}

	performedBy := "admin"
	if username, exists := c.Get("username"); exists {
		if uStr, ok := username.(string); ok && uStr != "" {
			performedBy = uStr
		}
	}

	entity := strings.ToLower(auditLog.Entity)
	action := strings.ToUpper(auditLog.Action)

	var revertErr error

	switch entity {
	case "employee":
		revertErr = revertEmployee(action, auditLog, performedBy, c.ClientIP())
	case "group":
		revertErr = revertGroup(action, auditLog, performedBy, c.ClientIP())
	case "customer":
		revertErr = revertCustomer(action, auditLog, performedBy, c.ClientIP())
	case "personalnote", "personal_note":
		revertErr = revertPersonalNote(action, auditLog, performedBy, c.ClientIP())
	default:
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Entity type not supported for automatic revert")
		return
	}

	if revertErr != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", "Gagal melakukan revert: "+revertErr.Error())
		return
	}

	middleware.RespondSuccess(c, http.StatusOK, fmt.Sprintf("Berhasil melakukan revert perubahan %s (ID %s)", auditLog.Entity, auditLog.EntityID), nil)
}

func revertEmployee(action string, log models.AuditLog, performedBy, ip string) error {
	var detailsMap map[string]interface{}
	_ = json.Unmarshal([]byte(log.Details), &detailsMap)

	empID, _ := strconv.Atoi(log.EntityID)

	switch action {
	case "CREATE":
		if empID > 0 {
			var emp models.Employee
			if err := database.DB.First(&emp, empID).Error; err == nil {
				database.DB.Delete(&emp)
				LogAudit("REVERT", "Employee", log.EntityID, fmt.Sprintf("Revert CREATE: Menghapus kembali karyawan %s", emp.EmployeeName), log.Details, performedBy, ip)
				return nil
			}
		}
		return fmt.Errorf("Karyawan ID %s tidak ditemukan untuk di-revert CREATE", log.EntityID)

	case "DELETE":
		var emp models.Employee
		if prevObj, ok := detailsMap["previous"]; ok {
			prevBytes, _ := json.Marshal(prevObj)
			json.Unmarshal(prevBytes, &emp)
		} else {
			json.Unmarshal([]byte(log.Details), &emp)
		}

		if emp.EmployeeName == "" {
			return fmt.Errorf("Snapshot data karyawan tidak ditemukan dalam audit log")
		}

		emp.IDEmployee = 0 // Auto-increment ID baru
		if err := database.DB.Create(&emp).Error; err != nil {
			return err
		}

		database.DB.Preload("Group").Preload("Customer").First(&emp, emp.IDEmployee)
		LogAudit("REVERT", "Employee", fmt.Sprintf("%d", emp.IDEmployee), fmt.Sprintf("Revert DELETE: Mengembalikan data karyawan %s", emp.EmployeeName), log.Details, performedBy, ip)
		return nil

	case "UPDATE", "STATUS_CHANGE":
		if empID == 0 {
			return fmt.Errorf("Invalid Employee ID")
		}

		var emp models.Employee
		if err := database.DB.First(&emp, empID).Error; err != nil {
			return fmt.Errorf("Karyawan ID %d tidak ditemukan di database", empID)
		}

		var prevEmp models.Employee
		if prevObj, ok := detailsMap["previous"]; ok {
			prevBytes, _ := json.Marshal(prevObj)
			json.Unmarshal(prevBytes, &prevEmp)
		} else {
			json.Unmarshal([]byte(log.Details), &prevEmp)
		}

		if prevEmp.EmployeeName != "" {
			emp.EmployeeName = prevEmp.EmployeeName
		}
		if prevEmp.EmployeeRole != "" {
			emp.EmployeeRole = prevEmp.EmployeeRole
		}
		if prevEmp.Status != "" {
			emp.Status = prevEmp.Status
		}
		emp.IsActive = prevEmp.IsActive
		emp.IDGroup = prevEmp.IDGroup
		emp.IDCustomer = prevEmp.IDCustomer
		if prevEmp.StartContract != "" {
			emp.StartContract = prevEmp.StartContract
		}
		if prevEmp.EndContract != "" {
			emp.EndContract = prevEmp.EndContract
		}
		if prevEmp.SallaryGross > 0 {
			emp.SallaryGross = prevEmp.SallaryGross
		}
		emp.TunjanganPenempatan = prevEmp.TunjanganPenempatan
		emp.TunjanganKeahlian = prevEmp.TunjanganKeahlian
		if prevEmp.Koefisien > 0 {
			emp.Koefisien = prevEmp.Koefisien
		}
		emp.RevenueNett = prevEmp.RevenueNett
		emp.LastSalaryIncrementDate = prevEmp.LastSalaryIncrementDate
		emp.IsPermanent = prevEmp.IsPermanent

		if err := database.DB.Save(&emp).Error; err != nil {
			return err
		}

		LogAudit("REVERT", "Employee", log.EntityID, fmt.Sprintf("Revert %s: Mengembalikan data karyawan %s ke kondisi semula", action, emp.EmployeeName), log.Details, performedBy, ip)
		return nil
	}

	return fmt.Errorf("Aksi %s tidak didukung untuk revert", action)
}

func revertGroup(action string, log models.AuditLog, performedBy, ip string) error {
	var detailsMap map[string]interface{}
	_ = json.Unmarshal([]byte(log.Details), &detailsMap)
	grpID, _ := strconv.Atoi(log.EntityID)

	switch action {
	case "CREATE":
		if grpID > 0 {
			var grp models.Group
			if err := database.DB.First(&grp, grpID).Error; err == nil {
				database.DB.Delete(&grp)
				LogAudit("REVERT", "Group", log.EntityID, fmt.Sprintf("Revert CREATE: Menghapus group %s", grp.GroupName), log.Details, performedBy, ip)
				return nil
			}
		}
		return fmt.Errorf("Group ID %s tidak ditemukan untuk di-revert CREATE", log.EntityID)

	case "DELETE":
		var grp models.Group
		if prevObj, ok := detailsMap["previous"]; ok {
			prevBytes, _ := json.Marshal(prevObj)
			json.Unmarshal(prevBytes, &grp)
		} else {
			json.Unmarshal([]byte(log.Details), &grp)
		}
		grp.IDGroup = 0
		if err := database.DB.Create(&grp).Error; err != nil {
			return err
		}
		LogAudit("REVERT", "Group", fmt.Sprintf("%d", grp.IDGroup), fmt.Sprintf("Revert DELETE: Mengembalikan data group %s", grp.GroupName), log.Details, performedBy, ip)
		return nil

	case "UPDATE":
		var grp models.Group
		if err := database.DB.First(&grp, grpID).Error; err != nil {
			return fmt.Errorf("Group ID %d tidak ditemukan di database", grpID)
		}
		var prevGrp models.Group
		if prevObj, ok := detailsMap["previous"]; ok {
			prevBytes, _ := json.Marshal(prevObj)
			json.Unmarshal(prevBytes, &prevGrp)
		} else {
			json.Unmarshal([]byte(log.Details), &prevGrp)
		}
		if prevGrp.GroupName != "" {
			grp.GroupName = prevGrp.GroupName
		}
		grp.BrandName = prevGrp.BrandName
		if err := database.DB.Save(&grp).Error; err != nil {
			return err
		}
		LogAudit("REVERT", "Group", log.EntityID, fmt.Sprintf("Revert UPDATE: Mengembalikan data group %s", grp.GroupName), log.Details, performedBy, ip)
		return nil
	}
	return fmt.Errorf("Aksi %s tidak didukung untuk revert", action)
}

func revertCustomer(action string, log models.AuditLog, performedBy, ip string) error {
	var detailsMap map[string]interface{}
	_ = json.Unmarshal([]byte(log.Details), &detailsMap)
	custID, _ := strconv.Atoi(log.EntityID)

	switch action {
	case "CREATE":
		if custID > 0 {
			var cust models.Customer
			if err := database.DB.First(&cust, custID).Error; err == nil {
				database.DB.Delete(&cust)
				LogAudit("REVERT", "Customer", log.EntityID, fmt.Sprintf("Revert CREATE: Menghapus customer %s", cust.CustomerName), log.Details, performedBy, ip)
				return nil
			}
		}
		return fmt.Errorf("Customer ID %s tidak ditemukan untuk di-revert CREATE", log.EntityID)

	case "DELETE":
		var cust models.Customer
		if prevObj, ok := detailsMap["previous"]; ok {
			prevBytes, _ := json.Marshal(prevObj)
			json.Unmarshal(prevBytes, &cust)
		} else {
			json.Unmarshal([]byte(log.Details), &cust)
		}
		cust.IDCustomer = 0
		if err := database.DB.Create(&cust).Error; err != nil {
			return err
		}
		LogAudit("REVERT", "Customer", fmt.Sprintf("%d", cust.IDCustomer), fmt.Sprintf("Revert DELETE: Mengembalikan data customer %s", cust.CustomerName), log.Details, performedBy, ip)
		return nil

	case "UPDATE":
		var cust models.Customer
		if err := database.DB.First(&cust, custID).Error; err != nil {
			return fmt.Errorf("Customer ID %d tidak ditemukan di database", custID)
		}
		var prevCust models.Customer
		if prevObj, ok := detailsMap["previous"]; ok {
			prevBytes, _ := json.Marshal(prevObj)
			json.Unmarshal(prevBytes, &prevCust)
		} else {
			json.Unmarshal([]byte(log.Details), &prevCust)
		}
		if prevCust.CustomerName != "" {
			cust.CustomerName = prevCust.CustomerName
		}
		cust.CustomerStartContract = prevCust.CustomerStartContract
		cust.CustomerEndContract = prevCust.CustomerEndContract
		if err := database.DB.Save(&cust).Error; err != nil {
			return err
		}
		LogAudit("REVERT", "Customer", log.EntityID, fmt.Sprintf("Revert UPDATE: Mengembalikan data customer %s", cust.CustomerName), log.Details, performedBy, ip)
		return nil
	}
	return fmt.Errorf("Aksi %s tidak didukung untuk revert", action)
}

func revertPersonalNote(action string, log models.AuditLog, performedBy, ip string) error {
	var detailsMap map[string]interface{}
	_ = json.Unmarshal([]byte(log.Details), &detailsMap)
	noteID, _ := strconv.Atoi(log.EntityID)

	switch action {
	case "CREATE":
		if noteID > 0 {
			var note models.PersonalNote
			if err := database.DB.First(&note, noteID).Error; err == nil {
				database.DB.Delete(&note)
				LogAudit("REVERT", "PersonalNote", log.EntityID, fmt.Sprintf("Revert CREATE: Menghapus personal note ID %d", note.ID), log.Details, performedBy, ip)
				return nil
			}
		}
		return fmt.Errorf("Personal note ID %s tidak ditemukan untuk di-revert CREATE", log.EntityID)

	case "DELETE":
		var note models.PersonalNote
		if prevObj, ok := detailsMap["previous"]; ok {
			prevBytes, _ := json.Marshal(prevObj)
			json.Unmarshal(prevBytes, &note)
		} else {
			json.Unmarshal([]byte(log.Details), &note)
		}
		note.ID = 0
		if err := database.DB.Create(&note).Error; err != nil {
			return err
		}
		LogAudit("REVERT", "PersonalNote", fmt.Sprintf("%d", note.ID), fmt.Sprintf("Revert DELETE: Mengembalikan personal note ID %d", note.ID), log.Details, performedBy, ip)
		return nil

	case "UPDATE":
		var note models.PersonalNote
		if err := database.DB.First(&note, noteID).Error; err != nil {
			return fmt.Errorf("Personal note ID %d tidak ditemukan di database", noteID)
		}
		var prevNote models.PersonalNote
		if prevObj, ok := detailsMap["previous"]; ok {
			prevBytes, _ := json.Marshal(prevObj)
			json.Unmarshal(prevBytes, &prevNote)
		} else {
			json.Unmarshal([]byte(log.Details), &prevNote)
		}
		note.NetSalary = prevNote.NetSalary
		note.TK0K0 = prevNote.TK0K0
		note.K1K2 = prevNote.K1K2
		if err := database.DB.Save(&note).Error; err != nil {
			return err
		}
		LogAudit("REVERT", "PersonalNote", log.EntityID, fmt.Sprintf("Revert UPDATE: Mengembalikan data personal note ID %d", note.ID), log.Details, performedBy, ip)
		return nil
	}
	return fmt.Errorf("Aksi %s tidak didukung untuk revert", action)
}
