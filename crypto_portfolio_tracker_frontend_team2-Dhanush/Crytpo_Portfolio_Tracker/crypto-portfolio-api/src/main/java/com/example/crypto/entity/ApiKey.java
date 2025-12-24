package com.example.crypto.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "apikeys")
public class ApiKey {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exchange_id", nullable = false)
    private Exchange exchange;

    private String apiKey;

    // encrypted secret
    @Column(length = 2048)
    private String apiSecretEncrypted;

    private String label;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    // Constructors
    public ApiKey() {}

    public ApiKey(User user, Exchange exchange, String apiKey, String apiSecretEncrypted, String label) {
        this.user = user;
        this.exchange = exchange;
        this.apiKey = apiKey;
        this.apiSecretEncrypted = apiSecretEncrypted;
        this.label = label;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Exchange getExchange() {
        return exchange;
    }

    public void setExchange(Exchange exchange) {
        this.exchange = exchange;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getApiSecretEncrypted() {
        return apiSecretEncrypted;
    }

    public void setApiSecretEncrypted(String apiSecretEncrypted) {
        this.apiSecretEncrypted = apiSecretEncrypted;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}