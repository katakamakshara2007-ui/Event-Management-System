package com.eventmanagement.backend.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import com.eventmanagement.backend.entity.Event;
import com.eventmanagement.backend.entity.Registration;
import com.eventmanagement.backend.repository.EventRepository;
import com.eventmanagement.backend.repository.RegistrationRepository;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {
    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    public RegistrationController(RegistrationRepository registrationRepository, EventRepository eventRepository) {
        this.registrationRepository = registrationRepository; this.eventRepository = eventRepository;
    }

    @PostMapping public ResponseEntity<?> registerForEvent(@RequestBody Registration registration) {
        if (registration.getUserEmail() == null || registration.getUserEmail().isBlank() || registration.getEventId() == null)
            return ResponseEntity.badRequest().body("Email and event ID are required.");
        Event event = eventRepository.findById(registration.getEventId()).orElse(null);
        if (event == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Event not found.");
        if (registrationRepository.existsByUserEmailAndEventId(registration.getUserEmail(), registration.getEventId()))
            return ResponseEntity.status(HttpStatus.CONFLICT).body("You have already registered for this event.");
        if (event.getAvailableSeats() <= 0) return ResponseEntity.status(HttpStatus.CONFLICT).body("Sorry, no seats are available.");
        registration.setId(null);
        Registration saved = registrationRepository.save(registration);
        event.setAvailableSeats(event.getAvailableSeats() - 1); eventRepository.save(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping public List<Registration> getRegistrations(@RequestParam String userEmail) {
        return registrationRepository.findByUserEmail(userEmail);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> cancelRegistration(@PathVariable("id") Long id) {
        Registration registration = registrationRepository.findById(id).orElse(null);
        if (registration == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Registration not found.");
        Event event = eventRepository.findById(registration.getEventId()).orElse(null);
        if (event != null) { event.setAvailableSeats(event.getAvailableSeats() + 1); eventRepository.save(event); }
        registrationRepository.delete(registration);
        return ResponseEntity.ok("Registration cancelled successfully.");
    }
}
