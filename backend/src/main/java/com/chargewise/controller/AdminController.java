package com.chargewise.controller;

import com.chargewise.dto.ReportDto;
import com.chargewise.dto.StationDto;
import com.chargewise.dto.UserDto;
import com.chargewise.entity.Report;
import com.chargewise.entity.User;
import com.chargewise.exception.ResourceNotFoundException;
import com.chargewise.repository.ReportRepository;
import com.chargewise.repository.UserRepository;
import com.chargewise.service.StationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Controller", description = "Endpoints for administrator actions and database management")
public class AdminController {

    private final StationService stationService;
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    public AdminController(StationService stationService, ReportRepository reportRepository,
                           UserRepository userRepository, ModelMapper modelMapper) {
        this.stationService = stationService;
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
    }

    // Manage Stations
    @PostMapping("/stations")
    @Operation(summary = "Create a new EV station (Admin)")
    public ResponseEntity<StationDto> createStation(@Valid @RequestBody StationDto stationDto) {
        return ResponseEntity.ok(stationService.saveStation(stationDto));
    }

    @PutMapping("/stations/{id}")
    @Operation(summary = "Update station metadata (Admin)")
    public ResponseEntity<StationDto> updateStation(@PathVariable Long id, @Valid @RequestBody StationDto stationDto) {
        stationDto.setId(id);
        return ResponseEntity.ok(stationService.saveStation(stationDto));
    }

    @DeleteMapping("/stations/{id}")
    @Operation(summary = "Delete an EV station (Admin)")
    public ResponseEntity<Map<String, String>> deleteStation(@PathVariable Long id) {
        stationService.deleteStation(id);
        return ResponseEntity.ok(Map.of("message", "Station deleted successfully"));
    }

    @PutMapping("/stations/{id}/status")
    @Operation(summary = "Change live station status (Admin)")
    public ResponseEntity<StationDto> changeStationStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(stationService.updateStationStatus(id, status));
    }

    // Verify / Manage Reports
    @GetMapping("/reports")
    @Operation(summary = "Get list of all filed issue reports (Admin)")
    public ResponseEntity<List<ReportDto>> getAllReports() {
        List<ReportDto> reports = reportRepository.findAllByOrderByReportedAtDesc().stream()
                .map(r -> {
                    ReportDto dto = modelMapper.map(r, ReportDto.class);
                    dto.setStationName(r.getStation().getName());
                    dto.setUsername(r.getUser().getUsername());
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(reports);
    }

    @PutMapping("/reports/{id}/resolve")
    @Operation(summary = "Mark a reported station issue as resolved (Admin)")
    public ResponseEntity<Map<String, String>> resolveReport(@PathVariable Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        report.setStatus("RESOLVED");
        reportRepository.save(report);
        return ResponseEntity.ok(Map.of("message", "Report marked as resolved"));
    }

    // View registered users
    @GetMapping("/users")
    @Operation(summary = "Get all registered users in the platform (Admin)")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userRepository.findAll().stream()
                .map(u -> modelMapper.map(u, UserDto.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}
