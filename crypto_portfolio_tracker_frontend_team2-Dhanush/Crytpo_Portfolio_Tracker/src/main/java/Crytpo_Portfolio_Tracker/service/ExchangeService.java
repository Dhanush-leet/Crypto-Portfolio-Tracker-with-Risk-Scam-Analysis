package Crytpo_Portfolio_Tracker.service;

import Crytpo_Portfolio_Tracker.dto.ExchangeConnectionRequest;
import Crytpo_Portfolio_Tracker.dto.ExchangeConnectionResponse;
import Crytpo_Portfolio_Tracker.entity.ExchangeConnection;
import Crytpo_Portfolio_Tracker.repository.ExchangeConnectionRepository;
import Crytpo_Portfolio_Tracker.repository.UserRepository;
import Crytpo_Portfolio_Tracker.utils.EncryptionUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExchangeService {
    
    @Autowired
    private ExchangeConnectionRepository exchangeConnectionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EncryptionUtil encryptionUtil;
    
    @Autowired
    private BinanceService binanceService;
    
    public ExchangeConnectionResponse connectExchange(ExchangeConnectionRequest request) {
        try {
            // Get current user ID from authentication
            Long userId = getCurrentUserId();
            
            // Check if connection already exists
            if (exchangeConnectionRepository.existsByUserIdAndExchangeName(userId, request.getExchangeName())) {
                throw new IllegalArgumentException("Connection already exists for this exchange");
            }
            
            // Test the connection first
            BinanceService.BinanceConnectionResult testResult = null;
            
            if ("BINANCE".equalsIgnoreCase(request.getExchangeName())) {
                testResult = binanceService.testConnection(request.getApiKey(), request.getApiSecret());
            } else {
                throw new UnsupportedOperationException("Exchange not supported: " + request.getExchangeName());
            }
            
            // Create connection entity
            ExchangeConnection connection = new ExchangeConnection();
            connection.setUserId(userId);
            connection.setExchangeName(request.getExchangeName().toUpperCase());
            connection.setEncryptedApiKey(encryptionUtil.encrypt(request.getApiKey()));
            connection.setEncryptedApiSecret(encryptionUtil.encrypt(request.getApiSecret()));
            
            if (request.getPassphrase() != null) {
                connection.setEncryptedPassphrase(encryptionUtil.encrypt(request.getPassphrase()));
            }
            
            connection.setIsTestnet(request.getIsTestnet());
            connection.setIsActive(true);
            
            // Set connection status based on test result
            if (testResult != null && testResult.isSuccess()) {
                connection.setConnectionStatus(ExchangeConnection.ConnectionStatus.CONNECTED);
                connection.setLastUsed(LocalDateTime.now());
            } else {
                connection.setConnectionStatus(ExchangeConnection.ConnectionStatus.ERROR);
                connection.setErrorMessage(testResult != null ? testResult.getMessage() : "Connection test failed");
            }
            
            // Save connection
            ExchangeConnection savedConnection = exchangeConnectionRepository.save(connection);
            
            // Create response
            ExchangeConnectionResponse response = ExchangeConnectionResponse.fromEntity(savedConnection);
            
            // Add test results to response
            if (testResult != null) {
                response.setConnectionTestResult(testResult.isSuccess());
                response.setConnectionTestMessage(testResult.getMessage());
                response.setAccountType(testResult.getAccountType());
                response.setCanTrade(testResult.isCanTrade());
            }
            
            return response;
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to connect exchange: " + e.getMessage(), e);
        }
    }
    
    public List<ExchangeConnectionResponse> getUserConnections() {
        Long userId = getCurrentUserId();
        List<ExchangeConnection> connections = exchangeConnectionRepository.findByUserIdAndIsActive(userId, true);
        
        return connections.stream()
            .map(ExchangeConnectionResponse::fromEntity)
            .collect(Collectors.toList());
    }
    
    public ExchangeConnectionResponse getConnectionById(Long connectionId) {
        Long userId = getCurrentUserId();
        ExchangeConnection connection = exchangeConnectionRepository.findById(connectionId)
            .orElseThrow(() -> new IllegalArgumentException("Connection not found"));
        
        // Ensure user owns this connection
        if (!connection.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }
        
        return ExchangeConnectionResponse.fromEntity(connection);
    }
    
    public ExchangeConnectionResponse testConnection(Long connectionId) {
        Long userId = getCurrentUserId();
        ExchangeConnection connection = exchangeConnectionRepository.findById(connectionId)
            .orElseThrow(() -> new IllegalArgumentException("Connection not found"));
        
        // Ensure user owns this connection
        if (!connection.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }
        
        // Decrypt API credentials
        String apiKey = encryptionUtil.decrypt(connection.getEncryptedApiKey());
        String apiSecret = encryptionUtil.decrypt(connection.getEncryptedApiSecret());
        
        BinanceService.BinanceConnectionResult testResult = null;
        
        if ("BINANCE".equalsIgnoreCase(connection.getExchangeName())) {
            testResult = binanceService.testConnection(apiKey, apiSecret);
        } else {
            throw new UnsupportedOperationException("Exchange not supported: " + connection.getExchangeName());
        }
        
        // Update connection status
        if (testResult.isSuccess()) {
            connection.setConnectionStatus(ExchangeConnection.ConnectionStatus.CONNECTED);
            connection.setErrorMessage(null);
            connection.setLastUsed(LocalDateTime.now());
        } else {
            connection.setConnectionStatus(ExchangeConnection.ConnectionStatus.ERROR);
            connection.setErrorMessage(testResult.getMessage());
        }
        
        ExchangeConnection savedConnection = exchangeConnectionRepository.save(connection);
        ExchangeConnectionResponse response = ExchangeConnectionResponse.fromEntity(savedConnection);
        
        // Add test results
        response.setConnectionTestResult(testResult.isSuccess());
        response.setConnectionTestMessage(testResult.getMessage());
        response.setAccountType(testResult.getAccountType());
        response.setCanTrade(testResult.isCanTrade());
        
        return response;
    }
    
    public void disconnectExchange(Long connectionId) {
        Long userId = getCurrentUserId();
        ExchangeConnection connection = exchangeConnectionRepository.findById(connectionId)
            .orElseThrow(() -> new IllegalArgumentException("Connection not found"));
        
        // Ensure user owns this connection
        if (!connection.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }
        
        connection.setIsActive(false);
        connection.setConnectionStatus(ExchangeConnection.ConnectionStatus.DISCONNECTED);
        exchangeConnectionRepository.save(connection);
    }
    
    public List<ExchangeConnectionResponse> getConnectedExchanges() {
        Long userId = getCurrentUserId();
        List<ExchangeConnection> connections = exchangeConnectionRepository.findConnectedExchanges(userId);
        
        return connections.stream()
            .map(ExchangeConnectionResponse::fromEntity)
            .collect(Collectors.toList());
    }
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("User not authenticated");
        }
        
        // Extract user ID from JWT token
        String email = authentication.getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found"))
            .getId();
    }
}