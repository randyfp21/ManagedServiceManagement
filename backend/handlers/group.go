package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"resource-management-system/database"
	"resource-management-system/middleware"
	"resource-management-system/models"
)

type GroupWithCount struct {
	models.Group
	EmployeeCount int64 `json:"employee_count"`
}

func GetGroups(c *gin.Context) {
	var groups []models.Group
	if err := database.DB.Find(&groups).Error; err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}

	var result []GroupWithCount
	for _, g := range groups {
		var count int64
		database.DB.Model(&models.Employee{}).Where("id_group = ?", g.IDGroup).Count(&count)
		result = append(result, GroupWithCount{
			Group:         g,
			EmployeeCount: count,
		})
	}

	middleware.RespondSuccess(c, http.StatusOK, "Groups retrieved successfully", result)
}

func GetGroupByID(c *gin.Context) {
	id := c.Param("id")
	var group models.Group
	if err := database.DB.Preload("Employees").First(&group, id).Error; err != nil {
		middleware.RespondError(c, http.StatusNotFound, "Not Found", "Group not found")
		return
	}
	middleware.RespondSuccess(c, http.StatusOK, "Group detail retrieved", group)
}

func CreateGroup(c *gin.Context) {
	var group models.Group
	if err := c.ShouldBindJSON(&group); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Invalid payload: group_name is required")
		return
	}

	if group.GroupName == "" {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "group_name cannot be empty")
		return
	}

	if group.BrandName == "" {
		group.BrandName = group.GroupName
	}

	if err := database.DB.Create(&group).Error; err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}

	middleware.RespondSuccess(c, http.StatusCreated, "Group created successfully", group)
}

func UpdateGroup(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Invalid group ID")
		return
	}

	var group models.Group
	if err := database.DB.First(&group, id).Error; err != nil {
		middleware.RespondError(c, http.StatusNotFound, "Not Found", "Group not found")
		return
	}

	var req models.Group
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Invalid payload")
		return
	}

	if req.GroupName != "" {
		group.GroupName = req.GroupName
	}
	if req.BrandName != "" {
		group.BrandName = req.BrandName
	}

	if err := database.DB.Save(&group).Error; err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}

	middleware.RespondSuccess(c, http.StatusOK, "Group updated successfully", group)
}

func DeleteGroup(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Invalid group ID")
		return
	}

	if err := database.DB.Delete(&models.Group{}, id).Error; err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}

	middleware.RespondSuccess(c, http.StatusOK, "Group deleted successfully", nil)
}
