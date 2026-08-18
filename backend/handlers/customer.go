package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"resource-management-system/database"
	"resource-management-system/middleware"
	"resource-management-system/models"
)

type CustomerWithCount struct {
	models.Customer
	EmployeeCount int64 `json:"employee_count"`
}

func GetCustomers(c *gin.Context) {
	var customers []models.Customer
	if err := database.DB.Find(&customers).Error; err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}

	var result []CustomerWithCount
	for _, cust := range customers {
		var count int64
		database.DB.Model(&models.Employee{}).Where("id_customer = ?", cust.IDCustomer).Count(&count)
		result = append(result, CustomerWithCount{
			Customer:      cust,
			EmployeeCount: count,
		})
	}

	middleware.RespondSuccess(c, http.StatusOK, "Customers retrieved successfully", result)
}

func GetCustomerByID(c *gin.Context) {
	id := c.Param("id")
	var cust models.Customer
	if err := database.DB.Preload("Employees").First(&cust, id).Error; err != nil {
		middleware.RespondError(c, http.StatusNotFound, "Not Found", "Customer not found")
		return
	}
	middleware.RespondSuccess(c, http.StatusOK, "Customer detail retrieved", cust)
}

func CreateCustomer(c *gin.Context) {
	var cust models.Customer
	if err := c.ShouldBindJSON(&cust); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Invalid customer payload")
		return
	}

	if cust.CustomerName == "" || cust.CustomerStartContract == "" || cust.CustomerEndContract == "" {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "customer_name, customer_start_contract, and customer_end_contract are required")
		return
	}

	if err := database.DB.Create(&cust).Error; err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}

	middleware.RespondSuccess(c, http.StatusCreated, "Customer created successfully", cust)
}

func UpdateCustomer(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Invalid customer ID")
		return
	}

	var cust models.Customer
	if err := database.DB.First(&cust, id).Error; err != nil {
		middleware.RespondError(c, http.StatusNotFound, "Not Found", "Customer not found")
		return
	}

	var req models.Customer
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Invalid payload")
		return
	}

	if req.CustomerName != "" {
		cust.CustomerName = req.CustomerName
	}
	if req.CustomerStartContract != "" {
		cust.CustomerStartContract = req.CustomerStartContract
	}
	if req.CustomerEndContract != "" {
		cust.CustomerEndContract = req.CustomerEndContract
	}

	if err := database.DB.Save(&cust).Error; err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}

	middleware.RespondSuccess(c, http.StatusOK, "Customer updated successfully", cust)
}

func DeleteCustomer(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Invalid customer ID")
		return
	}

	if err := database.DB.Delete(&models.Customer{}, id).Error; err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}

	middleware.RespondSuccess(c, http.StatusOK, "Customer deleted successfully", nil)
}
