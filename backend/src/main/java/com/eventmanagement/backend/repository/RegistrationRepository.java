package com.eventmanagement.backend.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.eventmanagement.backend.entity.Registration;
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByUserEmail(String userEmail);
    boolean existsByUserEmailAndEventId(String userEmail, Long eventId);
}
