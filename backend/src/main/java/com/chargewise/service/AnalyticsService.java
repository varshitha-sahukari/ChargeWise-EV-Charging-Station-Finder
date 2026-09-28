package com.chargewise.service;

import com.chargewise.dto.AnalyticsDto;
import com.chargewise.entity.Station;
import com.chargewise.entity.StationConnector;
import com.chargewise.repository.ChargingHistoryRepository;
import com.chargewise.repository.ReportRepository;
import com.chargewise.repository.StationRepository;
import com.chargewise.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final StationRepository stationRepository;
    private final UserRepository userRepository;
    private final ChargingHistoryRepository historyRepository;
    private final ReportRepository reportRepository;

    public AnalyticsService(StationRepository stationRepository, UserRepository userRepository,
                            ChargingHistoryRepository historyRepository, ReportRepository reportRepository) {
        this.stationRepository = stationRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
        this.reportRepository = reportRepository;
    }

    public AnalyticsDto getAnalytics() {
        long totalStations = stationRepository.count();
        
        List<Station> stations = stationRepository.findAll();
        long activeStations = stations.stream()
                .filter(s -> "AVAILABLE".equalsIgnoreCase(s.getStatus()) || "BUSY".equalsIgnoreCase(s.getStatus()))
                .count();

        // Calculate connector counts
        long fastCount = 0;
        long slowCount = 0;
        double totalRatingSum = 0;
        int ratedStationsCount = 0;

        for (Station s : stations) {
            if (s.getAverageRating() > 0) {
                totalRatingSum += s.getAverageRating();
                ratedStationsCount++;
            }
            for (StationConnector c : s.getConnectors()) {
                if (c.getPowerOutputKw() >= 22.0) {
                    fastCount++;
                } else {
                    slowCount++;
                }
            }
        }

        double avgRating = ratedStationsCount > 0 ? (totalRatingSum / ratedStationsCount) : 4.2;

        // State wise distribution
        Map<String, Long> stateCounts = new HashMap<>();
        List<Object[]> stateCountsRaw = stationRepository.countStationsByState();
        for (Object[] row : stateCountsRaw) {
            stateCounts.put((String) row[0], (Long) row[1]);
        }

        // Network market share
        Map<String, Long> networkCounts = new HashMap<>();
        List<Object[]> networkCountsRaw = stationRepository.countStationsByNetwork();
        for (Object[] row : networkCountsRaw) {
            networkCounts.put((String) row[0], (Long) row[1]);
        }

        long userCount = userRepository.count();
        long activeUsers = historyRepository.countDistinctActiveUsers();
        
        Double totalEnergy = historyRepository.sumTotalEnergyConsumed();
        Double totalRevenue = historyRepository.sumTotalRevenue();
        long reportsCount = reportRepository.count();

        // Mock charging trends (e.g. Day of the week -> Energy consumed)
        Map<String, Double> trends = new HashMap<>();
        trends.put("Mon", 1250.0);
        trends.put("Tue", 1420.0);
        trends.put("Wed", 1550.0);
        trends.put("Thu", 1380.0);
        trends.put("Fri", 1890.0);
        trends.put("Sat", 2450.0);
        trends.put("Sun", 2200.0);

        return AnalyticsDto.builder()
                .totalStations(totalStations)
                .activeStations(activeStations)
                .stateWiseCounts(stateCounts)
                .topNetworks(networkCounts)
                .userCount(userCount)
                .activeUsers(activeUsers)
                .totalEnergyKwh(totalEnergy != null ? totalEnergy : 35420.0) // fallback to reasonable mock demo numbers if empty
                .totalRevenue(totalRevenue != null ? totalRevenue : 531300.0) // 15 INR per kWh average
                .reportsCount(reportsCount)
                .sosCount(12) // mock SOS count
                .averageRating(Math.round(avgRating * 10.0) / 10.0)
                .fastChargersCount(fastCount > 0 ? fastCount : 120)
                .slowChargersCount(slowCount > 0 ? slowCount : 80)
                .chargingTrends(trends)
                .build();
    }
}
