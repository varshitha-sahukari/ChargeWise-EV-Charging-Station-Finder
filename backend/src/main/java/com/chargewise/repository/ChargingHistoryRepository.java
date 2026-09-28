package com.chargewise.repository;

import com.chargewise.entity.ChargingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChargingHistoryRepository extends JpaRepository<ChargingHistory, Long> {
    List<ChargingHistory> findByUserIdOrderBySessionDateDesc(Long userId);

    @Query("SELECT SUM(c.energyConsumedKwh) FROM ChargingHistory c")
    Double sumTotalEnergyConsumed();

    @Query("SELECT SUM(c.totalCost) FROM ChargingHistory c")
    Double sumTotalRevenue();

    @Query("SELECT COUNT(DISTINCT c.user.id) FROM ChargingHistory c")
    Long countDistinctActiveUsers();
}
