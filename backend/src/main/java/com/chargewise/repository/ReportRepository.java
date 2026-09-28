package com.chargewise.repository;

import com.chargewise.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findAllByOrderByReportedAtDesc();
    List<Report> findByStationIdOrderByReportedAtDesc(Long stationId);
    List<Report> findByUserIdOrderByReportedAtDesc(Long userId);
    long countByStatus(String status);
}
