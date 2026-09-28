package com.chargewise.repository;

import com.chargewise.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByStartTimeDesc(Long userId);
    List<Booking> findByStationIdOrderByStartTimeDesc(Long stationId);
    long countByStatus(String status);
}
