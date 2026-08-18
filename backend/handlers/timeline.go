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

type WeekCell struct {
	Month         int    `json:"month"`
	Week          int    `json:"week"`
	Status        string `json:"status"` // "NOT_YET_JOINED", "ONBOARDING", "PAST_DAYS", "FUTURE_DAYS", "PO_EXPIRED", "EMPLOYEE_CONTRACT_EXPIRED"
	Label         string `json:"label"`  // "", "OBD", "PO", "CO"
	TooltipStatus string `json:"tooltip_status"`
}

type AssignmentHistoryItem struct {
	Month        int    `json:"month"`
	MonthName    string `json:"month_name"`
	CustomerName string `json:"customer_name"`
	BrandName    string `json:"brand_name"`
}

type WeeklyTimelineEmployee struct {
	IDEmployee            uint                    `json:"id_employee"`
	EmployeeName          string                  `json:"employee_name"`
	EmployeeRole          string                  `json:"employee_role"`
	GroupName             string                  `json:"group_name"`
	CustomerName          string                  `json:"customer_name"`
	PreviousCustomerName  string                  `json:"previous_customer_name"`
	IdlePeriodMonths      string                  `json:"idle_period_months"`
	NewCustomerName       string                  `json:"new_customer_name"`
	AssignmentFlow        string                  `json:"assignment_flow"`
	POContractTimeline    string                  `json:"po_contract_timeline"`
	EndContract           string                  `json:"end_contract"`
	CustomerStartContract string                  `json:"customer_start_contract"`
	CustomerEndContract   string                  `json:"customer_end_contract"`
	IsPermanent           bool                    `json:"is_permanent"`
	WeeklyStatus          []WeekCell              `json:"weekly_status"`
	MonthlyHistory        []AssignmentHistoryItem `json:"monthly_history"`
}

type BenchTimelineResponse struct {
	Year int                      `json:"year"`
	Data []WeeklyTimelineEmployee `json:"data"`
}

func GetBenchTimeline(c *gin.Context) {
	yearStr := c.DefaultQuery("year", strconv.Itoa(time.Now().Year()))
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		year = time.Now().Year()
	}

	groupID := c.Query("group_id")
	customerID := c.Query("customer_id")
	statusFilter := strings.ToLower(c.Query("status"))

	query := database.DB.Session(&gorm.Session{}).Model(&models.Employee{}).
		Preload("Group").Preload("Customer").
		Where("status = ? OR status IS NULL OR status = ''", "Active")

	if groupID != "" && groupID != "all" {
		query = query.Where("id_group = ?", groupID)
	}

	if customerID != "" && customerID != "all" {
		if customerID == "bench" {
			query = query.Where("id_customer IS NULL OR id_customer = 0")
		} else {
			query = query.Where("id_customer = ?", customerID)
		}
	}

	var employees []models.Employee
	query.Order("id_customer DESC, id_employee ASC").Find(&employees)

	var timelineData []WeeklyTimelineEmployee
	today := time.Now()

	for _, emp := range employees {
		groupName := "General"
		if emp.Group != nil {
			if emp.Group.BrandName != "" {
				groupName = emp.Group.BrandName
			} else {
				groupName = emp.Group.GroupName
			}
		}

		custName := "On Bench"
		custStart := "-"
		custEnd := "-"
		var custEndTime time.Time
		var errCustEnd error

		if emp.Customer != nil {
			custName = emp.Customer.CustomerName
			custStart = emp.Customer.CustomerStartContract
			custEnd = emp.Customer.CustomerEndContract
			custEndTime, errCustEnd = time.Parse("2006-01-02", cleanDateString(custEnd))
		}

		// Fetch assignment history sequence for this employee from assignment_histories table
		var histories []models.AssignmentHistory
		database.DB.Where("year = ? AND id_employee = ?", year, emp.IDEmployee).Order("month ASC").Find(&histories)

		var monthlyHistList []AssignmentHistoryItem
		var customerSequence []string
		var previousCust string
		var idleMonthsCount int
		var newCust string

		for _, h := range histories {
			cName := h.CustomerName
			if cName == "" {
				cName = "On Bench"
			}
			monthlyHistList = append(monthlyHistList, AssignmentHistoryItem{
				Month:        h.Month,
				MonthName:    h.MonthName,
				CustomerName: cName,
				BrandName:    h.BrandName,
			})

			if strings.EqualFold(cName, "On Bench") {
				idleMonthsCount++
			}

			if len(customerSequence) == 0 || customerSequence[len(customerSequence)-1] != cName {
				customerSequence = append(customerSequence, cName)
			}
		}

		if len(customerSequence) > 1 {
			for idx, c := range customerSequence {
				if strings.Contains(strings.ToLower(c), "bench") {
					if idx > 0 {
						previousCust = customerSequence[idx-1]
					}
					if idx < len(customerSequence)-1 {
						newCust = customerSequence[idx+1]
					}
				}
			}
			if previousCust == "" {
				previousCust = customerSequence[0]
			}
			if newCust == "" {
				newCust = customerSequence[len(customerSequence)-1]
			}
		} else if len(customerSequence) == 1 {
			previousCust = customerSequence[0]
			newCust = customerSequence[0]
		} else {
			previousCust = custName
			newCust = custName
		}

		idlePeriodStr := "-"
		if idleMonthsCount > 0 {
			idlePeriodStr = fmt.Sprintf("%d Bulan (Bench)", idleMonthsCount)
		}

		assignmentFlow := strings.Join(customerSequence, " ➔ ")
		if len(customerSequence) == 0 {
			assignmentFlow = custName
		}

		isPermanent := strings.EqualFold(emp.StartContract, "Permanent") || strings.EqualFold(emp.EndContract, "Permanent")

		startContractTime, errStart := time.Parse("2006-01-02", cleanDateString(emp.StartContract))
		endContractTime, errEnd := time.Parse("2006-01-02", cleanDateString(emp.EndContract))

		if isPermanent {
			startContractTime = time.Date(1970, 1, 1, 0, 0, 0, 0, time.UTC)
			endContractTime = time.Date(2099, 12, 31, 0, 0, 0, 0, time.UTC)
		} else {
			if errStart != nil {
				startContractTime = time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC)
			}
			if errEnd != nil {
				endContractTime = time.Date(year, 12, 31, 0, 0, 0, 0, time.UTC)
			}
		}

		var weeklyCells []WeekCell
		hasOnboarding := false
		hasExpiring := false

		for m := 1; m <= 12; m++ {
			for w := 1; w <= 4; w++ {
				dayApprox := (w-1)*7 + 4
				weekDate := time.Date(year, time.Month(m), dayApprox, 0, 0, 0, 0, time.UTC)

				cell := WeekCell{
					Month: m,
					Week:  w,
				}

				if weekDate.Before(startContractTime) {
					// 1. Belum Join (Greyout)
					cell.Status = "NOT_YET_JOINED"
					cell.Label = ""
					cell.TooltipStatus = "Belum Join"
				} else if weekDate.After(endContractTime) {
					// 6. Kontrak Karyawan Habis (CO - Merah Muda)
					cell.Status = "EMPLOYEE_CONTRACT_EXPIRED"
					cell.Label = "CO"
					cell.TooltipStatus = "Kontrak Karyawan Habis (CO)"
					hasExpiring = true
				} else if emp.Customer != nil && errCustEnd == nil && weekDate.After(custEndTime) {
					// 4. PO Habis (PO - Biru)
					cell.Status = "PO_EXPIRED"
					cell.Label = "PO"
					cell.TooltipStatus = "PO Habis (PO)"
					hasExpiring = true
				} else if weekDate.Before(startContractTime.AddDate(0, 0, 14)) {
					// 3. Onboarding (OBD - Hijau Tua)
					cell.Status = "ONBOARDING"
					cell.Label = "OBD"
					cell.TooltipStatus = "Onboarding (OBD)"
					hasOnboarding = true
				} else if weekDate.Before(today) || weekDate.Equal(today) {
					// 2. Hari yang dilalui (Hijau Muda)
					cell.Status = "PAST_DAYS"
					cell.Label = ""
					cell.TooltipStatus = "Hari yang dilalui"
				} else {
					// 5. Hari belum dilalui (Kuning)
					cell.Status = "FUTURE_DAYS"
					cell.Label = ""
					cell.TooltipStatus = "Hari belum dilalui"
				}

				weeklyCells = append(weeklyCells, cell)
			}
		}

		// Apply status filter criteria
		if statusFilter == "bench" && (emp.IDCustomer != nil && *emp.IDCustomer != 0) {
			continue
		}
		if statusFilter == "onboarding" && !hasOnboarding {
			continue
		}
		if statusFilter == "expiring" && !hasExpiring {
			continue
		}

		timelineData = append(timelineData, WeeklyTimelineEmployee{
			IDEmployee:            emp.IDEmployee,
			EmployeeName:          emp.EmployeeName,
			EmployeeRole:          emp.EmployeeRole,
			GroupName:             groupName,
			CustomerName:          custName,
			PreviousCustomerName:  previousCust,
			IdlePeriodMonths:      idlePeriodStr,
			NewCustomerName:       newCust,
			AssignmentFlow:        assignmentFlow,
			POContractTimeline:    emp.StartContract,
			EndContract:           emp.EndContract,
			CustomerStartContract: custStart,
			CustomerEndContract:   custEnd,
			IsPermanent:           emp.IsPermanent,
			WeeklyStatus:          weeklyCells,
			MonthlyHistory:        monthlyHistList,
		})
	}

	response := BenchTimelineResponse{
		Year: year,
		Data: timelineData,
	}

	middleware.RespondSuccess(c, http.StatusOK, "Bench timeline matrix generated successfully", response)
}

func cleanDateString(d string) string {
	if strings.Contains(d, "T") {
		return strings.Split(d, "T")[0]
	}
	if len(d) >= 10 {
		return d[:10]
	}
	return d
}

// Alias for backwards compatibility
func GetTimelineEvents(c *gin.Context) {
	GetBenchTimeline(c)
}
