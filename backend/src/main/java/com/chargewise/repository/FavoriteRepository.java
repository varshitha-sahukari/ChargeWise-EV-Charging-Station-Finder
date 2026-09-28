package com.chargewise.repository;

import com.chargewise.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserId(Long userId);
    Optional<Favorite> findByUserIdAndStationId(Long userId, Long stationId);
    boolean existsByUserIdAndStationId(Long userId, Long stationId);
    void deleteByUserIdAndStationId(Long userId, Long stationId);
}
