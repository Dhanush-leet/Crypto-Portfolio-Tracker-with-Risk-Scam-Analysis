package com.example.crypto.repository;

import com.example.crypto.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserIdOrderByTimestampDesc(Long userId);
    List<Transaction> findByUserIdAndExchangeOrderByTimestampDesc(Long userId, String exchange);
    List<Transaction> findByUserIdAndCoinOrderByTimestampDesc(Long userId, String coin);
}