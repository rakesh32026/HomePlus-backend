package com.homeplus.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.homeplus.config.JwtUtil;
import com.homeplus.entity.LoginAudit;
import com.homeplus.entity.User;
import com.homeplus.repository.LoginAuditRepository;
import com.homeplus.repository.UserRepository;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private LoginAuditRepository loginAuditRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public String signup(User user) {
        if (repo.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("Email already registered");
        }
        // Hash the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = repo.save(user);
        // Return JWT token after signup
        return jwtUtil.generateToken(savedUser.getEmail());
    }

    public String login(String email, String password) {
        User user = repo.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        // Use PasswordEncoder to verify password (SECURE)
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        LoginAudit audit = new LoginAudit();
        audit.setEmail(user.getEmail());
        audit.setFullName(user.getFullName());
        audit.setRole(user.getRole());
        audit.setLoggedInAt(LocalDateTime.now());
        loginAuditRepository.save(audit);

        // Return JWT token
        return jwtUtil.generateToken(user.getEmail());
    }

    public User getUserByEmail(String email) {
        return repo.findByEmail(email);
    }
}