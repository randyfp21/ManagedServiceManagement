package models

import (
	"strings"
	"time"
)

type User struct {
	ID        uint      `gorm:"primaryKey;column:id" json:"id"`
	Username  string    `gorm:"type:varchar(100);unique;not null;column:username" json:"username"`
	Password  string    `gorm:"type:varchar(255);not null;column:password" json:"-"`
	Name      string    `gorm:"type:varchar(150);column:name" json:"name"`
	Role      string    `gorm:"type:varchar(50);default:'Manager';column:role" json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Group struct {
	IDGroup   uint       `gorm:"primaryKey;autoIncrement;column:id_group" json:"id_group"`
	GroupName string     `gorm:"type:varchar(100);not null;column:group_name" json:"group_name"`
	BrandName string     `gorm:"type:varchar(50);column:brand_name" json:"brand_name"`
	Employees []Employee `gorm:"foreignKey:IDGroup;references:IDGroup" json:"employees,omitempty"`
}

func (Group) TableName() string {
	return "groups"
}

type Customer struct {
	IDCustomer           uint       `gorm:"primaryKey;autoIncrement;column:id_customer" json:"id_customer"`
	CustomerName         string     `gorm:"type:varchar(100);not null;column:customer_name" json:"customer_name"`
	CustomerStartContract string     `gorm:"type:date;not null;column:customer_start_contract" json:"customer_start_contract"`
	CustomerEndContract   string     `gorm:"type:date;not null;column:customer_end_contract" json:"customer_end_contract"`
	Employees            []Employee `gorm:"foreignKey:IDCustomer;references:IDCustomer" json:"employees,omitempty"`
}

func (Customer) TableName() string {
	return "customers"
}

type Employee struct {
	IDEmployee          uint      `gorm:"primaryKey;autoIncrement;column:id_employee" json:"id_employee"`
	EmployeeName        string    `gorm:"type:varchar(150);not null;column:employee_name" json:"employee_name"`
	EmployeeRole        string    `gorm:"type:varchar(100);not null;column:employee_role" json:"employee_role"`
	Status              string    `gorm:"type:varchar(20);default:'Active';column:status" json:"status"`
	IsActive            bool      `gorm:"type:boolean;default:true;column:is_active" json:"is_active"`
	IDGroup             *uint     `gorm:"column:id_group" json:"id_group"`
	Group               *Group    `gorm:"foreignKey:IDGroup;references:IDGroup;constraint:OnDelete:SET NULL;" json:"group,omitempty"`
	IDCustomer          *uint     `gorm:"column:id_customer" json:"id_customer"`
	Customer            *Customer `gorm:"foreignKey:IDCustomer;references:IDCustomer;constraint:OnDelete:SET NULL;" json:"customer,omitempty"`
	StartContract       string    `gorm:"type:varchar(50);not null;column:start_contract" json:"start_contract"`
	EndContract         string    `gorm:"type:varchar(50);not null;column:end_contract" json:"end_contract"`
	SallaryGross        float64   `gorm:"type:numeric(15,2);default:0;column:sallary_gross" json:"sallary_gross"`
	TunjanganPenempatan float64   `gorm:"type:numeric(15,2);default:0;column:tunjangan_penempatan" json:"tunjangan_penempatan"`
	TunjanganKeahlian   float64   `gorm:"type:numeric(15,2);default:0;column:tunjangan_keahlian" json:"tunjangan_keahlian"`
	Koefisien           float64   `gorm:"type:numeric(3,2);column:koefisien" json:"koefisien"`
	RevenueNett         float64   `gorm:"type:numeric(15,2);default:0;column:revenue_nett" json:"revenue_nett"`
	JoinDate            string    `gorm:"type:varchar(50);column:join_date" json:"join_date"`
	OnboardingDate      string    `gorm:"type:varchar(50);column:onboarding_date" json:"onboarding_date"`
	LastSalaryIncrementDate string `gorm:"type:varchar(50);column:last_salary_increment_date" json:"last_salary_increment_date"`
	IsPermanent         bool      `gorm:"type:boolean;default:false;column:is_permanent" json:"is_permanent"`
	AllocationStatus    string    `gorm:"type:varchar(30);default:'ACTIVE';column:allocation_status" json:"allocation_status"`
	Remarks             string    `gorm:"type:text;column:remarks" json:"remarks"`
}

func (Employee) TableName() string {
	return "employees"
}

type PersonalNote struct {
	ID        uint      `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	NetSalary float64   `gorm:"type:numeric(15,2);not null;column:net_salary" json:"net_salary"`
	TK0K0     *float64  `gorm:"type:numeric(15,2);column:tk0_k0" json:"tk0_k0"`
	K1K2      *float64  `gorm:"type:numeric(15,2);column:k1_k2" json:"k1_k2"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (PersonalNote) TableName() string {
	return "personal_notes"
}

// Calculated Revenue Response DTO
type EmployeeRevenueAnalysis struct {
	IDEmployee          uint    `json:"id_employee"`
	EmployeeName        string  `json:"employee_name"`
	EmployeeRole        string  `json:"employee_role"`
	Status              string  `json:"status"`
	IsActive            bool    `json:"is_active"`
	GroupName           string  `json:"group_name"`
	CustomerName        string  `json:"customer_name"`
	ContractPeriod      string  `json:"contract_period"`
	StartContract       string  `json:"start_contract"`
	EndContract         string  `json:"end_contract"`
	LastSalaryIncrementDate string `json:"last_salary_increment_date"`
	Remarks             string  `json:"remarks"`
	SallaryGross        float64 `json:"sallary_gross"`
	TunjanganPenempatan float64 `json:"tunjangan_penempatan"`
	TunjanganKeahlian   float64 `json:"tunjangan_keahlian"`
	TotalDirectCost     float64 `json:"total_direct_cost"`
	Koefisien           float64 `json:"koefisien"`
	COGS                float64 `json:"cogs"`
	RevenueNett         float64 `json:"revenue_nett"`
	MarginNominal       float64 `json:"margin_nominal"`
	MarginPercent       float64 `json:"margin_percent"`
	MarginStatus        string  `json:"margin_status"`
}

func cleanDate(dStr string) string {
	if strings.Contains(dStr, "T") {
		return strings.Split(dStr, "T")[0]
	}
	if len(dStr) >= 10 {
		return dStr[:10]
	}
	return dStr
}

// Helper calculation function
func CalculateRevenueDetails(emp Employee) EmployeeRevenueAnalysis {
	totalDirectCost := emp.SallaryGross + emp.TunjanganPenempatan + emp.TunjanganKeahlian
	cogs := totalDirectCost * emp.Koefisien
	marginNominal := emp.RevenueNett - cogs

	empStatus := emp.Status
	if empStatus == "" {
		empStatus = "Active"
	}
	isActive := empStatus != "Resign"
	
	var marginPercent float64
	if emp.RevenueNett > 0 {
		marginPercent = (marginNominal / emp.RevenueNett) * 100.0
	} else {
		marginPercent = 0.0
	}

	var status string
	if marginPercent <= 12 {
		status = "Low"
	} else if marginPercent <= 28 {
		status = "Mid"
	} else {
		status = "High"
	}

	groupName := "-"
	if emp.Group != nil {
		if emp.Group.BrandName != "" {
			groupName = emp.Group.BrandName
		} else {
			groupName = emp.Group.GroupName
		}
	}

	customerName := "On Bench"
	if emp.Customer != nil {
		customerName = emp.Customer.CustomerName
	}

	startClean := cleanDate(emp.StartContract)
	endClean := cleanDate(emp.EndContract)

	return EmployeeRevenueAnalysis{
		IDEmployee:          emp.IDEmployee,
		EmployeeName:        emp.EmployeeName,
		EmployeeRole:        emp.EmployeeRole,
		Status:              empStatus,
		IsActive:            isActive,
		GroupName:           groupName,
		CustomerName:        customerName,
		ContractPeriod:      startClean + " s/d " + endClean,
		StartContract:       startClean,
		EndContract:         endClean,
		LastSalaryIncrementDate: cleanDate(emp.LastSalaryIncrementDate),
		Remarks:             emp.Remarks,
		SallaryGross:        emp.SallaryGross,
		TunjanganPenempatan: emp.TunjanganPenempatan,
		TunjanganKeahlian:   emp.TunjanganKeahlian,
		TotalDirectCost:     totalDirectCost,
		Koefisien:           emp.Koefisien,
		COGS:                cogs,
		RevenueNett:         emp.RevenueNett,
		MarginNominal:       marginNominal,
		MarginPercent:       marginPercent,
		MarginStatus:        status,
	}
}

type AuditLog struct {
	ID          uint      `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	Action      string    `gorm:"type:varchar(50);not null;column:action" json:"action"`       // "CREATE", "UPDATE", "DELETE", "LOGIN", "STATUS_CHANGE"
	Entity      string    `gorm:"type:varchar(50);not null;column:entity" json:"entity"`       // "Employee", "Group", "Customer", "PersonalNote", "Auth"
	EntityID    string    `gorm:"type:varchar(50);column:entity_id" json:"entity_id"`
	Summary     string    `gorm:"type:varchar(255);not null;column:summary" json:"summary"`   // Human readable action summary
	Details     string    `gorm:"type:text;column:details" json:"details"`                     // JSON details of changes
	PerformedBy string    `gorm:"type:varchar(100);default:'admin';column:performed_by" json:"performed_by"`
	IPAddress   string    `gorm:"type:varchar(50);column:ip_address" json:"ip_address"`
	CreatedAt   time.Time `gorm:"column:created_at" json:"created_at"`
}

func (AuditLog) TableName() string {
	return "audit_logs"
}

type AssignmentHistory struct {
	ID             uint      `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	Year           int       `gorm:"index;not null;column:year" json:"year"`
	Month          int       `gorm:"index;not null;column:month" json:"month"`
	MonthName      string    `gorm:"type:varchar(10);column:month_name" json:"month_name"`
	IDEmployee     uint      `gorm:"index;column:id_employee" json:"id_employee"`
	EmployeeName   string    `gorm:"type:varchar(150);not null;column:employee_name" json:"employee_name"`
	EmployeeRole   string    `gorm:"type:varchar(100);column:employee_role" json:"employee_role"`
	IDCustomer     *uint     `gorm:"column:id_customer" json:"id_customer"`
	CustomerName   string    `gorm:"type:varchar(100);not null;column:customer_name" json:"customer_name"`
	IDGroup        *uint     `gorm:"column:id_group" json:"id_group"`
	GroupName      string    `gorm:"type:varchar(100);column:group_name" json:"group_name"`
	BrandName      string    `gorm:"type:varchar(50);column:brand_name" json:"brand_name"`
	SallaryGross   float64   `gorm:"type:numeric(15,2);column:sallary_gross" json:"sallary_gross"`
	StartContract  string    `gorm:"type:varchar(50);column:start_contract" json:"start_contract"`
	EndContract    string    `gorm:"type:varchar(50);column:end_contract" json:"end_contract"`
	IsPermanent    bool      `gorm:"type:boolean;default:false;column:is_permanent" json:"is_permanent"`
	EmployeeStatus string    `gorm:"type:varchar(20);column:employee_status" json:"employee_status"`
	CreatedAt      time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt      time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (AssignmentHistory) TableName() string {
	return "assignment_histories"
}
