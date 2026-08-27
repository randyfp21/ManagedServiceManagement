package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"resource-management-system/database"
	"resource-management-system/middleware"
	"resource-management-system/models"
)

type MonthlyCustomerRow struct {
	IDCustomer   uint           `json:"id_customer"`
	CustomerName string         `json:"customer_name"`
	MonthlyCount map[string]int `json:"monthly_count"` // e.g. {"Jan": 2, "Feb": 3, ...}
	TotalActive  int            `json:"total_active"`
}

type SummaryMatrixResponse struct {
	Year         int                  `json:"year"`
	Months       []string             `json:"months"`
	Rows         []MonthlyCustomerRow `json:"rows"`
	MonthlyTotal map[string]int      `json:"monthly_total"`
	GrandTotal   int                  `json:"grand_total"`
}

// SyncAssignmentHistory scans current employees and generates/updates historical snapshot records starting from August 2026
func SyncAssignmentHistory(year int) {
	// Delete any old history prior to August 2026
	database.DB.Where("year < 2026 OR (year = 2026 AND month < 8)").Delete(&models.AssignmentHistory{})

	if year < 2026 {
		return
	}

	allMonths := []string{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"}

	var employees []models.Employee
	database.DB.Preload("Group").Preload("Customer").Find(&employees)

	for _, emp := range employees {
		if emp.Customer == nil || emp.IDCustomer == nil {
			continue
		}

		isPermanent := emp.IsPermanent || strings.EqualFold(emp.StartContract, "Permanent") || strings.EqualFold(emp.EndContract, "Permanent")

		custStartStr := "1970-01-01"
		custEndStr := "2099-12-31"
		if emp.Customer != nil {
			if emp.Customer.CustomerStartContract != "" {
				custStartStr = cleanDateString(emp.Customer.CustomerStartContract)
			}
			if emp.Customer.CustomerEndContract != "" {
				custEndStr = cleanDateString(emp.Customer.CustomerEndContract)
			}
		}

		empStartStr := cleanDateString(emp.StartContract)
		empEndStr := cleanDateString(emp.EndContract)

		startIdx := 0
		if year == 2026 {
			startIdx = 7 // August (0-indexed 7 = Month 8)
		}

		for mIdx := startIdx; mIdx < 12; mIdx++ {
			mName := allMonths[mIdx]
			monthNum := mIdx + 1

			mStartStr := fmt.Sprintf("%04d-%02d-01", year, monthNum)
			lastDay := time.Date(year, time.Month(monthNum+1), 0, 0, 0, 0, 0, time.UTC).Day()
			mEndStr := fmt.Sprintf("%04d-%02d-%02d", year, monthNum, lastDay)

			empActive := isPermanent || (empStartStr <= mEndStr && empEndStr >= mStartStr)
			custActive := custStartStr <= mEndStr && custEndStr >= mStartStr

			activeInMonth := empActive && custActive

			if activeInMonth {
				groupName := "-"
				brandName := "-"
				if emp.Group != nil {
					groupName = emp.Group.GroupName
					if emp.Group.BrandName != "" {
						brandName = emp.Group.BrandName
					} else {
						brandName = emp.Group.GroupName
					}
				}

				var existing models.AssignmentHistory
				err := database.DB.Where("year = ? AND month = ? AND (id_employee = ? OR LOWER(employee_name) = LOWER(?))", year, monthNum, emp.IDEmployee, emp.EmployeeName).First(&existing).Error
				if err != nil {
					history := models.AssignmentHistory{
						Year:           year,
						Month:          monthNum,
						MonthName:      mName,
						IDEmployee:     emp.IDEmployee,
						EmployeeName:   emp.EmployeeName,
						EmployeeRole:   emp.EmployeeRole,
						IDCustomer:     emp.IDCustomer,
						CustomerName:   emp.Customer.CustomerName,
						IDGroup:        emp.IDGroup,
						GroupName:      groupName,
						BrandName:      brandName,
						SallaryGross:   emp.SallaryGross,
						StartContract:  emp.StartContract,
						EndContract:    emp.EndContract,
						IsPermanent:    isPermanent,
						EmployeeStatus: emp.Status,
					}
					database.DB.Create(&history)
				} else {
					existing.EmployeeName = emp.EmployeeName
					existing.EmployeeRole = emp.EmployeeRole
					existing.IDCustomer = emp.IDCustomer
					existing.CustomerName = emp.Customer.CustomerName
					existing.IDGroup = emp.IDGroup
					existing.GroupName = groupName
					existing.BrandName = brandName
					existing.SallaryGross = emp.SallaryGross
					existing.StartContract = emp.StartContract
					existing.EndContract = emp.EndContract
					existing.IsPermanent = isPermanent
					existing.EmployeeStatus = emp.Status
					database.DB.Save(&existing)
				}
			} else {
				database.DB.Where("year = ? AND month = ? AND id_employee = ? AND id_customer = ?", year, monthNum, emp.IDEmployee, emp.IDCustomer).Delete(&models.AssignmentHistory{})
			}
		}
	}
}

func GetMonthlySummary(c *gin.Context) {
	yearStr := c.DefaultQuery("year", strconv.Itoa(time.Now().Year()))
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		year = time.Now().Year()
	}

	// Always sync current active assignments for the requested year
	SyncAssignmentHistory(year)

	months := []string{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"}

	// Determine latest active / ongoing month for the year
	now := time.Now()
	currentYear := now.Year()
	currentMonth := int(now.Month())

	latestMonthIdx := 11 // Default to December (index 11) for past years
	if year == currentYear {
		latestMonthIdx = currentMonth - 1 // 0-indexed (e.g. Aug = 7)
		if latestMonthIdx < 0 {
			latestMonthIdx = 0
		}
	} else if year > currentYear {
		latestMonthIdx = 0 // Jan for future years
	}
	latestMonthName := months[latestMonthIdx]

	// 1. Fetch current customers
	var currentCustomers []models.Customer
	database.DB.Find(&currentCustomers)

	// 2. Fetch all historical assignment snapshots for this year
	var histories []models.AssignmentHistory
	database.DB.Where("year = ?", year).Find(&histories)

	type CustomerMeta struct {
		IDCustomer   uint
		CustomerName string
	}

	custOrder := []string{}
	custMap := make(map[string]CustomerMeta)

	// Include standard current customers
	for _, c := range currentCustomers {
		if _, exists := custMap[c.CustomerName]; !exists {
			custMap[c.CustomerName] = CustomerMeta{IDCustomer: c.IDCustomer, CustomerName: c.CustomerName}
			custOrder = append(custOrder, c.CustomerName)
		}
	}

	// Also include historical customer names (even if deleted from customers table!)
	for _, h := range histories {
		if _, exists := custMap[h.CustomerName]; !exists {
			custID := uint(0)
			if h.IDCustomer != nil {
				custID = *h.IDCustomer
			}
			custMap[h.CustomerName] = CustomerMeta{IDCustomer: custID, CustomerName: h.CustomerName}
			custOrder = append(custOrder, h.CustomerName)
		}
	}

	rows := []MonthlyCustomerRow{}
	monthlyTotal := make(map[string]int)
	for _, m := range months {
		monthlyTotal[m] = 0
	}

	for _, cName := range custOrder {
		meta := custMap[cName]
		row := MonthlyCustomerRow{
			IDCustomer:   meta.IDCustomer,
			CustomerName: meta.CustomerName,
			MonthlyCount: make(map[string]int),
			TotalActive:  0,
		}

		for mIdx, mName := range months {
			monthNum := mIdx + 1

			// Find distinct employees assigned to this customer in this month from histories
			empInMonth := make(map[uint]bool)
			for _, h := range histories {
				if h.CustomerName == cName && h.Month == monthNum {
					empInMonth[h.IDEmployee] = true
				}
			}

			count := len(empInMonth)
			row.MonthlyCount[mName] = count
			monthlyTotal[mName] += count
		}

		// TotalActive is the total active headcount in the current ongoing month
		row.TotalActive = row.MonthlyCount[latestMonthName]
		rows = append(rows, row)
	}

	// GrandTotal is the total active headcount in the current ongoing month across all customers
	grandTotal := monthlyTotal[latestMonthName]

	response := SummaryMatrixResponse{
		Year:         year,
		Months:       months,
		Rows:         rows,
		MonthlyTotal: monthlyTotal,
		GrandTotal:   grandTotal,
	}

	middleware.RespondSuccess(c, http.StatusOK, "Monthly summary matrix retrieved", response)
}

// GetAssignedEmployeesHistory returns assigned employees for a customer & month from historical snapshots
func GetAssignedEmployeesHistory(c *gin.Context) {
	yearStr := c.DefaultQuery("year", strconv.Itoa(time.Now().Year()))
	year, _ := strconv.Atoi(yearStr)
	if year == 0 {
		year = time.Now().Year()
	}

	customerName := c.Query("customer_name")
	monthQuery := c.Query("month") // e.g. "Jan", "Feb" or "1", "2" or ""

	now := time.Now()
	currentYear := now.Year()
	currentMonth := int(now.Month())

	query := database.DB.Where("year = ?", year)
	if customerName != "" && customerName != "Semua Customer" {
		query = query.Where("customer_name = ?", customerName)
	}

	if monthQuery != "" {
		if monthNum, err := strconv.Atoi(monthQuery); err == nil {
			query = query.Where("month = ?", monthNum)
		} else {
			months := []string{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"}
			for idx, m := range months {
				if strings.EqualFold(m, monthQuery) {
					query = query.Where("month = ?", idx+1)
					break
				}
			}
		}
	} else {
		// Default to current ongoing month if month is not specified
		if year == currentYear {
			query = query.Where("month = ?", currentMonth)
		} else if year < currentYear {
			query = query.Where("month = ?", 12)
		} else {
			query = query.Where("month = ?", 1)
		}
	}

	var histories []models.AssignmentHistory
	query.Order("employee_name ASC").Find(&histories)

	// Deduplicate by LOWER(employee_name) to ensure no duplicate employees
	uniqueMap := make(map[string]bool)
	result := []map[string]interface{}{}

	for _, h := range histories {
		key := strings.ToLower(h.EmployeeName)
		if !uniqueMap[key] {
			uniqueMap[key] = true
			result = append(result, map[string]interface{}{
				"id_employee":    h.IDEmployee,
				"employee_name":  h.EmployeeName,
				"employee_role":  h.EmployeeRole,
				"customer_name":  h.CustomerName,
				"group_name":     h.GroupName,
				"brand_name":     h.BrandName,
				"start_contract": h.StartContract,
				"end_contract":   h.EndContract,
				"sallary_gross":  h.SallaryGross,
				"status":         h.EmployeeStatus,
				"is_permanent":   h.IsPermanent,
			})
		}
	}

	middleware.RespondSuccess(c, http.StatusOK, "Assigned employees history retrieved", result)
}
