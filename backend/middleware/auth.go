package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var JWTSecret = []byte(getSecret())

func getSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "super_secret_resource_management_key_2026"
	}
	return secret
}

type StandardResponse struct {
	Status  int         `json:"status"`
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

func RespondSuccess(c *gin.Context, statusCode int, message string, data interface{}) {
	c.JSON(statusCode, StandardResponse{
		Status:  statusCode,
		Success: true,
		Message: message,
		Data:    data,
	})
}

func RespondError(c *gin.Context, statusCode int, message string, errDetail string) {
	c.JSON(statusCode, StandardResponse{
		Status:  statusCode,
		Success: false,
		Message: message,
		Error:   errDetail,
	})
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			RespondError(c, http.StatusUnauthorized, "Unauthorized", "Missing authorization header")
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			RespondError(c, http.StatusUnauthorized, "Unauthorized", "Invalid authorization header format")
			c.Abort()
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return JWTSecret, nil
		})

		if err != nil || !token.Valid {
			RespondError(c, http.StatusUnauthorized, "Unauthorized", "Token is invalid or expired")
			c.Abort()
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			c.Set("userID", claims["user_id"])
			c.Set("username", claims["username"])
			c.Set("role", claims["role"])
		}

		c.Next()
	}
}

func RequireWriteAccess() gin.HandlerFunc {
	return func(c *gin.Context) {
		method := c.Request.Method
		if method == "POST" || method == "PUT" || method == "DELETE" || method == "PATCH" {
			if strings.HasSuffix(c.Request.URL.Path, "/login") {
				c.Next()
				return
			}

			role, exists := c.Get("role")
			if exists {
				if roleStr, ok := role.(string); ok {
					if strings.EqualFold(roleStr, "Viewer") || strings.EqualFold(roleStr, "ViewOnly") || strings.EqualFold(roleStr, "Guest") {
						RespondError(c, http.StatusForbidden, "Forbidden", "Akses Ditolak: User Viewer hanya memiliki akses baca (Read-Only)")
						c.Abort()
						return
					}
				}
			}
		}
		c.Next()
	}
}
