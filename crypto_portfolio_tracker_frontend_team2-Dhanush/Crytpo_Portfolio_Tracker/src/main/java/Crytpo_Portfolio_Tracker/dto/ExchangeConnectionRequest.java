package Crytpo_Portfolio_Tracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ExchangeConnectionRequest {
    
    @NotBlank(message = "Exchange name is required")
    private String exchangeName;
    
    @NotBlank(message = "API key is required")
    @Size(min = 10, message = "API key must be at least 10 characters long")
    private String apiKey;
    
    @NotBlank(message = "API secret is required")
    @Size(min = 10, message = "API secret must be at least 10 characters long")
    private String apiSecret;
    
    private String passphrase; // Optional for some exchanges
    
    private Boolean isTestnet = true;
    
    // Constructors
    public ExchangeConnectionRequest() {}
    
    public ExchangeConnectionRequest(String exchangeName, String apiKey, String apiSecret, String passphrase, Boolean isTestnet) {
        this.exchangeName = exchangeName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.passphrase = passphrase;
        this.isTestnet = isTestnet;
    }
    
    // Getters and Setters
    public String getExchangeName() {
        return exchangeName;
    }
    
    public void setExchangeName(String exchangeName) {
        this.exchangeName = exchangeName;
    }
    
    public String getApiKey() {
        return apiKey;
    }
    
    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }
    
    public String getApiSecret() {
        return apiSecret;
    }
    
    public void setApiSecret(String apiSecret) {
        this.apiSecret = apiSecret;
    }
    
    public String getPassphrase() {
        return passphrase;
    }
    
    public void setPassphrase(String passphrase) {
        this.passphrase = passphrase;
    }
    
    public Boolean getIsTestnet() {
        return isTestnet;
    }
    
    public void setIsTestnet(Boolean isTestnet) {
        this.isTestnet = isTestnet;
    }
}