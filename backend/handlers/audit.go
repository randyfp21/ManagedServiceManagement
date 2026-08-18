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
