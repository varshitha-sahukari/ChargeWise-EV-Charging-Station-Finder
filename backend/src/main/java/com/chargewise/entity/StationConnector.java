package com.chargewise.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "station_connectors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StationConnector {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    @JsonIgnore
    private Station station;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "connector_type_id", nullable = false)
    private ConnectorType connectorType;

    @Column(nullable = false)
    private String status; // AVAILABLE, BUSY, OFFLINE

    private double powerOutputKw; // e.g. 50.0, 150.0, 7.4

    private double pricing; // Custom price in INR/kWh for this connector (defaults to station base pricing)
}
