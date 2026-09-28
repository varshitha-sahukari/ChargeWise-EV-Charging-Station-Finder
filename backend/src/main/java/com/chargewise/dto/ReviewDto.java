package com.chargewise.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewDto {
    private Long id;
    private int rating;
    private String comment;
    private Long userId;
    private String username;
    private Long stationId;
    private String stationName;
    private LocalDateTime createdAt;
}
