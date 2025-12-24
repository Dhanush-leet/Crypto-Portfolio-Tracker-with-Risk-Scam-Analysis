package com.example.crypto;

import com.example.crypto.entity.Exchange;
import com.example.crypto.entity.User;
import com.example.crypto.repository.ExchangeRepository;
import com.example.crypto.repository.UserRepository;
import com.example.crypto.security.CryptoService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Arrays;

@SpringBootApplication
@EnableScheduling
public class CryptoPortfolioApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(CryptoPortfolioApiApplication.class, args);
    }

    @Bean
    CommandLineRunner initData(ExchangeRepository exchangeRepository, 
                              UserRepository userRepository, 
                              CryptoService cryptoService) {
        return args -> {
            // Seed exchanges
            if (exchangeRepository.count() == 0) {
                exchangeRepository.saveAll(Arrays.asList(
                    new Exchange("Binance", "https://api.binance.com"),
                    new Exchange("Coinbase", "https://api.exchange.coinbase.com"),
                    new Exchange("Kraken", "https://api.kraken.com")
                ));
            }

            // Seed demo user
            if (userRepository.findByEmail("demo@example.com").isEmpty()) {
                User demoUser = new User("Demo User", "demo@example.com", 
                                        new BCryptPasswordEncoder().encode("demopass"));
                demoUser.setRole("USER");
                userRepository.save(demoUser);
            }
        };
    }
}