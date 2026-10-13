package com.eventmanagement.backend.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.eventmanagement.backend.entity.Event;
import com.eventmanagement.backend.repository.EventRepository;

@RestController
@RequestMapping("/api/events")
public class EventController {
    private final EventRepository eventRepository;
    public EventController(EventRepository eventRepository) { this.eventRepository = eventRepository; }

    @GetMapping public List<Event> getEvents() { return eventRepository.findAll(); }

    @PostMapping public ResponseEntity<?> createEvent(@RequestBody Event event) {
        if (event.getTitle() == null || event.getTitle().isBlank()) return ResponseEntity.badRequest().body("Event title is required.");
        if (event.getAvailableSeats() < 0) return ResponseEntity.badRequest().body("Available seats cannot be negative.");
        event.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(eventRepository.save(event));
    }

    @PutMapping("/{id}") public ResponseEntity<?> updateEvent(@PathVariable Long id, @RequestBody Event updated) {
        Event event = eventRepository.findById(id).orElse(null);
        if (event == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Event not found.");
        event.setTitle(updated.getTitle()); event.setDescription(updated.getDescription());
        event.setDate(updated.getDate()); event.setLocation(updated.getLocation());
        event.setAvailableSeats(updated.getAvailableSeats());
        return ResponseEntity.ok(eventRepository.save(event));
    }

    @DeleteMapping("/{id}") public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        Event event = eventRepository.findById(id).orElse(null);
        if (event == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Event not found.");
        eventRepository.delete(event);
        return ResponseEntity.ok("Event deleted successfully.");
    }
}
