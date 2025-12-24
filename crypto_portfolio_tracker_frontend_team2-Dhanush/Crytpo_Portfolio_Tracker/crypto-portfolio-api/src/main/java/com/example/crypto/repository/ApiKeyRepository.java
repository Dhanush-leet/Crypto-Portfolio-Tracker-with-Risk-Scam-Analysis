package com.example.crypto.repository;

import com.example.crypto.entity.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    List<ApiKey> findByUserId(Long userId);
}