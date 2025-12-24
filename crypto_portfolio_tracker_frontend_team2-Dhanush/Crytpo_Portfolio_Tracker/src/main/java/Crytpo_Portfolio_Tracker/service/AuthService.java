package Crytpo_Portfolio_Tracker.service;

import Crytpo_Portfolio_Tracker.dto.AuthRequest;
import Crytpo_Portfolio_Tracker.dto.AuthResponse;
import Crytpo_Portfolio_Tracker.entity.User;
import Crytpo_Portfolio_Tracker.repository.UserRepository;
import Crytpo_Portfolio_Tracker.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    public AuthResponse register(AuthRequest request) {
        try {
            // Validate if user already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                return AuthResponse.error("Email is already registered");
            }
            
            if (userRepository.existsByUsername(request.getUsername())) {
                return AuthResponse.error("Username is already taken");
            }
            
            // Create new user
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setFullName(request.getFullName());
            user.setUsername(request.getUsername());
            user.setRole(User.UserRole.ROLE_USER);
            user.setIsActive(true);
            user.setEmailVerified(false);
            
            User savedUser = userRepository.save(user);
            
            // Generate JWT token
            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", savedUser.getId().toString());
            claims.put("email", savedUser.getEmail());
            claims.put("role", savedUser.getRole().name());
            
            String token = jwtUtil.generateToken(savedUser.getEmail(), claims);
            LocalDateTime expiresAt = LocalDateTime.now().plus(Duration.ofMillis(jwtUtil.getExpiration()));
            
            return AuthResponse.success(
                token,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getUsername(),
                savedUser.getRole().name(),
                expiresAt
            );
            
        } catch (Exception e) {
            return AuthResponse.error("Registration failed: " + e.getMessage());
        }
    }
    
    public AuthResponse login(String email, String password) {
        try {
            // Authenticate user
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
            );
            
            // Find user
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
            
            if (!user.getIsActive()) {
                return AuthResponse.error("Account is deactivated. Please contact support.");
            }
            
            // Update last login time
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
            
            // Generate JWT token
            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", user.getId().toString());
            claims.put("email", user.getEmail());
            claims.put("role", user.getRole().name());
            
            String token = jwtUtil.generateToken(user.getEmail(), claims);
            LocalDateTime expiresAt = LocalDateTime.now().plus(Duration.ofMillis(jwtUtil.getExpiration()));
            
            return AuthResponse.success(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getUsername(),
                user.getRole().name(),
                expiresAt
            );
            
        } catch (BadCredentialsException e) {
            return AuthResponse.error("Invalid email or password");
        } catch (Exception e) {
            return AuthResponse.error("Login failed: " + e.getMessage());
        }
    }
    
    public AuthResponse validateToken(String token) {
        try {
            if (jwtUtil.validateToken(token)) {
                String email = jwtUtil.extractUsername(token);
                User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new Exception("User not found"));
                
                if (!user.getIsActive()) {
                    return AuthResponse.error("Account is deactivated");
                }
                
                return AuthResponse.success(
                    token,
                    user.getId(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getUsername(),
                    user.getRole().name(),
                    LocalDateTime.now().plus(Duration.ofMillis(jwtUtil.getExpiration()))
                );
            } else {
                return AuthResponse.error("Invalid or expired token");
            }
        } catch (Exception e) {
            return AuthResponse.error("Token validation failed: " + e.getMessage());
        }
    }
}