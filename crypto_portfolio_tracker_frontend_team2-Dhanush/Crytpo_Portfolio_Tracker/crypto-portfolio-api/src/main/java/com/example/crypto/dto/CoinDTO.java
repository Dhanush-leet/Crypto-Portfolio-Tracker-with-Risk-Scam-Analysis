package com.example.crypto.dto;

import java.math.BigDecimal;
import java.util.List;

public class CoinDTO {
    private String id;
    private String symbol;
    private BigDecimal amount;
    private BigDecimal priceUsd;
    private BigDecimal change24hPct;
    private BigDecimal usdValue;
    private List<String> exchangeSource;

    // Constructors
    public CoinDTO() {}

    public CoinDTO(String id, String symbol, BigDecimal amount, BigDecimal priceUsd, 
                   BigDecimal change24hPct, BigDecimal usdValue, List<String> exchangeSource) {
        this.id = id;
        this.symbol = symbol;
        this.amount = amount;
        this.priceUsd = priceUsd;
        this.change24hPct = change24hPct;
        this.usdValue = usdValue;
        this.exchangeSource = exchangeSource;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getPriceUsd() {
        return priceUsd;
    }

    public void setPriceUsd(BigDecimal priceUsd) {
        this.priceUsd = priceUsd;
    }

    public BigDecimal getChange24hPct() {
        return change24hPct;
    }

    public void setChange24hPct(BigDecimal change24hPct) {
        this.change24hPct = change24hPct;
    }

    public BigDecimal getUsdValue() {
        return usdValue;
    }

    public void setUsdValue(BigDecimal usdValue) {
        this.usdValue = usdValue;
    }

    public List<String> getExchangeSource() {
        return exchangeSource;
    }

    public void setExchangeSource(List<String> exchangeSource) {
        this.exchangeSource = exchangeSource;
    }
}