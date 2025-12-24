package com.example.crypto.service;

import com.example.crypto.entity.ApiKey;
import java.util.List;
import java.util.Map;

/**
 * Interface for connecting to cryptocurrency exchanges
 */
public interface ExchangeConnector {
    
    /**
     * Fetch balances from the exchange using the provided API key
     * @param apiKey The API key entity containing encrypted credentials
     * @return Map of coin symbols to balances
     */
    Map<String, Double> fetchBalances(ApiKey apiKey);
    
    /**
     * Fetch current prices for the specified coin IDs
     * @param coinIds List of coin IDs (e.g., "bitcoin", "ethereum")
     * @return Map of coin IDs to current prices in USD
     */
    Map<String, Double> fetchPrices(List<String> coinIds);
    
    /**
     * Get the name of the exchange this connector is for
     * @return Exchange name
     */
    String getExchangeName();
}