package com.chargewise.service;

import com.chargewise.dto.*;
import com.chargewise.entity.*;
import com.chargewise.exception.BadRequestException;
import com.chargewise.exception.ResourceNotFoundException;
import com.chargewise.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final FavoriteRepository favoriteRepository;
    private final StationRepository stationRepository;
    private final ChargingHistoryRepository chargingHistoryRepository;
    private final ReportRepository reportRepository;
    private final NotificationRepository notificationRepository;
    private final ModelMapper modelMapper;

    public UserService(UserRepository userRepository, VehicleRepository vehicleRepository, 
                       FavoriteRepository favoriteRepository, StationRepository stationRepository,
                       ChargingHistoryRepository chargingHistoryRepository, ReportRepository reportRepository,
                       NotificationRepository notificationRepository, ModelMapper modelMapper) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.favoriteRepository = favoriteRepository;
        this.stationRepository = stationRepository;
        this.chargingHistoryRepository = chargingHistoryRepository;
        this.reportRepository = reportRepository;
        this.notificationRepository = notificationRepository;
        this.modelMapper = modelMapper;
    }

    public UserDto getUserProfile(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return modelMapper.map(user, UserDto.class);
    }

    @Transactional
    public UserDto updateProfile(Long id, UserDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        user.setUsername(dto.getUsername());
        if (dto.getProfilePicture() != null) {
            user.setProfilePicture(dto.getProfilePicture());
        }
        User saved = userRepository.save(user);
        return modelMapper.map(saved, UserDto.class);
    }

    // Vehicle Management
    public List<VehicleDto> getUserVehicles(Long userId) {
        return vehicleRepository.findByUserId(userId).stream()
                .map(v -> modelMapper.map(v, VehicleDto.class))
                .collect(Collectors.toList());
    }

    @Transactional
    public VehicleDto addVehicle(Long userId, VehicleDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Vehicle vehicle = modelMapper.map(dto, Vehicle.class);
        vehicle.setUser(user);
        
        Vehicle saved = vehicleRepository.save(vehicle);
        log.info("Vehicle registered: {} {}", saved.getBrand(), saved.getModel());
        return modelMapper.map(saved, VehicleDto.class);
    }

    @Transactional
    public void deleteVehicle(Long vehicleId, Long userId) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found for this user"));
        vehicleRepository.delete(vehicle);
        log.info("Vehicle deleted: {}", vehicleId);
    }

    // Favorite Bookmarks
    public List<StationDto> getFavorites(Long userId) {
        return favoriteRepository.findByUserId(userId).stream()
                .map(fav -> modelMapper.map(fav.getStation(), StationDto.class))
                .collect(Collectors.toList());
    }

    @Transactional
    public void addFavorite(Long userId, Long stationId) {
        if (favoriteRepository.existsByUserIdAndStationId(userId, stationId)) {
            throw new BadRequestException("Station is already in favorites");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found"));

        Favorite favorite = Favorite.builder()
                .user(user)
                .station(station)
                .build();
        
        favoriteRepository.save(favorite);
        log.info("Added station {} to user {} favorites", stationId, userId);
    }

    @Transactional
    public void removeFavorite(Long userId, Long stationId) {
        Favorite favorite = favoriteRepository.findByUserIdAndStationId(userId, stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Bookmark not found"));
        favoriteRepository.delete(favorite);
        log.info("Removed station {} from user {} favorites", stationId, userId);
    }

    // Charging History
    public List<ChargingHistoryDto> getHistory(Long userId) {
        return chargingHistoryRepository.findByUserIdOrderBySessionDateDesc(userId).stream()
                .map(h -> {
                    ChargingHistoryDto dto = modelMapper.map(h, ChargingHistoryDto.class);
                    dto.setStationName(h.getStation().getName());
                    if (h.getVehicle() != null) {
                        dto.setVehicleModel(h.getVehicle().getBrand() + " " + h.getVehicle().getModel());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ChargingHistoryDto addHistory(Long userId, ChargingHistoryDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Station station = stationRepository.findById(dto.getStationId())
                .orElseThrow(() -> new ResourceNotFoundException("Station not found"));
        Vehicle vehicle = dto.getVehicleId() != null ? 
                vehicleRepository.findByIdAndUserId(dto.getVehicleId(), userId).orElse(null) : null;

        double co2SavedPerKwh = 0.45; // kg carbon emission saved per kWh compared to petrol
        double carbonOffset = dto.getEnergyConsumedKwh() * co2SavedPerKwh;
        station.setCarbonSavedKg(station.getCarbonSavedKg() + carbonOffset);
        stationRepository.save(station);

        ChargingHistory history = ChargingHistory.builder()
                .user(user)
                .station(station)
                .vehicle(vehicle)
                .energyConsumedKwh(dto.getEnergyConsumedKwh())
                .totalCost(dto.getTotalCost())
                .chargingDurationMinutes(dto.getChargingDurationMinutes())
                .build();

        ChargingHistory saved = chargingHistoryRepository.save(history);
        
        // Also send notification
        createNotification(user, "Session Completed", 
                String.format("Successfully charged %.1f kWh at %s. Cost: INR %.2f.", 
                        dto.getEnergyConsumedKwh(), station.getName(), dto.getTotalCost()));

        log.info("Charging session saved: userId={}, stationId={}", userId, station.getId());
        
        ChargingHistoryDto response = modelMapper.map(saved, ChargingHistoryDto.class);
        response.setStationName(station.getName());
        if (vehicle != null) {
            response.setVehicleModel(vehicle.getBrand() + " " + vehicle.getModel());
        }
        return response;
    }

    // Reports
    @Transactional
    public ReportDto submitReport(Long userId, ReportRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Station station = stationRepository.findById(request.getStationId())
                .orElseThrow(() -> new ResourceNotFoundException("Station not found"));

        Report report = Report.builder()
                .user(user)
                .station(station)
                .issueDescription(request.getIssueDescription())
                .status("PENDING")
                .build();

        Report saved = reportRepository.save(report);
        log.info("Issue report filed for station: {}", station.getName());

        ReportDto dto = modelMapper.map(saved, ReportDto.class);
        dto.setStationName(station.getName());
        dto.setUsername(user.getUsername());
        return dto;
    }

    // Notifications
    public List<NotificationDto> getNotifications(Long userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        // Mark all as read when loaded
        if (!list.isEmpty()) {
            list.forEach(n -> n.setRead(true));
            notificationRepository.saveAll(list);
        }

        return list.stream()
                .map(n -> modelMapper.map(n, NotificationDto.class))
                .collect(Collectors.toList());
    }

    public long getUnreadNotificationsCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void createNotification(User user, String title, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }
}
