package models

import (
	"math"
	"testing"
)

func TestCleanDate(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"2026-08-12T17:00:00Z", "2026-08-12"},
		{"2025-01-15", "2025-01-15"},
		{"2025-01-15-extra", "2025-01-15"},
		{"short", "short"},
	}

	for _, tt := range tests {
		got := cleanDate(tt.input)
		if got != tt.expected {
			t.Errorf("cleanDate(%q) = %q; want %q", tt.input, got, tt.expected)
		}
	}
}

func almostEqual(a, b float64) bool {
	return math.Abs(a-b) < 1e-4
}

func TestCalculateRevenueDetails_MarginStatusTiers(t *testing.T) {
	grp := Group{IDGroup: 1, GroupName: "Backend Team"}
	cust := Customer{IDCustomer: 10, CustomerName: "Test Client"}

	tests := []struct {
		name           string
		emp            Employee
		expectedStatus string
		expectedCOGS   float64
		expectedMargin float64
		expectedPct    float64
	}{
		{
			name: "Min Margin (Margin <= 0%)",
			emp: Employee{
				IDEmployee:          1,
				EmployeeName:        "John Min",
				EmployeeRole:        "Dev",
				Group:               &grp,
				Customer:            &cust,
				StartContract:       "2026-01-01",
				EndContract:         "2026-12-31",
				SallaryGross:        10000000,
				TunjanganPenempatan: 0,
				TunjanganKeahlian:   0,
				Koefisien:           1.5,
				RevenueNett:         10000000, // COGS = 15,000,000, Margin = -5,000,000
			},
			expectedStatus: "Low",
			expectedCOGS:   15000000,
			expectedMargin: -5000000,
			expectedPct:    -50.0,
		},
		{
			name: "Low Margin (0% < Margin <= 10%)",
			emp: Employee{
				IDEmployee:          2,
				EmployeeName:        "Jane Low",
				EmployeeRole:        "Dev",
				Group:               &grp,
				Customer:            &cust,
				StartContract:       "2026-01-01",
				EndContract:         "2026-12-31",
				SallaryGross:        10000000,
				TunjanganPenempatan: 0,
				TunjanganKeahlian:   0,
				Koefisien:           1.3,
				RevenueNett:         14000000, // COGS = 13,000,000, Margin = 1,000,000 (1/14 = ~7.14%)
			},
			expectedStatus: "Low",
			expectedCOGS:   13000000,
			expectedMargin: 1000000,
			expectedPct:    7.142857142857142,
		},
		{
			name: "Middle Margin (10% < Margin <= 20%)",
			emp: Employee{
				IDEmployee:          3,
				EmployeeName:        "Jane Mid",
				EmployeeRole:        "Dev",
				Group:               &grp,
				Customer:            &cust,
				StartContract:       "2026-01-01",
				EndContract:         "2026-12-31",
				SallaryGross:        10000000,
				TunjanganPenempatan: 0,
				TunjanganKeahlian:   0,
				Koefisien:           1.4,
				RevenueNett:         16500000, // COGS = 14,000,000, Margin = 2,500,000 (2.5/16.5 = ~15.15%)
			},
			expectedStatus: "Mid",
			expectedCOGS:   14000000,
			expectedMargin: 2500000,
			expectedPct:    15.151515151515152,
		},
		{
			name: "High Margin (20% < Margin <= 35%)",
			emp: Employee{
				IDEmployee:          4,
				EmployeeName:        "Sarah High",
				EmployeeRole:        "Dev",
				Group:               &grp,
				Customer:            &cust,
				StartContract:       "2026-01-01",
				EndContract:         "2026-12-31",
				SallaryGross:        10000000,
				TunjanganPenempatan: 0,
				TunjanganKeahlian:   0,
				Koefisien:           1.4,
				RevenueNett:         20000000, // COGS = 14,000,000, Margin = 6,000,000 (6/20 = 30%)
			},
			expectedStatus: "High",
			expectedCOGS:   14000000,
			expectedMargin: 6000000,
			expectedPct:    30.0,
		},
		{
			name: "Very High Margin (Margin > 35%)",
			emp: Employee{
				IDEmployee:          5,
				EmployeeName:        "Bob VHigh",
				EmployeeRole:        "Dev",
				Group:               &grp,
				Customer:            &cust,
				StartContract:       "2026-01-01",
				EndContract:         "2026-12-31",
				SallaryGross:        10000000,
				TunjanganPenempatan: 0,
				TunjanganKeahlian:   0,
				Koefisien:           1.3,
				RevenueNett:         30000000, // COGS = 13,000,000, Margin = 17,000,000 (17/30 = 56.67%)
			},
			expectedStatus: "High",
			expectedCOGS:   13000000,
			expectedMargin: 17000000,
			expectedPct:    56.666666666666664,
		},
		{
			name: "Zero Revenue Edge Case",
			emp: Employee{
				IDEmployee:          6,
				EmployeeName:        "Bench Worker",
				EmployeeRole:        "Architect",
				Group:               nil,
				Customer:            nil,
				StartContract:       "2026-01-01",
				EndContract:         "2026-12-31",
				SallaryGross:        20000000,
				TunjanganPenempatan: 0,
				TunjanganKeahlian:   4000000,
				Koefisien:           1.5,
				RevenueNett:         0,
			},
			expectedStatus: "Low",
			expectedCOGS:   30000000,
			expectedMargin: -30000000,
			expectedPct:    0.0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			res := CalculateRevenueDetails(tt.emp)
			if res.MarginStatus != tt.expectedStatus {
				t.Errorf("MarginStatus = %q; want %q", res.MarginStatus, tt.expectedStatus)
			}
			if !almostEqual(res.COGS, tt.expectedCOGS) {
				t.Errorf("COGS = %v; want %v", res.COGS, tt.expectedCOGS)
			}
			if !almostEqual(res.MarginNominal, tt.expectedMargin) {
				t.Errorf("MarginNominal = %v; want %v", res.MarginNominal, tt.expectedMargin)
			}
			if !almostEqual(res.TotalDirectCost, tt.emp.SallaryGross+tt.emp.TunjanganPenempatan+tt.emp.TunjanganKeahlian) {
				t.Errorf("TotalDirectCost incorrect")
			}
			if tt.emp.Customer == nil && res.CustomerName != "On Bench" {
				t.Errorf("CustomerName for unassigned employee should be 'On Bench', got %q", res.CustomerName)
			}
			if tt.emp.Group == nil && res.GroupName != "-" {
				t.Errorf("GroupName for unassigned employee should be '-', got %q", res.GroupName)
			}
		})
	}
}

func TestTableNames(t *testing.T) {
	if (Group{}).TableName() != "groups" {
		t.Errorf("Group TableName != groups")
	}
	if (Customer{}).TableName() != "customers" {
		t.Errorf("Customer TableName != customers")
	}
	if (Employee{}).TableName() != "employees" {
		t.Errorf("Employee TableName != employees")
	}
	if (PersonalNote{}).TableName() != "personal_notes" {
		t.Errorf("PersonalNote TableName != personal_notes")
	}
}
