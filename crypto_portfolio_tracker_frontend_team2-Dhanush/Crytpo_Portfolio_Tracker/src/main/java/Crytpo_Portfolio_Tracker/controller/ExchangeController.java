package Crytpo_Portfolio_Tracker.controller;

import Crytpo_Portfolio_Tracker.dto.ExchangeConnectionRequest;
import Crytpo_Portfolio_Tracker.dto.ExchangeConnectionResponse;
import Crytpo_Portfolio_Tracker.service.ExchangeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exchanges")
public class ExchangeController {
    
    @Autowired
    private ExchangeService exchangeService;
    
    @PostMapping("/connect")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ExchangeConnectionResponse> connectExchange(
            @Valid @RequestBody ExchangeConnectionRequest request) {
        
        try {
            ExchangeConnectionResponse response = exchangeService.connectExchange(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<ExchangeConnectionResponse>> getUserConnections() {
        try {
            List<ExchangeConnectionResponse> connections = exchangeService.getUserConnections();
            return ResponseEntity.ok(connections);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/connected")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<ExchangeConnectionResponse>> getConnectedExchanges() {
        try {
            List<ExchangeConnectionResponse> connections = exchangeService.getConnectedExchanges();
            return ResponseEntity.ok(connections);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{connectionId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ExchangeConnectionResponse> getConnectionById(
            @PathVariable Long connectionId) {
        
        try {
            ExchangeConnectionResponse connection = exchangeService.getConnectionById(connectionId);
            return ResponseEntity.ok(connection);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/{connectionId}/test")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ExchangeConnectionResponse> testConnection(
            @PathVariable Long connectionId) {
        
        try {
            ExchangeConnectionResponse response = exchangeService.testConnection(connectionId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @DeleteMapping("/{connectionId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> disconnectExchange(@PathVariable Long connectionId) {
        try {
            exchangeService.disconnectExchange(connectionId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}