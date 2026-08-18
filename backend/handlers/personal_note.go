package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"resource-management-system/database"
	"resource-management-system/middleware"
	"resource-management-system/models"
)

type PersonalNoteRequestPayload struct {
	NetSalary float64  `json:"net_salary"`
	TK0K0     *float64 `json:"tk0_k0"`
	K1K2      *float64 `json:"k1_k2"`
}

func GetPersonalNotes(c *gin.Context) {
	var notes []models.PersonalNote
	query := database.DB.Session(&gorm.Session{}).Model(&models.PersonalNote{})

	search := c.Query("search")
	if search != "" {
		query = query.Where("CAST(net_salary AS TEXT) LIKE ? OR CAST(tk0_k0 AS TEXT) LIKE ? OR CAST(k1_k2 AS TEXT) LIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Order("net_salary ASC").Find(&notes).Error; err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}

	middleware.RespondSuccess(c, http.StatusOK, "Personal notes reference data retrieved", notes)
}

func CreatePersonalNote(c *gin.Context) {
	var payload PersonalNoteRequestPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Invalid personal note payload")
		return
	}

	if payload.NetSalary <= 0 {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Net Salary must be greater than 0")
		return
	}

	note := models.PersonalNote{
		NetSalary: payload.NetSalary,
		TK0K0:     payload.TK0K0,
		K1K2:      payload.K1K2,
	}

	if err := database.DB.Create(&note).Error; err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}

	middleware.RespondSuccess(c, http.StatusCreated, "Personal note created successfully", note)
}

func UpdatePersonalNote(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Invalid ID")
		return
	}

	var note models.PersonalNote
	if err := database.DB.First(&note, id).Error; err != nil {
		middleware.RespondError(c, http.StatusNotFound, "Not Found", "Personal note not found")
		return
	}

	var payload PersonalNoteRequestPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Invalid payload")
		return
	}

	if payload.NetSalary > 0 {
		note.NetSalary = payload.NetSalary
	}
	note.TK0K0 = payload.TK0K0
	note.K1K2 = payload.K1K2

	if err := database.DB.Save(&note).Error; err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}

	middleware.RespondSuccess(c, http.StatusOK, "Personal note updated successfully", note)
}

func DeletePersonalNote(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Invalid ID")
		return
	}

	if err := database.DB.Delete(&models.PersonalNote{}, id).Error; err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}

	middleware.RespondSuccess(c, http.StatusOK, "Personal note deleted successfully", nil)
}
