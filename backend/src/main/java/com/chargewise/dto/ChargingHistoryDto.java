package com.chargewise.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChargingHistoryDto {
    private Long id;
    private Long userId;
    private Long stationId;
    private String stationName;
    private Long vehicleId;
    private String vehicleModel;
    private double energyConsumedKwh;
    private double totalCost;
    private int chargingDurationMinutes;
    private LocalDateTime sessionDate;
}
