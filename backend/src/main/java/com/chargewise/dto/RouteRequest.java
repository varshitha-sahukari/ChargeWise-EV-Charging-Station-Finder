package com.chargewise.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RouteRequest {
    @NotNull(message = "Start latitude is required")
    private Double startLat;

    @NotNull(message = "Start longitude is required")
    private Double startLng;

    @NotNull(message = "End latitude is required")
    private Double endLat;

    @NotNull(message = "End longitude is required")
    private Double endLng;

    @NotNull(message = "Vehicle selection is required")
    private Long vehicleId;

    private double initialSoc = 100.0; // In % (e.g. 80.0)
    private double targetSoc = 20.0;  // Threshold SOC to charge at
}
