package Crytpo_Portfolio_Tracker.dto;

import Crytpo_Portfolio_Tracker.entity.ExchangeConnection;

import java.time.LocalDateTime;

public class ExchangeConnectionResponse {
    
    private Long id;
    private Long userId;
    private String exchangeName;
    private Boolean isActive;
    private Boolean isTestnet;
    private ExchangeConnection.ConnectionStatus connectionStatus;
    private LocalDateTime createdAt;
    private LocalDateTime lastUsed;
    private String errorMessage;
    private String permissions;
    
    // Connection test result fields (not stored in database)
    private Boolean connectionTestResult;
    private String connectionTestMessage;
    private String accountType;
    private Boolean canTrade;
    
    // Constructors
    public ExchangeConnectionResponse() {}
    
    public ExchangeConnectionResponse(ExchangeConnection connection) {
        this.id = connection.getId();
        this.userId = connection.getUserId();
        this.exchangeName = connection.getExchangeName();
        this.isActive = connection.getIsActive();
        this.isTestnet = connection.getIsTestnet();
        this.connectionStatus = connection.getConnectionStatus();
        this.createdAt = connection.getCreatedAt();
        this.lastUsed = connection.getLastUsed();
        this.errorMessage = connection.getErrorMessage();
        this.permissions = connection.getPermissions();
    }
    
    public static ExchangeConnectionResponse fromEntity(ExchangeConnection connection) {
        return new ExchangeConnectionResponse(connection);
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getExchangeName() {
        return exchangeName;
    }
    
    public void setExchangeName(String exchangeName) {
        this.exchangeName = exchangeName;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Boolean getIsTestnet() {
        return isTestnet;
    }
    
    public void setIsTestnet(Boolean isTestnet) {
        this.isTestnet = isTestnet;
    }
    
    public ExchangeConnection.ConnectionStatus getConnectionStatus() {
        return connectionStatus;
    }
    
    public void setConnectionStatus(ExchangeConnection.ConnectionStatus connectionStatus) {
        this.connectionStatus = connectionStatus;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getLastUsed() {
        return lastUsed;
    }
    
    public void setLastUsed(LocalDateTime lastUsed) {
        this.lastUsed = lastUsed;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public String getPermissions() {
        return permissions;
    }
    
    public void setPermissions(String permissions) {
        this.permissions = permissions;
    }
    
    public Boolean getConnectionTestResult() {
        return connectionTestResult;
    }
    
    public void setConnectionTestResult(Boolean connectionTestResult) {
        this.connectionTestResult = connectionTestResult;
    }
    
    public String getConnectionTestMessage() {
        return connectionTestMessage;
    }
    
    public void setConnectionTestMessage(String connectionTestMessage) {
        this.connectionTestMessage = connectionTestMessage;
    }
    
    public String getAccountType() {
        return accountType;
    }
    
    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }
    
    public Boolean getCanTrade() {
        return canTrade;
    }
    
    public void setCanTrade(Boolean canTrade) {
        this.canTrade = canTrade;
    }
    
    // Utility methods
    public boolean isConnected() {
        return connectionStatus == ExchangeConnection.ConnectionStatus.CONNECTED;
    }
    
    public boolean hasError() {
        return connectionStatus == ExchangeConnection.ConnectionStatus.ERROR;
    }
}