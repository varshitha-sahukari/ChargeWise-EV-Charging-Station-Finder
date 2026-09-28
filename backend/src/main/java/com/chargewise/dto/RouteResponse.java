package com.chargewise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteResponse {
    private double distanceKm;
    private double travelTimeMinutes;
    private double batteryConsumedPercent;
    private double arrivalSoc;
    private List<StationDto> recommendedStops;
    private double totalChargingCost;
    private int chargingTimeMinutes;
    private List<double[]> routePoints; // List of coordinates [latitude, longitude]
}
