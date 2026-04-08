package com.homeplus.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.homeplus.dto.AuthResponse;
import com.homeplus.dto.LoginRequest;
import com.homeplus.dto.SignupRequest;
import com.homeplus.entity.User;
import com.homeplus.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthService service;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        try {
            User user = new User();
            user.setFullName(request.getFullName());
            user.setEmail(request.getEmail());
            user.setPhone(request.getPhone());
            user.setPassword(request.getPassword());
            user.setRole(request.getRole() != null ? request.getRole() : "HOMEOWNER");

            String token = service.signup(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(AuthResponse.builder()
                    .token(token)
                    .email(user.getEmail())
                    .message("Signup successful")
                    .build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(AuthResponse.builder()
                    .message(e.getMessage())
                    .build());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            String token = service.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(AuthResponse.builder()
                    .token(token)
                    .email(request.getEmail())
                    .message("Login successful")
                    .build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(AuthResponse.builder()
                    .message(e.getMessage())
                    .build());
        }
    }
}