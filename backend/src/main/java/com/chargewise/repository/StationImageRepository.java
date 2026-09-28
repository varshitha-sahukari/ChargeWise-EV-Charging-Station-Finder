package com.chargewise.repository;

import com.chargewise.entity.StationImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StationImageRepository extends JpaRepository<StationImage, Long> {
}
