package middleware

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func generateTestToken(userID uint, username, role string, expiry time.Duration, secret []byte) string {
	claims := jwt.MapClaims{
		"user_id":  userID,
		"username": username,
		"role":     role,
		"exp":      time.Now().Add(expiry).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, _ := token.SignedString(secret)
	return tokenStr
}

func TestAuthMiddleware(t *testing.T) {
	tests := []struct {
		name           string
		authHeader     string
		expectedStatus int
		expectContext  bool
	}{
		{
			name:           "Missing Header",
			authHeader:     "",
			expectedStatus: http.StatusUnauthorized,
			expectContext:  false,
		},
		{
			name:           "Invalid Header Format (No Bearer)",
			authHeader:     "Basic dXNlcjpwYXNz",
			expectedStatus: http.StatusUnauthorized,
			expectContext:  false,
		},
		{
			name:           "Malformed Token",
			authHeader:     "Bearer invalid.token.string",
			expectedStatus: http.StatusUnauthorized,
			expectContext:  false,
		},
		{
			name:           "Wrong Secret Signature",
			authHeader:     "Bearer " + generateTestToken(1, "admin", "Manager", time.Hour, []byte("wrong_secret_key")),
			expectedStatus: http.StatusUnauthorized,
			expectContext:  false,
		},
		{
			name:           "Expired Token",
			authHeader:     "Bearer " + generateTestToken(1, "admin", "Manager", -time.Hour, JWTSecret),
			expectedStatus: http.StatusUnauthorized,
			expectContext:  false,
		},
		{
			name:           "Valid Token",
			authHeader:     "Bearer " + generateTestToken(1, "admin", "Manager", time.Hour, JWTSecret),
			expectedStatus: http.StatusOK,
			expectContext:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r := gin.New()
			var capturedUserID interface{}
			var capturedUsername interface{}

			r.Use(AuthMiddleware())
			r.GET("/protected", func(c *gin.Context) {
				capturedUserID, _ = c.Get("userID")
				capturedUsername, _ = c.Get("username")
				c.String(http.StatusOK, "OK")
			})

			req, _ := http.NewRequest("GET", "/protected", nil)
			if tt.authHeader != "" {
				req.Header.Set("Authorization", tt.authHeader)
			}
			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d. Body: %s", tt.expectedStatus, w.Code, w.Body.String())
			}

			if tt.expectContext {
				if capturedUsername != "admin" {
					t.Errorf("expected username 'admin', got %v", capturedUsername)
				}
				if capturedUserID == nil {
					t.Errorf("expected userID in context, got nil")
				}
			}
		})
	}
}

func TestRespondSuccessAndError(t *testing.T) {
	r := gin.New()
	r.GET("/success", func(c *gin.Context) {
		RespondSuccess(c, http.StatusOK, "All good", map[string]string{"foo": "bar"})
	})
	r.GET("/error", func(c *gin.Context) {
		RespondError(c, http.StatusBadRequest, "Invalid input", "Field missing")
	})

	// Test Success
	wSuccess := httptest.NewRecorder()
	reqSuccess, _ := http.NewRequest("GET", "/success", nil)
	r.ServeHTTP(wSuccess, reqSuccess)

	if wSuccess.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", wSuccess.Code)
	}

	var respSuccess StandardResponse
	json.Unmarshal(wSuccess.Body.Bytes(), &respSuccess)
	if !respSuccess.Success || respSuccess.Message != "All good" {
		t.Errorf("unexpected success response: %+v", respSuccess)
	}

	// Test Error
	wErr := httptest.NewRecorder()
	reqErr, _ := http.NewRequest("GET", "/error", nil)
	r.ServeHTTP(wErr, reqErr)

	if wErr.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", wErr.Code)
	}

	var respErr StandardResponse
	json.Unmarshal(wErr.Body.Bytes(), &respErr)
	if respErr.Success || respErr.Message != "Invalid input" || respErr.Error != "Field missing" {
		t.Errorf("unexpected error response: %+v", respErr)
	}
}
