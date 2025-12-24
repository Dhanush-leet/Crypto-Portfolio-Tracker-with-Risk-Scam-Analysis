package com.example.crypto.controller;

import com.example.crypto.entity.ApiKey;
import com.example.crypto.entity.Exchange;
import com.example.crypto.entity.User;
import com.example.crypto.repository.ApiKeyRepository;
import com.example.crypto.repository.ExchangeRepository;
import com.example.crypto.repository.UserRepository;
import com.example.crypto.security.CryptoService;
import com.example.crypto.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/apikeys")
public class ApiKeyController {

    private final ApiKeyRepository apiKeyRepository;
    private final ExchangeRepository exchangeRepository;
    private final UserRepository userRepository;
    private final CryptoService cryptoService;

    public ApiKeyController(ApiKeyRepository apiKeyRepository, 
                          ExchangeRepository exchangeRepository,
                          UserRepository userRepository,
                          CryptoService cryptoService) {
        this.apiKeyRepository = apiKeyRepository;
        this.exchangeRepository = exchangeRepository;
        this.userRepository = userRepository;
        this.cryptoService = cryptoService;
    }

    @PostMapping
    public ResponseEntity<?> saveApiKey(@RequestBody Map<String, String> body) {
        try {
            // Get current authenticated user
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (!(principal instanceof User)) {
                return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
            }

            User user = (User) principal;
            String exchangeId = body.get("exchangeId");
            String label = body.get("label");
            String apiKey = body.get("apiKey");
            String apiSecret = body.get("apiSecret");

            if (exchangeId == null || apiKey == null || apiSecret == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "exchangeId, apiKey, and apiSecret are required"));
            }

            Optional<Exchange> exchangeOpt = exchangeRepository.findById(Long.parseLong(exchangeId));
            if (exchangeOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Exchange not found"));
            }

            Exchange exchange = exchangeOpt.get();

            // Encrypt the API secret
            String encryptedSecret = cryptoService.encrypt(apiSecret);

            ApiKey apiKeyEntity = new ApiKey();
            apiKeyEntity.setUser(user);
            apiKeyEntity.setExchange(exchange);
            apiKeyEntity.setApiKey(apiKey);
            apiKeyEntity.setApiSecretEncrypted(encryptedSecret);
            apiKeyEntity.setLabel(label);

            ApiKey saved = apiKeyRepository.save(apiKeyEntity);

            return ResponseEntity.ok(Map.of(
                "message", "API key saved successfully",
                "id", saved.getId()
            ));

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid exchange ID"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error saving API key"));
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserApiKeys() {
        try {
            // Get current authenticated user
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (!(principal instanceof User)) {
                return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
            }

            User user = (User) principal;
            List<ApiKey> apiKeys = apiKeyRepository.findByUserId(user.getId());

            // Don't return encrypted secrets
            List<Map<String, Object>> response = apiKeys.stream().map(key -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", key.getId());
                map.put("apiKey", key.getApiKey());
                map.put("label", key.getLabel());
                map.put("exchange", key.getExchange().getName());
                map.put("createdAt", key.getCreatedAt());
                return map;
            }).toList();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error retrieving API keys"));
        }
    }
}