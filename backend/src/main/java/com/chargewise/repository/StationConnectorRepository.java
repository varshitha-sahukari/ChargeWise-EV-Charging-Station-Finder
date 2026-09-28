package com.chargewise.repository;

import com.chargewise.entity.StationConnector;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StationConnectorRepository extends JpaRepository<StationConnector, Long> {
    List<StationConnector> findByStationId(Long stationId);
}
