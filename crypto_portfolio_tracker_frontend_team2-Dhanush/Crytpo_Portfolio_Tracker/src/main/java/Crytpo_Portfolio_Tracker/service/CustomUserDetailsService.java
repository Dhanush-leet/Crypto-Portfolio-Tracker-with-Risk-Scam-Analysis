package Crytpo_Portfolio_Tracker.service;

import Crytpo_Portfolio_Tracker.entity.User;
import Crytpo_Portfolio_Tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        if (!user.getIsActive()) {
            throw new UsernameNotFoundException("User is not active: " + email);
        }
        
        return createUserDetails(user);
    }
    
    @Transactional
    public UserDetails loadUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
        
        if (!user.getIsActive()) {
            throw new UsernameNotFoundException("User is not active: " + userId);
        }
        
        return createUserDetails(user);
    }
    
    private UserDetails createUserDetails(User user) {
        List<SimpleGrantedAuthority> authorities = getAuthorities(user.getRole());
        
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(authorities)
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!user.getIsActive())
                .build();
    }
    
    private List<SimpleGrantedAuthority> getAuthorities(User.UserRole role) {
        switch (role) {
            case ROLE_ADMIN:
                return Arrays.asList(
                    new SimpleGrantedAuthority("ROLE_ADMIN"),
                    new SimpleGrantedAuthority("ROLE_USER")
                );
            case ROLE_USER:
            default:
                return Arrays.asList(new SimpleGrantedAuthority("ROLE_USER"));
        }
    }
}