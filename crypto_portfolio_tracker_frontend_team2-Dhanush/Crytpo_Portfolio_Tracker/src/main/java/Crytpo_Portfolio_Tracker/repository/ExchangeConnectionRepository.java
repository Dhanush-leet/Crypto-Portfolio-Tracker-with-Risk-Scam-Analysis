package Crytpo_Portfolio_Tracker.repository;

import Crytpo_Portfolio_Tracker.entity.ExchangeConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExchangeConnectionRepository extends JpaRepository<ExchangeConnection, Long> {
    
    List<ExchangeConnection> findByUserIdAndIsActive(Long userId, Boolean isActive);
    
    Optional<ExchangeConnection> findByUserIdAndExchangeName(Long userId, String exchangeName);
    
    Boolean existsByUserIdAndExchangeName(Long userId, String exchangeName);
    
    @Query("SELECT ec FROM ExchangeConnection ec WHERE ec.userId = :userId AND ec.connectionStatus = 'CONNECTED'")
    List<ExchangeConnection> findConnectedExchanges(@Param("userId") Long userId);
    
    @Query("SELECT ec FROM ExchangeConnection ec WHERE ec.userId = :userId AND ec.isActive = true ORDER BY ec.createdAt DESC")
    List<ExchangeConnection> findActiveConnectionsByUserId(@Param("userId") Long userId);
}