package com.chargewise.controller;

import com.chargewise.dto.*;
import com.chargewise.entity.User;
import com.chargewise.exception.ResourceNotFoundException;
import com.chargewise.repository.UserRepository;
import com.chargewise.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Controller", description = "Endpoints for user profile, vehicles, favorites, history, and notifications")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile details")
    public ResponseEntity<UserDto> getProfile() {
        return ResponseEntity.ok(userService.getUserProfile(getCurrentUser().getId()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile")
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody UserDto dto) {
        return ResponseEntity.ok(userService.updateProfile(getCurrentUser().getId(), dto));
    }

    // Vehicle Endpoints
    @GetMapping("/vehicles")
    @Operation(summary = "Get user registered vehicles")
    public ResponseEntity<List<VehicleDto>> getVehicles() {
        return ResponseEntity.ok(userService.getUserVehicles(getCurrentUser().getId()));
    }

    @PostMapping("/vehicles")
    @Operation(summary = "Register a new EV vehicle")
    public ResponseEntity<VehicleDto> addVehicle(@Valid @RequestBody VehicleDto dto) {
        return ResponseEntity.ok(userService.addVehicle(getCurrentUser().getId(), dto));
    }

    @DeleteMapping("/vehicles/{id}")
    @Operation(summary = "Remove registered vehicle")
    public ResponseEntity<Map<String, String>> deleteVehicle(@PathVariable Long id) {
        userService.deleteVehicle(id, getCurrentUser().getId());
        return ResponseEntity.ok(Map.of("message", "Vehicle removed successfully"));
    }

    // Favorite Endpoints
    @GetMapping("/favorites")
    @Operation(summary = "Get favorite stations")
    public ResponseEntity<List<StationDto>> getFavorites() {
        return ResponseEntity.ok(userService.getFavorites(getCurrentUser().getId()));
    }

    @PostMapping("/favorites/{stationId}")
    @Operation(summary = "Bookmark a station")
    public ResponseEntity<Map<String, String>> addFavorite(@PathVariable Long stationId) {
        userService.addFavorite(getCurrentUser().getId(), stationId);
        return ResponseEntity.ok(Map.of("message", "Station added to favorites"));
    }

    @DeleteMapping("/favorites/{stationId}")
    @Operation(summary = "Remove a station from favorites")
    public ResponseEntity<Map<String, String>> removeFavorite(@PathVariable Long stationId) {
        userService.removeFavorite(getCurrentUser().getId(), stationId);
        return ResponseEntity.ok(Map.of("message", "Station removed from favorites"));
    }

    // Charging History Endpoints
    @GetMapping("/history")
    @Operation(summary = "Get user charging history logs")
    public ResponseEntity<List<ChargingHistoryDto>> getHistory() {
        return ResponseEntity.ok(userService.getHistory(getCurrentUser().getId()));
    }

    @PostMapping("/history")
    @Operation(summary = "Log a completed charging session")
    public ResponseEntity<ChargingHistoryDto> addHistory(@Valid @RequestBody ChargingHistoryDto dto) {
        return ResponseEntity.ok(userService.addHistory(getCurrentUser().getId(), dto));
    }

    // Report Endpoints
    @PostMapping("/reports")
    @Operation(summary = "Report issue at a charging station")
    public ResponseEntity<ReportDto> submitReport(@Valid @RequestBody ReportRequest request) {
        return ResponseEntity.ok(userService.submitReport(getCurrentUser().getId(), request));
    }

    // Notification Endpoints
    @GetMapping("/notifications")
    @Operation(summary = "Get and read user alerts")
    public ResponseEntity<List<NotificationDto>> getNotifications() {
        return ResponseEntity.ok(userService.getNotifications(getCurrentUser().getId()));
    }

    @GetMapping("/notifications/unread-count")
    @Operation(summary = "Get count of unread user alerts")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        return ResponseEntity.ok(Map.of("unreadCount", userService.getUnreadNotificationsCount(getCurrentUser().getId())));
    }
}
