package com.chargewise.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingDto {
    private Long id;
    private Long userId;
    private String username;
    private Long stationId;
    private String stationName;
    private Long vehicleId;
    private String vehicleModel;
    private LocalDateTime bookingTime;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
}
