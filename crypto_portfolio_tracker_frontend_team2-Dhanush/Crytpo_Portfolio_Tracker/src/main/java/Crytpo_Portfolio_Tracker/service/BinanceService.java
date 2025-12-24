package Crytpo_Portfolio_Tracker.service;

import Crytpo_Portfolio_Tracker.utils.EncryptionUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.*;

@Service
public class BinanceService {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private EncryptionUtil encryptionUtil;
    
    @Value("${binance.api.key:}")
    private String defaultApiKey;
    
    @Value("${binance.testnet:true}")
    private boolean isTestnet;
    
    private static final String BINANCE_BASE_URL = "https://api.binance.com";
    private static final String BINANCE_TESTNET_URL = "https://testnet.binance.vision";
    
    public String getBaseUrl() {
        return isTestnet ? BINANCE_TESTNET_URL : BINANCE_BASE_URL;
    }
    
    public BinanceConnectionResult testConnection(String apiKey, String apiSecret) {
        try {
            // Test account information
            String accountInfo = getAccountInfo(apiKey, apiSecret);
            
            if (accountInfo != null) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode account = mapper.readTree(accountInfo);
                
                return BinanceConnectionResult.builder()
                    .success(true)
                    .message("Connection successful")
                    .accountType(account.has("accountType") ? account.get("accountType").asText() : "Unknown")
                    .canTrade(account.has("canTrade") && account.get("canTrade").asBoolean())
                    .build();
            } else {
                return BinanceConnectionResult.builder()
                    .success(false)
                    .message("Failed to retrieve account information")
                    .build();
            }
        } catch (HttpClientErrorException e) {
            return BinanceConnectionResult.builder()
                .success(false)
                .message("API authentication failed: " + e.getMessage())
                .build();
        } catch (Exception e) {
            return BinanceConnectionResult.builder()
                .success(false)
                .message("Connection test failed: " + e.getMessage())
                .build();
        }
    }
    
    public String getAccountInfo(String apiKey, String apiSecret) {
        try {
            String timestamp = String.valueOf(Instant.now().toEpochMilli());
            String query = "timestamp=" + timestamp;
            String signature = generateSignature(query, apiSecret);
            
            String url = getBaseUrl() + "/api/v3/account?" + query + "&signature=" + signature;
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-MBX-APIKEY", apiKey);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
            );
            
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get account info", e);
        }
    }
    
    public List<BinanceBalance> getBalances(String apiKey, String apiSecret) {
        try {
            String accountInfo = getAccountInfo(apiKey, apiSecret);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode account = mapper.readTree(accountInfo);
            
            List<BinanceBalance> balances = new ArrayList<>();
            JsonNode balancesNode = account.get("balances");
            
            if (balancesNode != null && balancesNode.isArray()) {
                for (JsonNode balanceNode : balancesNode) {
                    String asset = balanceNode.get("asset").asText();
                    String free = balanceNode.get("free").asText();
                    String locked = balanceNode.get("locked").asText();
                    
                    BigDecimal freeAmount = new BigDecimal(free);
                    BigDecimal lockedAmount = new BigDecimal(locked);
                    
                    if (freeAmount.compareTo(BigDecimal.ZERO) > 0 || lockedAmount.compareTo(BigDecimal.ZERO) > 0) {
                        BinanceBalance balance = new BinanceBalance();
                        balance.setAsset(asset);
                        balance.setFree(freeAmount);
                        balance.setLocked(lockedAmount);
                        balance.setTotal(freeAmount.add(lockedAmount));
                        balances.add(balance);
                    }
                }
            }
            
            return balances;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get balances", e);
        }
    }
    
    public List<BinanceTrade> getTradeHistory(String apiKey, String apiSecret, String symbol, Integer limit) {
        try {
            String timestamp = String.valueOf(Instant.now().toEpochMilli());
            StringBuilder queryBuilder = new StringBuilder("timestamp=" + timestamp);
            
            if (symbol != null) {
                queryBuilder.append("&symbol=").append(symbol);
            }
            
            if (limit != null) {
                queryBuilder.append("&limit=").append(limit);
            }
            
            String query = queryBuilder.toString();
            String signature = generateSignature(query, apiSecret);
            
            String url = getBaseUrl() + "/api/v3/myTrades?" + query + "&signature=" + signature;
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-MBX-APIKEY", apiKey);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
            );
            
            ObjectMapper mapper = new ObjectMapper();
            JsonNode tradesArray = mapper.readTree(response.getBody());
            
            List<BinanceTrade> trades = new ArrayList<>();
            for (JsonNode tradeNode : tradesArray) {
                BinanceTrade trade = new BinanceTrade();
                trade.setId(tradeNode.get("id").asLong());
                trade.setSymbol(tradeNode.get("symbol").asText());
                trade.setPrice(new BigDecimal(tradeNode.get("price").asText()));
                trade.setQty(new BigDecimal(tradeNode.get("qty").asText()));
                trade.setCommission(new BigDecimal(tradeNode.get("commission").asText()));
                trade.setCommissionAsset(tradeNode.get("commissionAsset").asText());
                trade.setTime(tradeNode.get("time").asLong());
                trade.setIsBuyer(tradeNode.get("isBuyer").asBoolean());
                trade.setIsMaker(tradeNode.get("isMaker").asBoolean());
                trades.add(trade);
            }
            
            return trades;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get trade history", e);
        }
    }
    
    private String generateSignature(String query, String secretKey) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] bytes = mac.doFinal(query.getBytes());
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : bytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            
            return hexString.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Failed to generate signature", e);
        }
    }
    
    // Data classes for Binance API responses
    public static class BinanceConnectionResult {
        private boolean success;
        private String message;
        private String accountType;
        private boolean canTrade;
        
        // Getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getAccountType() { return accountType; }
        public void setAccountType(String accountType) { this.accountType = accountType; }
        public boolean isCanTrade() { return canTrade; }
        public void setCanTrade(boolean canTrade) { this.canTrade = canTrade; }
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private BinanceConnectionResult result = new BinanceConnectionResult();
            
            public Builder success(boolean success) {
                result.setSuccess(success);
                return this;
            }
            
            public Builder message(String message) {
                result.setMessage(message);
                return this;
            }
            
            public Builder accountType(String accountType) {
                result.setAccountType(accountType);
                return this;
            }
            
            public Builder canTrade(boolean canTrade) {
                result.setCanTrade(canTrade);
                return this;
            }
            
            public BinanceConnectionResult build() {
                return result;
            }
        }
    }
    
    public static class BinanceBalance {
        private String asset;
        private BigDecimal free;
        private BigDecimal locked;
        private BigDecimal total;
        
        // Getters and setters
        public String getAsset() { return asset; }
        public void setAsset(String asset) { this.asset = asset; }
        public BigDecimal getFree() { return free; }
        public void setFree(BigDecimal free) { this.free = free; }
        public BigDecimal getLocked() { return locked; }
        public void setLocked(BigDecimal locked) { this.locked = locked; }
        public BigDecimal getTotal() { return total; }
        public void setTotal(BigDecimal total) { this.total = total; }
    }
    
    public static class BinanceTrade {
        private Long id;
        private String symbol;
        private BigDecimal price;
        private BigDecimal qty;
        private BigDecimal commission;
        private String commissionAsset;
        private Long time;
        private Boolean isBuyer;
        private Boolean isMaker;
        
        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public BigDecimal getQty() { return qty; }
        public void setQty(BigDecimal qty) { this.qty = qty; }
        public BigDecimal getCommission() { return commission; }
        public void setCommission(BigDecimal commission) { this.commission = commission; }
        public String getCommissionAsset() { return commissionAsset; }
        public void setCommissionAsset(String commissionAsset) { this.commissionAsset = commissionAsset; }
        public Long getTime() { return time; }
        public void setTime(Long time) { this.time = time; }
        public Boolean getIsBuyer() { return isBuyer; }
        public void setIsBuyer(Boolean isBuyer) { this.isBuyer = isBuyer; }
        public Boolean getIsMaker() { return isMaker; }
        public void setIsMaker(Boolean isMaker) { this.isMaker = isMaker; }
    }
}