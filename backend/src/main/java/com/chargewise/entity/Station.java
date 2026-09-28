package com.chargewise.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Station {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    @Column(nullable = false)
    private String network; // Tata Power, Statiq, ChargeZone, Jio-bp, Ather, Zeon, Shell, etc.

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String pinCode;

    private String operatingHours; // e.g. "24 Hours" or "09:00 AM - 10:00 PM"

    private String contactDetails;

    private double basePricing; // price in INR per kWh

    private String status; // AVAILABLE, BUSY, OFFLINE

    private double averageRating = 0.0;

    private int reviewsCount = 0;

    private double carbonSavedKg = 0.0; // Carbon emissions offset in kg

    @OneToMany(mappedBy = "station", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StationImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "station", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StationConnector> connectors = new ArrayList<>();

    public void addConnector(StationConnector connector) {
        connectors.add(connector);
        connector.setStation(this);
    }

    public void addImage(StationImage image) {
        images.add(image);
        image.setStation(this);
    }
}
