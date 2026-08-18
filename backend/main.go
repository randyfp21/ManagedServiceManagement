package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"resource-management-system/database"
	"resource-management-system/handlers"
	"resource-management-system/middleware"
)

func main() {
	// Initialize Database
	database.InitDB()

	r := gin.Default()

	// CORS Setup
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	r.Use(cors.New(config))

	// API Route Group
	api := r.Group("/api")

	// Auth routes (Public)
	auth := api.Group("/auth")
	{
		auth.POST("/login", handlers.Login)
	}

	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		// Profile
		protected.GET("/auth/me", handlers.GetMe)

		// Dashboard Overview
		protected.GET("/dashboard/overview", handlers.GetDashboardOverview)
		protected.GET("/dashboard/customer-distribution", handlers.GetCustomerDistribution)
		protected.GET("/dashboard/expiring-contracts", handlers.GetExpiringContractsAlert)
		protected.GET("/dashboard/role-summary", handlers.GetRoleSummary)
		protected.GET("/dashboard/idle-summary", handlers.GetIdleSummary)

		// Employee Master Data
		protected.GET("/employees", handlers.GetEmployees)
		protected.GET("/employees/:id", handlers.GetEmployeeByID)
		protected.POST("/employees", handlers.CreateEmployee)
		protected.PUT("/employees/:id", handlers.UpdateEmployee)
		protected.DELETE("/employees/:id", handlers.DeleteEmployee)

		// Group Master Data
		protected.GET("/groups", handlers.GetGroups)
		protected.GET("/groups/:id", handlers.GetGroupByID)
		protected.POST("/groups", handlers.CreateGroup)
		protected.PUT("/groups/:id", handlers.UpdateGroup)
		protected.DELETE("/groups/:id", handlers.DeleteGroup)

		// Customer Master Data
		protected.GET("/customers", handlers.GetCustomers)
		protected.GET("/customers/:id", handlers.GetCustomerByID)
		protected.POST("/customers", handlers.CreateCustomer)
		protected.PUT("/customers/:id", handlers.UpdateCustomer)
		protected.DELETE("/customers/:id", handlers.DeleteCustomer)

		// Summary per Month Matrix
		protected.GET("/summary/monthly-allocation", handlers.GetMonthlySummary)
		protected.GET("/summary/assigned-employees", handlers.GetAssignedEmployeesHistory)
		protected.GET("/v1/summary/assigned-employees", handlers.GetAssignedEmployeesHistory)

		// Revenue & Profitability Analysis
		protected.GET("/revenue/analysis", handlers.GetRevenueAnalysis)

		// Personal Notes (Reference Salary Table)
		protected.GET("/personal-notes", handlers.GetPersonalNotes)
		protected.POST("/personal-notes", handlers.CreatePersonalNote)
		protected.PUT("/personal-notes/:id", handlers.UpdatePersonalNote)
		protected.DELETE("/personal-notes/:id", handlers.DeletePersonalNote)

		protected.GET("/v1/personal-notes", handlers.GetPersonalNotes)
		protected.POST("/v1/personal-notes", handlers.CreatePersonalNote)
		protected.PUT("/v1/personal-notes/:id", handlers.UpdatePersonalNote)
		protected.DELETE("/v1/personal-notes/:id", handlers.DeletePersonalNote)

		// On The Bench & Timeline Activity
		protected.GET("/timeline/events", handlers.GetTimelineEvents)
		protected.GET("/v1/bench-timeline", handlers.GetBenchTimeline)

		// Audit Changes & Activity Logs
		protected.GET("/audit-logs", handlers.GetAuditLogs)
		protected.GET("/v1/audit-logs", handlers.GetAuditLogs)
		protected.POST("/v1/audit-logs/sample", handlers.SeedSampleAuditLog)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting Resource Management System backend server on port %s...", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server failed to run: %v", err)
	}
}
