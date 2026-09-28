package com.chargewise.controller;

import com.chargewise.dto.ReviewDto;
import com.chargewise.dto.ReviewRequest;
import com.chargewise.dto.StationDto;
import com.chargewise.entity.Review;
import com.chargewise.entity.Station;
import com.chargewise.entity.User;
import com.chargewise.exception.ResourceNotFoundException;
import com.chargewise.repository.ReviewRepository;
import com.chargewise.repository.StationRepository;
import com.chargewise.repository.UserRepository;
import com.chargewise.service.StationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stations")
@Tag(name = "Station Controller", description = "Endpoints for searching and filtering EV charging stations")
public class StationController {

    private final StationService stationService;
    private final StationRepository stationRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final ModelMapper modelMapper;

    public StationController(StationService stationService, StationRepository stationRepository,
                             UserRepository userRepository, ReviewRepository reviewRepository, ModelMapper modelMapper) {
        this.stationService = stationService;
        this.stationRepository = stationRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
        this.modelMapper = modelMapper;
    }

    @GetMapping
    @Operation(summary = "Search and filter stations dynamically")
    public ResponseEntity<List<StationDto>> searchStations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String connectorType,
            @RequestParam(required = false) Boolean fastCharging,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String network,
            @RequestParam(required = false) Double minPower,
            @RequestParam(required = false) Double maxPower) {
        return ResponseEntity.ok(stationService.searchAndFilterStations(
                search, connectorType, fastCharging, status, network, minPower, maxPower));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get station details by ID")
    public ResponseEntity<StationDto> getStationById(@PathVariable Long id) {
        return ResponseEntity.ok(stationService.getStationById(id));
    }

    @GetMapping("/nearby")
    @Operation(summary = "Find stations within geographical radius")
    public ResponseEntity<List<StationDto>> getNearbyStations(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "10.0") double radiusKm) {
        return ResponseEntity.ok(stationService.findNearbyStations(latitude, longitude, radiusKm));
    }

    @GetMapping("/{id}/reviews")
    @Operation(summary = "Get reviews for a station")
    public ResponseEntity<List<ReviewDto>> getStationReviews(@PathVariable Long id) {
        if (!stationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Station not found");
        }
        List<ReviewDto> list = reviewRepository.findByStationIdOrderByCreatedAtDesc(id).stream()
                .map(r -> {
                    ReviewDto dto = modelMapper.map(r, ReviewDto.class);
                    dto.setUsername(r.getUser().getUsername());
                    dto.setStationName(r.getStation().getName());
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/review")
    @Operation(summary = "Post a review for a station")
    public ResponseEntity<ReviewDto> addReview(@PathVariable Long id, @Valid @RequestBody ReviewRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found"));

        Review review = Review.builder()
                .user(user)
                .station(station)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review saved = reviewRepository.save(review);

        // Update station average ratings
        List<Review> stationReviews = reviewRepository.findByStationIdOrderByCreatedAtDesc(id);
        double avg = stationReviews.stream().mapToInt(Review::getRating).average().orElse(4.0);
        station.setAverageRating(Math.round(avg * 10.0) / 10.0);
        station.setReviewsCount(stationReviews.size());
        stationRepository.save(station);

        ReviewDto dto = modelMapper.map(saved, ReviewDto.class);
        dto.setUsername(user.getUsername());
        dto.setStationName(station.getName());
        return ResponseEntity.ok(dto);
    }
}
