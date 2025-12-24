package Crytpo_Portfolio_Tracker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "exchange_connections")
@EntityListeners(AuditingEntityListener.class)
public class ExchangeConnection {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(max = 50)
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @NotBlank
    @Size(max = 50)
    @Column(name = "exchange_name", nullable = false)
    private String exchangeName;
    
    @Column(name = "encrypted_api_key", nullable = false)
    private String encryptedApiKey;
    
    @Column(name = "encrypted_api_secret", nullable = false)
    private String encryptedApiSecret;
    
    @Column(name = "encrypted_passphrase")
    private String encryptedPassphrase; // For exchanges that require it
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "is_testnet", nullable = false)
    private Boolean isTestnet = true;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "last_used")
    private LocalDateTime lastUsed;
    
    @Column(name = "connection_status")
    @Enumerated(EnumType.STRING)
    private ConnectionStatus connectionStatus = ConnectionStatus.DISCONNECTED;
    
    @Column(name = "error_message")
    private String errorMessage;
    
    @Column(name = "permissions")
    private String permissions; // JSON string of API permissions
    
    // Constructors
    public ExchangeConnection() {}
    
    public ExchangeConnection(Long userId, String exchangeName, String encryptedApiKey, 
                            String encryptedApiSecret, Boolean isTestnet) {
        this.userId = userId;
        this.exchangeName = exchangeName;
        this.encryptedApiKey = encryptedApiKey;
        this.encryptedApiSecret = encryptedApiSecret;
        this.isTestnet = isTestnet;
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
    
    public String getEncryptedApiKey() {
        return encryptedApiKey;
    }
    
    public void setEncryptedApiKey(String encryptedApiKey) {
        this.encryptedApiKey = encryptedApiKey;
    }
    
    public String getEncryptedApiSecret() {
        return encryptedApiSecret;
    }
    
    public void setEncryptedApiSecret(String encryptedApiSecret) {
        this.encryptedApiSecret = encryptedApiSecret;
    }
    
    public String getEncryptedPassphrase() {
        return encryptedPassphrase;
    }
    
    public void setEncryptedPassphrase(String encryptedPassphrase) {
        this.encryptedPassphrase = encryptedPassphrase;
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
    
    public ConnectionStatus getConnectionStatus() {
        return connectionStatus;
    }
    
    public void setConnectionStatus(ConnectionStatus connectionStatus) {
        this.connectionStatus = connectionStatus;
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
    
    // Enums
    public enum ConnectionStatus {
        CONNECTED,
        DISCONNECTED,
        ERROR,
        TESTING
    }
    
    public enum SupportedExchanges {
        BINANCE,
        COINBASE_PRO,
        KRAKEN,
        BITFINEX,
        HUOBI
    }
}