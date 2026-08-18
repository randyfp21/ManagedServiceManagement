package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"resource-management-system/database"
	"resource-management-system/middleware"
	"resource-management-system/models"
)

type RevenueAnalysisResponse struct {
	Items              []models.EmployeeRevenueAnalysis `json:"items"`
	TotalGrossSalary   float64                           `json:"total_gross_salary"`
	TotalPenempatan    float64                           `json:"total_penempatan"`
	TotalKeahlian      float64                           `json:"total_keahlian"`
	TotalDirectCost    float64                           `json:"total_direct_cost"`
	TotalCOGS          float64                           `json:"total_cogs"`
	TotalRevenueNett   float64                           `json:"total_revenue_nett"`
	TotalMarginNominal float64                           `json:"total_margin_nominal"`
	AverageMarginPct   float64                           `json:"average_margin_pct"`
}

func GetRevenueAnalysis(c *gin.Context) {
	query := database.DB.Session(&gorm.Session{}).Model(&models.Employee{}).
		Where("status != ?", "Resign").
		Where("is_active = ?", true).
		Preload("Group").Preload("Customer")

	customerID := c.Query("id_customer")
	if customerID != "" && customerID != "all" {
		if customerID == "bench" {
			query = query.Where("id_customer IS NULL OR id_customer = 0")
		} else {
			query = query.Where("id_customer = ?", customerID)
		}
	}

	var employees []models.Employee
	if err := query.Find(&employees).Error; err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}

	var items []models.EmployeeRevenueAnalysis
	var totalGross float64
	var totalPenempatan float64
	var totalKeahlian float64
	var totalDirectCost float64
	var totalCOGS float64
	var totalRevenue float64

	for _, emp := range employees {
		analysis := models.CalculateRevenueDetails(emp)
		items = append(items, analysis)

		totalGross += analysis.SallaryGross
		totalPenempatan += analysis.TunjanganPenempatan
		totalKeahlian += analysis.TunjanganKeahlian
		totalDirectCost += analysis.TotalDirectCost
		totalCOGS += analysis.COGS
		totalRevenue += analysis.RevenueNett
	}

	totalMarginNominal := totalRevenue - totalCOGS
	var averageMarginPct float64
	if totalRevenue > 0 {
		averageMarginPct = (totalMarginNominal / totalRevenue) * 100.0
	}

	response := RevenueAnalysisResponse{
		Items:              items,
		TotalGrossSalary:   totalGross,
		TotalPenempatan:    totalPenempatan,
		TotalKeahlian:      totalKeahlian,
		TotalDirectCost:    totalDirectCost,
		TotalCOGS:          totalCOGS,
		TotalRevenueNett:   totalRevenue,
		TotalMarginNominal: totalMarginNominal,
		AverageMarginPct:   averageMarginPct,
	}

	middleware.RespondSuccess(c, http.StatusOK, "Revenue & profitability analysis retrieved", response)
}
