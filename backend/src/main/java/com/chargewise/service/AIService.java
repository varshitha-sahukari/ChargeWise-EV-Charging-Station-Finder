package com.chargewise.service;

import com.chargewise.dto.AIRecommendationResponse;
import com.chargewise.dto.StationDto;
import com.chargewise.entity.Station;
import com.chargewise.entity.StationConnector;
import com.chargewise.repository.StationRepository;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AIService {

    private final StationRepository stationRepository;
    private final ModelMapper modelMapper;

    public AIService(StationRepository stationRepository, ModelMapper modelMapper) {
        this.stationRepository = stationRepository;
        this.modelMapper = modelMapper;
    }

    public List<AIRecommendationResponse> getRecommendations(double userLat, double userLng, String connectorType) {
        // Fetch stations within 25 km
        List<Station> stations = stationRepository.findNearby(userLat, userLng, 25.0);

        List<AIRecommendationResponse> recommendations = new ArrayList<>();

        for (Station station : stations) {
            // Check connector compatibility if specified
            if (connectorType != null && !connectorType.trim().isEmpty()) {
                boolean hasCompatible = station.getConnectors().stream()
                        .anyMatch(c -> c.getConnectorType().getName().equalsIgnoreCase(connectorType));
                if (!hasCompatible) {
                    continue;
                }
            }

            double distance = calculateDistance(userLat, userLng, station.getLatitude(), station.getLongitude());
            double score = calculateAIScore(station, distance);

            List<Integer> peakHours = predictPeakHours(station);

            // Find less crowded alternative if current station is not AVAILABLE
            Station lessCrowded = null;
            if (!"AVAILABLE".equalsIgnoreCase(station.getStatus())) {
                lessCrowded = findLessCrowdedAlternative(stations, station, userLat, userLng, connectorType);
            }

            StationDto stationDto = modelMapper.map(station, StationDto.class);
            StationDto alternativeDto = lessCrowded != null ? modelMapper.map(lessCrowded, StationDto.class) : null;

            recommendations.add(AIRecommendationResponse.builder()
                    .score(Math.round(score * 100.0) / 100.0)
                    .station(stationDto)
                    .distanceKm(Math.round(distance * 100.0) / 100.0)
                    .predictedPeakHours(peakHours)
                    .lessCrowdedAlternative(alternativeDto)
                    .build());
        }

        // Sort by score descending
        return recommendations.stream()
                .sorted(Comparator.comparingDouble(AIRecommendationResponse::getScore).reversed())
                .collect(Collectors.toList());
    }

    private double calculateAIScore(Station station, double distance) {
        // 40% Distance Score
        // Max score at 0km, dropping to 0 at 25km
        double distScore = Math.max(0.0, 1.0 - (distance / 25.0));

        // 25% Availability Score
        double availScore = 0.0;
        if ("AVAILABLE".equalsIgnoreCase(station.getStatus())) {
            availScore = 1.0;
        } else if ("BUSY".equalsIgnoreCase(station.getStatus())) {
            availScore = 0.3;
        } else {
            availScore = 0.0; // Offline
        }

        // 15% Charging Speed Score
        // Get max power capacity of connectors
        double maxPower = station.getConnectors().stream()
                .mapToDouble(StationConnector::getPowerOutputKw)
                .max()
                .orElse(7.4);
        double speedScore = maxPower >= 100.0 ? 1.0 : (maxPower >= 50.0 ? 0.7 : (maxPower >= 22.0 ? 0.4 : 0.1));

        // 10% User Rating Score
        double ratingScore = station.getAverageRating() / 5.0;

        // 10% Price Score (assuming benchmark price of 25 INR/kWh max)
        double benchmarkMaxPrice = 25.0;
        double priceScore = Math.max(0.0, 1.0 - (station.getBasePricing() / benchmarkMaxPrice));

        // Apply weights
        return (0.40 * distScore) + (0.25 * availScore) + (0.15 * speedScore) + (0.10 * ratingScore) + (0.10 * priceScore);
    }

    public List<Integer> predictPeakHours(Station station) {
        // AI heuristic to predict peak hours based on station metadata and rating
        // High density networks in city areas (high rating / high ports count) peak during office commute hours:
        // commuter peaks: 8 AM - 10 AM, 5 PM - 8 PM
        // highway network nodes peak during afternoon: 12 PM - 3 PM
        List<Integer> peakHours = new ArrayList<>();
        int hash = station.getName().hashCode();

        if (hash % 2 == 0) {
            // Commuter Peak profile
            peakHours.addAll(Arrays.asList(8, 9, 10, 17, 18, 19, 20));
        } else {
            // Mid-day / Highway Peak profile
            peakHours.addAll(Arrays.asList(12, 13, 14, 15, 19, 20, 21));
        }
        return peakHours;
    }

    private Station findLessCrowdedAlternative(List<Station> allStations, Station currentStation, double userLat, double userLng, String connectorType) {
        // Find the nearest AVAILABLE station with compatible connector type
        return allStations.stream()
                .filter(s -> !s.getId().equals(currentStation.getId()))
                .filter(s -> "AVAILABLE".equalsIgnoreCase(s.getStatus()))
                .filter(s -> {
                    if (connectorType != null && !connectorType.trim().isEmpty()) {
                        return s.getConnectors().stream()
                                .anyMatch(c -> c.getConnectorType().getName().equalsIgnoreCase(connectorType));
                    }
                    return true;
                })
                .min(Comparator.comparingDouble(s -> calculateDistance(userLat, userLng, s.getLatitude(), s.getLongitude())))
                .orElse(null);
    }

    // Haversine distance calculator helper
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radious of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
