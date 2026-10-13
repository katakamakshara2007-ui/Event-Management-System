package com.eventmanagement.backend.controller;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.eventmanagement.backend.entity.User;
import com.eventmanagement.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;
    public UserController(UserRepository userRepository) { this.userRepository = userRepository; }

    @PostMapping("/register") public ResponseEntity<?> register(@RequestBody User user) {
        if (user.getFullName() == null || user.getFullName().isBlank() || user.getEmail() == null || user.getEmail().isBlank() || user.getPassword() == null || user.getPassword().isBlank())
            return ResponseEntity.badRequest().body("Full name, email, and password are required.");
        if (userRepository.findByEmail(user.getEmail().trim()).isPresent()) return ResponseEntity.status(HttpStatus.CONFLICT).body("An account with this email already exists.");
        user.setId(null); user.setEmail(user.getEmail().trim());
        if (user.getRole() == null || user.getRole().isBlank()) user.setRole("user");
        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body("Registration successful.");
    }

    @PostMapping("/login") public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email"); String password = credentials.get("password");
        if (email == null || password == null) return ResponseEntity.badRequest().body("Email and password are required.");
        User user = userRepository.findByEmail(email.trim()).orElse(null);
        if (user == null || !user.getPassword().equals(password)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
        return ResponseEntity.ok(Map.of("message", "Login successful.", "email", user.getEmail(), "fullName", user.getFullName(), "role", user.getRole() == null ? "user" : user.getRole()));
    }
}
