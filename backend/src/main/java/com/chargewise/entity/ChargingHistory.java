package com.chargewise.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "charging_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChargingHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @Column(nullable = false)
    private double energyConsumedKwh; // in kWh

    @Column(nullable = false)
    private double totalCost; // in INR

    @Column(nullable = false)
    private int chargingDurationMinutes;

    @Column(nullable = false)
    private LocalDateTime sessionDate;

    @PrePersist
    protected void onCreate() {
        if (sessionDate == null) {
            sessionDate = LocalDateTime.now();
        }
    }
}
