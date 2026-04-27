package com.homeplus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
    @NotBlank(message = "Full name is required")
    @Size(min = 3, message = "Full name must be at least 3 characters")
    public String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    public String email;

    @NotBlank(message = "Phone is required")
    @Size(min = 10, max = 10, message = "Phone must be 10 digits")
    public String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    public String password;

    public String role;
}