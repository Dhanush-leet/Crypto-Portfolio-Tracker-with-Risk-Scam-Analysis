package com.example.crypto.service;

import com.example.crypto.dto.CoinDTO;
import com.example.crypto.dto.PortfolioSummaryDTO;
import com.example.crypto.entity.ApiKey;
import com.example.crypto.entity.User;
import com.example.crypto.repository.ApiKeyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class PortfolioService {
    
    @Autowired
    private ApiKeyRepository apiKeyRepository;
    
    @Autowired
    private BinanceConnector binanceConnector;
    
    // Cache for market prices (30 seconds TTL)
    private final Map<String, PriceCacheEntry> priceCache = new ConcurrentHashMap<>();
    private static final long PRICE_CACHE_TTL_MS = 30000; // 30 seconds
    
    /**
     * Get portfolio summary for a user
     * @param user The authenticated user
     * @return Portfolio summary DTO
     */
    public PortfolioSummaryDTO getPortfolioSummary(User user) {
        // Fetch user's API keys
        List<ApiKey> apiKeys = apiKeyRepository.findByUserId(user.getId());
        
        // Aggregate balances from all exchanges
        Map<String, BalanceInfo> aggregatedBalances = aggregateBalances(apiKeys);
        
        // Fetch current prices (from cache or live)
        Map<String, Double> prices = getCurrentPrices(new ArrayList<>(aggregatedBalances.keySet()));
        
        // Calculate portfolio metrics
        return calculatePortfolioMetrics(aggregatedBalances, prices);
    }
    
    /**
     * Sync exchange balances for a specific exchange
     * @param user The authenticated user
     * @param exchangeId The exchange ID to sync
     * @return Job ID for the sync operation
     */
    public String syncExchange(User user, Long exchangeId) {
        // In a real implementation, this would:
        // 1. Validate that the user owns the exchange
        // 2. Queue a background job to sync the exchange
        // 3. Return a job ID for tracking
        
        // For this example, we'll just simulate the process
        String jobId = UUID.randomUUID().toString();
        
        // Simulate async processing
        new Thread(() -> {
            try {
                // Simulate processing time
                Thread.sleep(5000);
                
                // In a real implementation, this would update the database
                System.out.println("Sync completed for exchange ID: " + exchangeId);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
        
        return jobId;
    }
    
    /**
     * Get raw exchange balances
     * @param user The authenticated user
     * @return Map of exchange names to balances
     */
    public Map<String, Map<String, Double>> getExchangeBalances(User user) {
        List<ApiKey> apiKeys = apiKeyRepository.findByUserId(user.getId());
        
        Map<String, Map<String, Double>> exchangeBalances = new HashMap<>();
        
        for (ApiKey apiKey : apiKeys) {
            try {
                ExchangeConnector connector = getConnectorForExchange(apiKey.getExchange().getName());
                if (connector != null) {
                    Map<String, Double> balances = connector.fetchBalances(apiKey);
                    exchangeBalances.put(apiKey.getExchange().getName(), balances);
                }
            } catch (Exception e) {
                // Log error but continue with other exchanges
                System.err.println("Failed to fetch balances for exchange: " + 
                    apiKey.getExchange().getName() + ", error: " + e.getMessage());
            }
        }
        
        return exchangeBalances;
    }
    
    /**
     * Aggregate balances from all exchanges
     */
    private Map<String, BalanceInfo> aggregateBalances(List<ApiKey> apiKeys) {
        Map<String, BalanceInfo> aggregatedBalances = new HashMap<>();
        
        for (ApiKey apiKey : apiKeys) {
            try {
                ExchangeConnector connector = getConnectorForExchange(apiKey.getExchange().getName());
                if (connector != null) {
                    Map<String, Double> balances = connector.fetchBalances(apiKey);
                    
                    // Aggregate balances by coin symbol
                    for (Map.Entry<String, Double> entry : balances.entrySet()) {
                        String coinSymbol = entry.getKey();
                        Double amount = entry.getValue();
                        
                        if (amount > 0) { // Only include coins with positive balance
                            BalanceInfo balanceInfo = aggregatedBalances.computeIfAbsent(
                                coinSymbol, k -> new BalanceInfo());
                            
                            balanceInfo.totalAmount += amount;
                            balanceInfo.sources.add(apiKey.getExchange().getName());
                        }
                    }
                }
            } catch (Exception e) {
                // Log error but continue with other exchanges
                System.err.println("Failed to fetch balances for exchange: " + 
                    apiKey.getExchange().getName() + ", error: " + e.getMessage());
            }
        }
        
        return aggregatedBalances;
    }
    
    /**
     * Get current prices for coins (with caching)
     */
    private Map<String, Double> getCurrentPrices(List<String> coinSymbols) {
        List<String> coinsToFetch = new ArrayList<>();
        Map<String, Double> prices = new HashMap<>();
        
        // Check cache first
        long now = System.currentTimeMillis();
        for (String coinSymbol : coinSymbols) {
            PriceCacheEntry cacheEntry = priceCache.get(coinSymbol);
            if (cacheEntry != null && (now - cacheEntry.timestamp) < PRICE_CACHE_TTL_MS) {
                prices.put(coinSymbol, cacheEntry.price);
            } else {
                coinsToFetch.add(coinSymbol);
            }
        }
        
        // Fetch missing prices
        if (!coinsToFetch.isEmpty()) {
            try {
                // For simplicity, we'll use the Binance connector to fetch prices
                // In a real implementation, you might want to use a dedicated price service
                Map<String, Double> freshPrices = binanceConnector.fetchPrices(coinsToFetch);
                
                // Update cache
                for (Map.Entry<String, Double> entry : freshPrices.entrySet()) {
                    priceCache.put(entry.getKey(), new PriceCacheEntry(entry.getValue(), now));
                }
                
                prices.putAll(freshPrices);
            } catch (Exception e) {
                // If we can't fetch fresh prices, log the error but continue
                System.err.println("Failed to fetch prices: " + e.getMessage());
            }
        }
        
        return prices;
    }
    
    /**
     * Calculate portfolio metrics
     */
    private PortfolioSummaryDTO calculatePortfolioMetrics(
            Map<String, BalanceInfo> aggregatedBalances, 
            Map<String, Double> prices) {
        
        BigDecimal totalUsd = BigDecimal.ZERO;
        BigDecimal change24hUsd = BigDecimal.ZERO;
        int coinsOwned = 0;
        List<CoinDTO> coins = new ArrayList<>();
        
        // For this example, we'll use fixed 24h change percentages
        // In a real implementation, you would fetch this data from a market data API
        Map<String, BigDecimal> change24hPctMap = createChange24hPctMap();
        
        for (Map.Entry<String, BalanceInfo> entry : aggregatedBalances.entrySet()) {
            String coinSymbol = entry.getKey();
            BalanceInfo balanceInfo = entry.getValue();
            Double price = prices.get(coinSymbol);
            
            if (price != null && price > 0) {
                BigDecimal amount = BigDecimal.valueOf(balanceInfo.totalAmount);
                BigDecimal usdValue = amount.multiply(BigDecimal.valueOf(price));
                BigDecimal change24hPct = change24hPctMap.getOrDefault(coinSymbol, BigDecimal.ZERO);
                
                // Calculate 24h change in USD
                // Formula: usdValue * change24hPct / (100 + change24hPct)
                BigDecimal previousValue = usdValue.divide(
                    BigDecimal.ONE.add(change24hPct.divide(BigDecimal.valueOf(100))), 
                    BigDecimal.ROUND_HALF_UP);
                BigDecimal changeUsd = usdValue.subtract(previousValue);
                
                totalUsd = totalUsd.add(usdValue);
                change24hUsd = change24hUsd.add(changeUsd);
                coinsOwned++;
                
                CoinDTO coinDTO = new CoinDTO();
                coinDTO.setId(coinSymbol.toLowerCase());
                coinDTO.setSymbol(coinSymbol);
                coinDTO.setAmount(amount);
                coinDTO.setPriceUsd(BigDecimal.valueOf(price));
                coinDTO.setChange24hPct(change24hPct);
                coinDTO.setUsdValue(usdValue);
                coinDTO.setExchangeSource(new ArrayList<>(balanceInfo.sources));
                
                coins.add(coinDTO);
            }
        }
        
        // Calculate overall 24h change percentage
        BigDecimal change24hPct = BigDecimal.ZERO;
        if (totalUsd.compareTo(BigDecimal.ZERO) > 0) {
            change24hPct = change24hUsd.multiply(BigDecimal.valueOf(100))
                .divide(totalUsd, BigDecimal.ROUND_HALF_UP);
        }
        
        return new PortfolioSummaryDTO(
            totalUsd, 
            change24hUsd, 
            change24hPct, 
            coinsOwned, 
            coins
        );
    }
    
    /**
     * Get connector for a specific exchange
     */
    private ExchangeConnector getConnectorForExchange(String exchangeName) {
        // In a real implementation, you would have a registry of connectors
        if ("Binance".equalsIgnoreCase(exchangeName)) {
            return binanceConnector;
        }
        // Add other exchanges as needed
        return null;
    }
    
    /**
     * Create a map of 24h change percentages for coins (simulated data)
     */
    private Map<String, BigDecimal> createChange24hPctMap() {
        Map<String, BigDecimal> changeMap = new HashMap<>();
        changeMap.put("BTC", new BigDecimal("2.5"));
        changeMap.put("ETH", new BigDecimal("1.8"));
        changeMap.put("BNB", new BigDecimal("3.2"));
        changeMap.put("DOGE", new BigDecimal("5.1"));
        return changeMap;
    }
    
    /**
     * Helper class to store balance information
     */
    private static class BalanceInfo {
        double totalAmount = 0.0;
        Set<String> sources = new HashSet<>();
    }
    
    /**
     * Helper class for price caching
     */
    private static class PriceCacheEntry {
        final double price;
        final long timestamp;
        
        PriceCacheEntry(double price, long timestamp) {
            this.price = price;
            this.timestamp = timestamp;
        }
    }
}