package com.example.crypto.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "exchanges")
public class Exchange {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String baseUrl;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    // Constructors
    public Exchange() {}

    public Exchange(String name, String baseUrl) {
        this.name = name;
        this.baseUrl = baseUrl;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}