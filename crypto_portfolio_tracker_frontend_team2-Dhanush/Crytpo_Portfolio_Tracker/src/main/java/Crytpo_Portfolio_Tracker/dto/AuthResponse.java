package Crytpo_Portfolio_Tracker.dto;

import java.time.LocalDateTime;

public class AuthResponse {
    
    private String token;
    private String type = "Bearer";
    private Long userId;
    private String email;
    private String fullName;
    private String username;
    private String role;
    private LocalDateTime expiresAt;
    private String message;
    
    // Constructors
    public AuthResponse() {}
    
    public AuthResponse(String token, Long userId, String email, String fullName, 
                       String username, String role, LocalDateTime expiresAt) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.username = username;
        this.role = role;
        this.expiresAt = expiresAt;
    }
    
    public static AuthResponse success(String token, Long userId, String email, 
                                     String fullName, String username, String role, 
                                     LocalDateTime expiresAt) {
        return new AuthResponse(token, userId, email, fullName, username, role, expiresAt);
    }
    
    public static AuthResponse error(String message) {
        AuthResponse response = new AuthResponse();
        response.setMessage(message);
        return response;
    }
    
    // Getters and Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    // Utility methods
    public boolean isSuccess() {
        return token != null && !token.trim().isEmpty();
    }
    
    public boolean hasError() {
        return message != null && !message.trim().isEmpty();
    }
}