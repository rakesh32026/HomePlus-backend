package com.homeplus.controller;

import com.homeplus.service.OtpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class OtpController {

    private final OtpService otpService;

    public OtpController(OtpService otpService) {
        this.otpService = otpService;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) return ResponseEntity.badRequest().body(Map.of("error","email is required"));
        String code = otpService.sendOtp(email);
        boolean debug = Boolean.parseBoolean(System.getenv().getOrDefault("OTP_DEBUG","false"));
        if (debug) {
            return ResponseEntity.ok(Map.of("message","otp sent","otp", code));
        }
        return ResponseEntity.ok(Map.of("message","otp sent"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        if (email == null || email.isBlank() || otp == null || otp.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error","email and otp are required"));
        boolean ok = otpService.verifyOtp(email, otp);
        if (ok) return ResponseEntity.ok(Map.of("verified", true));
        return ResponseEntity.status(400).body(Map.of("verified", false));
    }
}
