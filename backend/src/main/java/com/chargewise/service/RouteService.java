package com.chargewise.service;

import com.chargewise.dto.RouteRequest;
import com.chargewise.dto.RouteResponse;
import com.chargewise.dto.StationDto;
import com.chargewise.entity.Station;
import com.chargewise.entity.Vehicle;
import com.chargewise.exception.ResourceNotFoundException;
import com.chargewise.repository.StationRepository;
import com.chargewise.repository.VehicleRepository;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RouteService {

    private final StationRepository stationRepository;
    private final VehicleRepository vehicleRepository;
    private final AIService aiService;
    private final ModelMapper modelMapper;

    public RouteService(StationRepository stationRepository, VehicleRepository vehicleRepository, AIService aiService, ModelMapper modelMapper) {
        this.stationRepository = stationRepository;
        this.vehicleRepository = vehicleRepository;
        this.aiService = aiService;
        this.modelMapper = modelMapper;
    }

    public RouteResponse calculateRoute(RouteRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + request.getVehicleId()));

        double startLat = request.getStartLat();
        double startLng = request.getStartLng();
        double endLat = request.getEndLat();
        double endLng = request.getEndLng();

        // Calculate straight line distance and add road factor (typically 1.2 to 1.3 in India)
        double haversineDistance = aiService.calculateDistance(startLat, startLng, endLat, endLng);
        double distanceKm = haversineDistance * 1.25; // 25% curve overhead
        double travelTimeMinutes = (distanceKm / 55.0) * 60.0; // Average 55 km/h speed

        double maxRange = vehicle.getMaxRange();
        double batteryCapacity = vehicle.getBatteryCapacity();
        double initialSoc = request.getInitialSoc();
        double targetSoc = request.getTargetSoc(); // SOC percentage when they want to charge

        // Battery Consumed = (Distance / Max Range) * 100
        double batteryConsumedPercent = (distanceKm / maxRange) * 100.0;
        double arrivalSoc = initialSoc - batteryConsumedPercent;

        List<StationDto> recommendedStops = new ArrayList<>();
        double totalChargingCost = 0.0;
        int chargingTimeMinutes = 0;

        // Generate simulated path points between start and end
        List<double[]> routePoints = generateRoutePoints(startLat, startLng, endLat, endLng, 15);

        // Find stations along the route (using bounding box + 0.3 degrees buffer)
        double minLat = Math.min(startLat, endLat) - 0.3;
        double maxLat = Math.max(startLat, endLat) + 0.3;
        double minLng = Math.min(startLng, endLng) - 0.3;
        double maxLng = Math.max(startLng, endLng) + 0.3;

        List<Station> stationsInRegion = stationRepository.findInBoundingBox(minLat, maxLat, minLng, maxLng);

        // Filter compatible stations
        List<Station> compatibleStations = stationsInRegion.stream()
                .filter(s -> s.getConnectors().stream()
                        .anyMatch(c -> c.getConnectorType().getName().equalsIgnoreCase(vehicle.getConnectorType())))
                .collect(Collectors.toList());

        // If range is insufficient, recommend charging stops
        if (arrivalSoc < targetSoc) {
            double currentSoc = initialSoc;
            double currentLat = startLat;
            double currentLng = startLng;
            
            // Loop segment by segment to find charging stops
            double rangeRemainingKm = (currentSoc / 100.0) * maxRange;

            while (rangeRemainingKm < distanceKm && currentSoc > targetSoc) {
                // Find compatible stations ahead that are reachable before battery drops below targetSoc (e.g. 20%)
                double safeRangeKm = ((currentSoc - targetSoc) / 100.0) * maxRange;
                
                // Identify stations within safeRange along the route direction
                List<Station> candidates = findCandidatesAhead(currentLat, currentLng, endLat, endLng, compatibleStations, safeRangeKm);

                if (candidates.isEmpty()) {
                    // Try to relax targetSoc if no stations found (e.g., drop to 10% battery threshold)
                    safeRangeKm = ((currentSoc - 10.0) / 100.0) * maxRange;
                    candidates = findCandidatesAhead(currentLat, currentLng, endLat, endLng, compatibleStations, safeRangeKm);
                }

                if (candidates.isEmpty()) {
                    log.warn("No charging stations found along the route!");
                    break;
                }

                // Choose the best station using AI rating score or closest to maximum safe range
                Station bestStop = selectBestChargingStop(candidates, currentLat, currentLng);
                double stopDistance = aiService.calculateDistance(currentLat, currentLng, bestStop.getLatitude(), bestStop.getLongitude());

                recommendedStops.add(modelMapper.map(bestStop, StationDto.class));

                // Deduct battery to the stop
                double socBeforeCharge = currentSoc - ((stopDistance / maxRange) * 100.0);
                double chargeNeededPercent = 90.0 - socBeforeCharge; // Charge up to 90%
                
                // Calculate charging cost and time
                double energyNeededKwh = (chargeNeededPercent / 100.0) * batteryCapacity;
                double cost = energyNeededKwh * bestStop.getBasePricing();
                totalChargingCost += cost;

                // Estimate charge time: assume 50 kW charger speed average (adjust for charging curves)
                double avgPowerKw = bestStop.getConnectors().stream()
                        .mapToDouble(c -> c.getPowerOutputKw())
                        .max()
                        .orElse(22.0);
                double timeHours = energyNeededKwh / avgPowerKw;
                chargingTimeMinutes += (int) (timeHours * 60.0) + 10; // add 10 min plug-in overhead

                // Update current state at the charging stop
                currentSoc = 90.0;
                currentLat = bestStop.getLatitude();
                currentLng = bestStop.getLongitude();
                distanceKm -= stopDistance;
                rangeRemainingKm = (currentSoc / 100.0) * maxRange;

                if (distanceKm <= 0) {
                    break;
                }
            }

            // Calculate final arrival SOC
            arrivalSoc = currentSoc - ((distanceKm / maxRange) * 100.0);
        }

        return RouteResponse.builder()
                .distanceKm(Math.round(haversineDistance * 1.25 * 10.0) / 10.0)
                .travelTimeMinutes(Math.round(travelTimeMinutes))
                .batteryConsumedPercent(Math.round(batteryConsumedPercent * 10.0) / 10.0)
                .arrivalSoc(Math.max(0.0, Math.round(arrivalSoc * 10.0) / 10.0))
                .recommendedStops(recommendedStops)
                .totalChargingCost(Math.round(totalChargingCost))
                .chargingTimeMinutes(chargingTimeMinutes)
                .routePoints(routePoints)
                .build();
    }

    private List<Station> findCandidatesAhead(double currentLat, double currentLng, double endLat, double endLng, 
                                             List<Station> stations, double maxReachableKm) {
        return stations.stream()
                .filter(s -> {
                    double distToStation = aiService.calculateDistance(currentLat, currentLng, s.getLatitude(), s.getLongitude());
                    double distToDestination = aiService.calculateDistance(s.getLatitude(), s.getLongitude(), endLat, endLng);
                    double initialDistToDestination = aiService.calculateDistance(currentLat, currentLng, endLat, endLng);
                    
                    // Must be closer to destination than where we currently are (moving forward)
                    boolean movingForward = distToDestination < initialDistToDestination;
                    
                    return distToStation <= maxReachableKm && movingForward;
                })
                .collect(Collectors.toList());
    }

    private Station selectBestChargingStop(List<Station> candidates, double currentLat, double currentLng) {
        // Select best stop based on combined distance and availability
        // Prioritize AVAILABLE stations, then sort by closer to reachable limit to minimize stops
        return candidates.stream()
                .max(Comparator.comparingDouble(s -> {
                    double dist = aiService.calculateDistance(currentLat, currentLng, s.getLatitude(), s.getLongitude());
                    double ratingScore = s.getAverageRating() * 2.0;
                    double statusWeight = "AVAILABLE".equalsIgnoreCase(s.getStatus()) ? 20.0 : ("BUSY".equalsIgnoreCase(s.getStatus()) ? 5.0 : 0.0);
                    return dist + ratingScore + statusWeight; // heuristic combo
                }))
                .orElse(candidates.get(0));
    }

    private List<double[]> generateRoutePoints(double startLat, double startLng, double endLat, double endLng, int pointsCount) {
        List<double[]> points = new ArrayList<>();
        points.add(new double[]{startLat, startLng});

        // Simple interpolation between start and end, with slight wave noise to simulate roads
        for (int i = 1; i < pointsCount - 1; i++) {
            double fraction = (double) i / (pointsCount - 1);
            double lat = startLat + (endLat - startLat) * fraction;
            double lng = startLng + (endLng - startLng) * fraction;
            
            // Add a small sinus wave for curvature realism
            double offset = 0.015 * Math.sin(fraction * Math.PI * 3);
            points.add(new double[]{lat + offset, lng - offset});
        }
        
        points.add(new double[]{endLat, endLng});
        return points;
    }
}
