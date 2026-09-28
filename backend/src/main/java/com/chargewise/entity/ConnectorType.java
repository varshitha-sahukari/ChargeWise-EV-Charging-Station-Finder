package com.chargewise.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "connector_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConnectorType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name; // CCS2, Type 2, CHAdeMO, AC001, DC001

    private String description;

    private double maxPowerKw; // e.g. 50.0, 22.0, 7.4
}
