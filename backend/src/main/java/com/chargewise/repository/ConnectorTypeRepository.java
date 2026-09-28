package com.chargewise.repository;

import com.chargewise.entity.ConnectorType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ConnectorTypeRepository extends JpaRepository<ConnectorType, Long> {
    Optional<ConnectorType> findByName(String name);
}
