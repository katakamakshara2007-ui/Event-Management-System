package com.eventmanagement.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.eventmanagement.backend.entity.Event;
public interface EventRepository extends JpaRepository<Event, Long> {}
