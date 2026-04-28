package com.homeplus.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.Duration;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private final MailService mailService;
    private final Random random = new Random();

    private static class OtpEntry {
        final String code;
        final Instant expiresAt;

        OtpEntry(String code, Instant expiresAt) {
            this.code = code;
            this.expiresAt = expiresAt;
        }
    }

    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    public OtpService(MailService mailService) {
        this.mailService = mailService;
    }

    public String generateOtp() {
        int otp = 100000 + random.nextInt(900000);
        return Integer.toString(otp);
    }

    public String sendOtp(String email) {
        String code = generateOtp();
        Instant expires = Instant.now().plus(Duration.ofMinutes(5));
        otpStore.put(email.toLowerCase(), new OtpEntry(code, expires));
        String subject = "Your HomePlus verification code";
        String text = "Your verification code is: " + code + "\nThis code will expire in 5 minutes.";
        try {
            mailService.sendSimpleMessage(email, subject, text);
        } catch (Exception ex) {
            // swallow mail exceptions for debug/local runs; OTP still stored
        }
        return code;
    }

    public boolean verifyOtp(String email, String code) {
        OtpEntry entry = otpStore.get(email.toLowerCase());
        if (entry == null) return false;
        if (Instant.now().isAfter(entry.expiresAt)) {
            otpStore.remove(email.toLowerCase());
            return false;
        }
        boolean ok = entry.code.equals(code);
        if (ok) otpStore.remove(email.toLowerCase());
        return ok;
    }
}
