package com.example.crypto.controller;

import com.example.crypto.entity.Exchange;
import com.example.crypto.repository.ExchangeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exchanges")
public class ExchangeController {

    private final ExchangeRepository exchangeRepository;

    public ExchangeController(ExchangeRepository exchangeRepository) {
        this.exchangeRepository = exchangeRepository;
    }

    @GetMapping
    public ResponseEntity<List<Exchange>> getAllExchanges() {
        List<Exchange> exchanges = exchangeRepository.findAll();
        return ResponseEntity.ok(exchanges);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exchange> getExchangeById(@PathVariable Long id) {
        return exchangeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/{id}/sync")
    public ResponseEntity<?> syncExchange(@PathVariable Long id) {
        // For now, just return a success response
        // In a real implementation, this would trigger the exchange sync process
        return ResponseEntity.ok(Map.of(
            "message", "Exchange sync initiated successfully",
            "exchangeId", id,
            "status", "success"
        ));
    }
}