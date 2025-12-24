package com.example.crypto.controller;

import com.example.crypto.entity.Transaction;
import com.example.crypto.entity.User;
import com.example.crypto.repository.TransactionRepository;
import com.example.crypto.repository.UserRepository;
import com.example.crypto.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "${app.frontend.url:http://localhost:3000}")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public TransactionController(TransactionRepository transactionRepository, 
                               UserRepository userRepository,
                               JwtService jwtService) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/import")
    public ResponseEntity<?> importTransactions(@RequestParam("file") MultipartFile file,
                                              @RequestParam("exchange") String exchange) {
        try {
            // Get current authenticated user
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (!(principal instanceof User)) {
                return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
            }

            User user = (User) principal;
            
            // Parse CSV file
            List<Transaction> transactions = parseCsvFile(file, user, exchange);
            
            // Save transactions
            List<Transaction> savedTransactions = transactionRepository.saveAll(transactions);
            
            return ResponseEntity.ok(Map.of(
                "message", "Successfully imported " + savedTransactions.size() + " transactions",
                "count", savedTransactions.size()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error importing transactions: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserTransactions(@RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "20") int size) {
        try {
            // Get current authenticated user
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (!(principal instanceof User)) {
                return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
            }

            User user = (User) principal;
            
            List<Transaction> transactions = transactionRepository.findByUserIdOrderByTimestampDesc(user.getId());
            
            return ResponseEntity.ok(transactions);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error retrieving transactions: " + e.getMessage()));
        }
    }

    private List<Transaction> parseCsvFile(MultipartFile file, User user, String exchange) throws Exception {
        List<Transaction> transactions = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isFirstLine = true;
            
            while ((line = reader.readLine()) != null) {
                // Skip header line
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }
                
                String[] parts = line.split(",");
                if (parts.length >= 4) {
                    Transaction transaction = new Transaction();
                    transaction.setUser(user);
                    transaction.setExchange(exchange);
                    
                    // Parse timestamp (assuming format: yyyy-MM-dd HH:mm:ss)
                    try {
                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                        LocalDateTime dateTime = LocalDateTime.parse(parts[0], formatter);
                        transaction.setTimestamp(dateTime.atZone(ZoneOffset.UTC).toInstant());
                    } catch (Exception e) {
                        // Fallback to current time if parsing fails
                        transaction.setTimestamp(Instant.now());
                    }
                    
                    transaction.setType(parts[1]); // BUY/SELL
                    transaction.setCoin(parts[2]); // BTC, ETH, etc.
                    
                    // Parse amount
                    try {
                        transaction.setAmount(new BigDecimal(parts[3]));
                    } catch (NumberFormatException e) {
                        transaction.setAmount(BigDecimal.ZERO);
                    }
                    
                    // Parse price (if available)
                    if (parts.length > 4) {
                        try {
                            transaction.setPrice(new BigDecimal(parts[4]));
                        } catch (NumberFormatException e) {
                            transaction.setPrice(BigDecimal.ZERO);
                        }
                    }
                    
                    // Parse fees (if available)
                    if (parts.length > 5) {
                        try {
                            transaction.setFee(new BigDecimal(parts[5]));
                        } catch (NumberFormatException e) {
                            transaction.setFee(BigDecimal.ZERO);
                        }
                    }
                    
                    transactions.add(transaction);
                }
            }
        }
        
        return transactions;
    }
}