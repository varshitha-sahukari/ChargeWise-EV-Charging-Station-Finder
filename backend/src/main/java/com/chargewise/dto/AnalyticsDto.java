package com.chargewise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsDto {
    private long totalStations;
    private long activeStations;
    private Map<String, Long> stateWiseCounts;
    private Map<String, Long> topNetworks;
    private long userCount;
    private long activeUsers;
    private double totalEnergyKwh;
    private double totalRevenue;
    private long reportsCount;
    private long sosCount;
    private double averageRating;
    private long fastChargersCount;
    private long slowChargersCount;
    private Map<String, Double> chargingTrends; // e.g. Day -> Energy consumed
}
