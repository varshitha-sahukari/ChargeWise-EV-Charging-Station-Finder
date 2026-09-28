package com.chargewise.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicle")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String brand; // e.g., Tata, Nexon, Hyundai, MG, Ather, Ola

    @Column(nullable = false)
    private String model; // e.g., Nexon EV, Punch EV, Kona, ZS EV, 450X, S1 Pro

    @Column(nullable = false)
    private double batteryCapacity; // in kWh

    @Column(nullable = false)
    private double maxRange; // in km

    @Column(nullable = false)
    private String connectorType; // e.g., CCS2, Type 2, AC001, DC001

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
