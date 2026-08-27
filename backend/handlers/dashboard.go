package handlers

import (
	"net/http"
	"sort"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"resource-management-system/database"
	"resource-management-system/middleware"
	"resource-management-system/models"
)

type DashboardOverview struct {
	TotalEmployees     int64   `json:"total_employees"`
	ActiveEmployees    int64   `json:"active_employees"`
	BenchEmployees     int64   `json:"bench_employees"`
	TotalCustomers     int64   `json:"total_customers"`
	TotalRevenue       float64 `json:"total_revenue"`
	TotalCOGS          float64 `json:"total_cogs"`
	TotalMarginNominal float64 `json:"total_margin_nominal"`
	AverageMarginPct   float64 `json:"average_margin_pct"`
}

type CustomerDistributionItem struct {
	IDCustomer         uint    `json:"id_customer"`
	CustomerName       string  `json:"customer_name"`
	EmployeeCount      int64   `json:"employee_count"`
	TotalRevenue       float64 `json:"total_revenue"`
	TotalCOGS          float64 `json:"total_cogs"`
	TotalMarginNominal float64 `json:"total_margin_nominal"`
	MarginPct          float64 `json:"margin_pct"`
}

type RoleSummaryItem struct {
	RoleName     string  `json:"role_name"`
	TotalCount   int64   `json:"total_count"`
	ActiveCount  int64   `json:"active_count"`
	BenchCount   int64   `json:"bench_count"`
	TotalDirect  float64 `json:"total_direct_cost"`
	TotalCOGS    float64 `json:"total_cogs"`
	TotalRevenue float64 `json:"total_revenue"`
}

type IdleSummaryResponse struct {
	TotalIdleCount  int64                            `json:"total_idle_count"`
	IdlePercentage  float64                          `json:"idle_percentage"`
	TotalDirectCost float64                          `json:"total_direct_cost"`
	TotalCOGS       float64                          `json:"total_cogs"`
	IdleEmployees   []models.EmployeeRevenueAnalysis `json:"idle_employees"`
}

func GetDashboardOverview(c *gin.Context) {
	var totalEmployees int64
	database.DB.Session(&gorm.Session{}).Model(&models.Employee{}).
		Where("status = ? OR status IS NULL OR status = ''", "Active").
		Count(&totalEmployees)

	var benchEmployees int64
	database.DB.Session(&gorm.Session{}).Model(&models.Employee{}).
		Where("(status = ? OR status IS NULL OR status = '') AND (id_customer IS NULL OR id_customer = 0)", "Active").
		Count(&benchEmployees)

	activeEmployees := totalEmployees - benchEmployees

	var totalCustomers int64
	database.DB.Session(&gorm.Session{}).Model(&models.Customer{}).Count(&totalCustomers)

	var employees []models.Employee
	database.DB.Session(&gorm.Session{}).
		Where("status = ? OR status IS NULL OR status = ''", "Active").
		Find(&employees)

	var totalRevenue float64
	var totalCOGS float64

	for _, emp := range employees {
		analysis := models.CalculateRevenueDetails(emp)
		totalRevenue += analysis.RevenueNett
		totalCOGS += analysis.COGS
	}

	totalMarginNominal := totalRevenue - totalCOGS
	var averageMarginPct float64
	if totalRevenue > 0 {
		averageMarginPct = (totalMarginNominal / totalRevenue) * 100.0
	}

	overview := DashboardOverview{
		TotalEmployees:     totalEmployees,
		ActiveEmployees:    activeEmployees,
		BenchEmployees:     benchEmployees,
		TotalCustomers:     totalCustomers,
		TotalRevenue:       totalRevenue,
		TotalCOGS:          totalCOGS,
		TotalMarginNominal: totalMarginNominal,
		AverageMarginPct:   averageMarginPct,
	}

	middleware.RespondSuccess(c, http.StatusOK, "Dashboard overview retrieved", overview)
}

func GetCustomerDistribution(c *gin.Context) {
	var customers []models.Customer
	database.DB.Session(&gorm.Session{}).Find(&customers)

	var distribution []CustomerDistributionItem
	for _, cust := range customers {
		var emps []models.Employee
		database.DB.Session(&gorm.Session{}).Model(&models.Employee{}).
			Where("(status = ? OR status IS NULL OR status = '') AND id_customer = ?", "Active", cust.IDCustomer).
			Find(&emps)

		var totalRev, totalCogs float64
		for _, e := range emps {
			calc := models.CalculateRevenueDetails(e)
			totalRev += calc.RevenueNett
			totalCogs += calc.COGS
		}
		marginNom := totalRev - totalCogs
		var marginPct float64
		if totalRev > 0 {
			marginPct = (marginNom / totalRev) * 100.0
		}

		distribution = append(distribution, CustomerDistributionItem{
			IDCustomer:         cust.IDCustomer,
			CustomerName:       cust.CustomerName,
			EmployeeCount:      int64(len(emps)),
			TotalRevenue:       totalRev,
			TotalCOGS:          totalCogs,
			TotalMarginNominal: marginNom,
			MarginPct:          marginPct,
		})
	}

	// Add On-Bench group as well for complete chart visualization
	var benchEmps []models.Employee
	database.DB.Session(&gorm.Session{}).Model(&models.Employee{}).
		Where("(status = ? OR status IS NULL OR status = '') AND (id_customer IS NULL OR id_customer = 0)", "Active").
		Find(&benchEmps)

	if len(benchEmps) > 0 {
		var totalCogs float64
		for _, e := range benchEmps {
			calc := models.CalculateRevenueDetails(e)
			totalCogs += calc.COGS
		}
		distribution = append(distribution, CustomerDistributionItem{
			IDCustomer:         0,
			CustomerName:       "On Bench (Unassigned)",
			EmployeeCount:      int64(len(benchEmps)),
			TotalRevenue:       0,
			TotalCOGS:          totalCogs,
			TotalMarginNominal: -totalCogs,
			MarginPct:          0,
		})
	}

	middleware.RespondSuccess(c, http.StatusOK, "Customer distribution retrieved", distribution)
}

func GetExpiringContractsAlert(c *gin.Context) {
	now := time.Now()
	twoMonthsLater := now.AddDate(0, 2, 0)

	todayStr := now.Format("2006-01-02")
	twoMonthsStr := twoMonthsLater.Format("2006-01-02")

	var employees []models.Employee
	database.DB.Session(&gorm.Session{}).Preload("Group").Preload("Customer").
		Where("(status = ? OR status IS NULL OR status = '') AND end_contract <= ? AND end_contract >= ?", "Active", twoMonthsStr, todayStr).
		Order("end_contract ASC").
		Limit(5).
		Find(&employees)

	if len(employees) < 5 {
		var additional []models.Employee
		ids := []uint{}
		for _, e := range employees {
			ids = append(ids, e.IDEmployee)
		}

		q := database.DB.Session(&gorm.Session{}).Preload("Group").Preload("Customer").
			Where("status = ? OR status IS NULL OR status = ''", "Active")
		if len(ids) > 0 {
			q = q.Where("id_employee NOT IN ?", ids)
		}
		q.Order("end_contract ASC").Limit(5 - len(employees)).Find(&additional)

		employees = append(employees, additional...)
	}

	middleware.RespondSuccess(c, http.StatusOK, "Expiring contract alerts retrieved", employees)
}

func GetRoleSummary(c *gin.Context) {
	var employees []models.Employee
	if err := database.DB.Session(&gorm.Session{}).
		Where("status = ? OR status IS NULL OR status = ''", "Active").
		Preload("Group").Preload("Customer").
		Find(&employees).Error; err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}

	roleMap := make(map[string]*RoleSummaryItem)
	for _, emp := range employees {
		role := emp.EmployeeRole
		if role == "" {
			role = "General Specialist"
		}

		if _, exists := roleMap[role]; !exists {
			roleMap[role] = &RoleSummaryItem{
				RoleName: role,
			}
		}

		item := roleMap[role]
		item.TotalCount++
		details := models.CalculateRevenueDetails(emp)
		item.TotalDirect += details.TotalDirectCost
		item.TotalCOGS += details.COGS
		item.TotalRevenue += details.RevenueNett

		if emp.IDCustomer == nil || *emp.IDCustomer == 0 {
			item.BenchCount++
		} else {
			item.ActiveCount++
		}
	}

	var list []RoleSummaryItem
	for _, item := range roleMap {
		list = append(list, *item)
	}

	// Sort by total count descending
	sort.Slice(list, func(i, j int) bool {
		return list[i].TotalCount > list[j].TotalCount
	})

	middleware.RespondSuccess(c, http.StatusOK, "Role summary retrieved successfully", list)
}

func GetIdleSummary(c *gin.Context) {
	var totalEmployees int64
	database.DB.Session(&gorm.Session{}).Model(&models.Employee{}).
		Where("status = ? OR status IS NULL OR status = ''", "Active").
		Count(&totalEmployees)

	var employees []models.Employee
	if err := database.DB.Session(&gorm.Session{}).
		Where("(status = ? OR status IS NULL OR status = '') AND (id_customer IS NULL OR id_customer = 0)", "Active").
		Preload("Group").Preload("Customer").
		Find(&employees).Error; err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}

	var idleItems []models.EmployeeRevenueAnalysis
	var totalDirect float64
	var totalCOGS float64

	for _, emp := range employees {
		details := models.CalculateRevenueDetails(emp)
		idleItems = append(idleItems, details)
		totalDirect += details.TotalDirectCost
		totalCOGS += details.COGS
	}

	idleCount := int64(len(employees))
	var pct float64
	if totalEmployees > 0 {
		pct = (float64(idleCount) / float64(totalEmployees)) * 100.0
	}

	resp := IdleSummaryResponse{
		TotalIdleCount:  idleCount,
		IdlePercentage:  pct,
		TotalDirectCost: totalDirect,
		TotalCOGS:       totalCOGS,
		IdleEmployees:   idleItems,
	}

	middleware.RespondSuccess(c, http.StatusOK, "Idle summary retrieved successfully", resp)
}
