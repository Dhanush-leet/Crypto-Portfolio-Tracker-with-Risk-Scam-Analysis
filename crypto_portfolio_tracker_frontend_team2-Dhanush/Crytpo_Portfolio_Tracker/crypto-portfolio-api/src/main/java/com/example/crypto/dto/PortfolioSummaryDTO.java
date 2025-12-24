package com.example.crypto.dto;

import java.math.BigDecimal;
import java.util.List;

public class PortfolioSummaryDTO {
    private BigDecimal totalUsd;
    private BigDecimal change24hUsd;
    private BigDecimal change24hPct;
    private int coinsOwned;
    private List<CoinDTO> coins;

    // Constructors
    public PortfolioSummaryDTO() {}

    public PortfolioSummaryDTO(BigDecimal totalUsd, BigDecimal change24hUsd, BigDecimal change24hPct, int coinsOwned, List<CoinDTO> coins) {
        this.totalUsd = totalUsd;
        this.change24hUsd = change24hUsd;
        this.change24hPct = change24hPct;
        this.coinsOwned = coinsOwned;
        this.coins = coins;
    }

    // Getters and Setters
    public BigDecimal getTotalUsd() {
        return totalUsd;
    }

    public void setTotalUsd(BigDecimal totalUsd) {
        this.totalUsd = totalUsd;
    }

    public BigDecimal getChange24hUsd() {
        return change24hUsd;
    }

    public void setChange24hUsd(BigDecimal change24hUsd) {
        this.change24hUsd = change24hUsd;
    }

    public BigDecimal getChange24hPct() {
        return change24hPct;
    }

    public void setChange24hPct(BigDecimal change24hPct) {
        this.change24hPct = change24hPct;
    }

    public int getCoinsOwned() {
        return coinsOwned;
    }

    public void setCoinsOwned(int coinsOwned) {
        this.coinsOwned = coinsOwned;
    }

    public List<CoinDTO> getCoins() {
        return coins;
    }

    public void setCoins(List<CoinDTO> coins) {
        this.coins = coins;
    }
}