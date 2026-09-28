package com.chargewise.repository;

import com.chargewise.entity.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StationRepository extends JpaRepository<Station, Long>, JpaSpecificationExecutor<Station> {
    
    @Query("SELECT s FROM Station s WHERE " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(s.latitude)) * " +
           "cos(radians(s.longitude) - radians(:lng)) + " +
           "sin(radians(:lat)) * sin(radians(s.latitude)))) <= :radiusKm")
    List<Station> findNearby(@Param("lat") double lat, @Param("lng") double lng, @Param("radiusKm") double radiusKm);

    @Query("SELECT s FROM Station s WHERE s.latitude BETWEEN :minLat AND :maxLat AND s.longitude BETWEEN :minLng AND :maxLng")
    List<Station> findInBoundingBox(@Param("minLat") double minLat, @Param("maxLat") double maxLat, 
                                   @Param("minLng") double minLng, @Param("maxLng") double maxLng);

    @Query("SELECT s.state, COUNT(s) FROM Station s GROUP BY s.state")
    List<Object[]> countStationsByState();

    @Query("SELECT s.network, COUNT(s) FROM Station s GROUP BY s.network")
    List<Object[]> countStationsByNetwork();
}
