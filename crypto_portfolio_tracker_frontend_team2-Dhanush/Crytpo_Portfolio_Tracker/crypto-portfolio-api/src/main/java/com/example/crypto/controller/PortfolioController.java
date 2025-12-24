package com.example.crypto.controller;

import com.example.crypto.dto.PortfolioSummaryDTO;
import com.example.crypto.dto.SyncResponseDTO;
import com.example.crypto.entity.User;
import com.example.crypto.security.JwtService;
import com.example.crypto.service.PortfolioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = "${app.frontend.url:http://localhost:3000}")
public class PortfolioController {
    
    @Autowired
    private PortfolioService portfolioService;
    
    @Autowired
    private JwtService jwtService;
    
    /**
     * Get portfolio summary for the authenticated user
     * @param request HTTP request containing JWT token
     * @return Portfolio summary DTO
     */
    @GetMapping("/summary")
    public ResponseEntity<PortfolioSummaryDTO> getPortfolioSummary(HttpServletRequest request) {
        try {
            // Extract user from JWT token
            String token = jwtService.extractTokenFromRequest(request);
            User user = jwtService.extractUserFromToken(token);
            
            // Get portfolio summary
            PortfolioSummaryDTO summary = portfolioService.getPortfolioSummary(user);
            
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Trigger sync for a specific exchange
     * @param exchangeId The exchange ID to sync
     * @param request HTTP request containing JWT token
     * @return Sync response DTO with job ID
     */
    @PostMapping("/exchanges/{exchangeId}/sync")
    public ResponseEntity<SyncResponseDTO> syncExchange(
            @PathVariable Long exchangeId,
            HttpServletRequest request) {
        try {
            // Extract user from JWT token
            String token = jwtService.extractTokenFromRequest(request);
            User user = jwtService.extractUserFromToken(token);
            
            // Trigger sync
            String jobId = portfolioService.syncExchange(user, exchangeId);
            
            // Create response
            SyncResponseDTO response = new SyncResponseDTO(
                jobId, 
                "/api/portfolio/sync-status/" + jobId
            );
            
            return ResponseEntity.accepted().body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get raw exchange balances
     * @param request HTTP request containing JWT token
     * @return Map of exchange names to balances
     */
    @GetMapping("/exchanges/balances")
    public ResponseEntity<Map<String, Map<String, Double>>> getExchangeBalances(HttpServletRequest request) {
        try {
            // Extract user from JWT token
            String token = jwtService.extractTokenFromRequest(request);
            User user = jwtService.extractUserFromToken(token);
            
            // Get exchange balances
            Map<String, Map<String, Double>> balances = portfolioService.getExchangeBalances(user);
            
            return ResponseEntity.ok(balances);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}