package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"resource-management-system/database"
	"resource-management-system/middleware"
	"resource-management-system/models"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "Bad Request", "Username and password are required")
		return
	}

	var user models.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		middleware.RespondError(c, http.StatusUnauthorized, "Unauthorized", "Invalid username or password")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		middleware.RespondError(c, http.StatusUnauthorized, "Unauthorized", "Invalid username or password")
		return
	}

	// Generate JWT
	claims := jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(middleware.JWTSecret)
	if err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "Internal Server Error", "Failed to generate authentication token")
		return
	}

	LogAudit("LOGIN", "Auth", fmt.Sprintf("%d", user.ID), "User "+user.Name+" berhasil login ke sistem", fmt.Sprintf(`{"username":"%s","role":"%s"}`, user.Username, user.Role), user.Username, c.ClientIP())

	middleware.RespondSuccess(c, http.StatusOK, "Login successful", LoginResponse{
		Token: tokenString,
		User:  user,
	})
}

func GetMe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		middleware.RespondError(c, http.StatusUnauthorized, "Unauthorized", "User context not found")
		return
	}

	var uid interface{} = userID
	switch v := userID.(type) {
	case float64:
		uid = uint(v)
	case int:
		uid = uint(v)
	case int64:
		uid = uint(v)
	}

	var user models.User
	if err := database.DB.First(&user, uid).Error; err != nil {
		middleware.RespondError(c, http.StatusNotFound, "Not Found", "User not found")
		return
	}

	middleware.RespondSuccess(c, http.StatusOK, "User profile retrieved successfully", user)
}
