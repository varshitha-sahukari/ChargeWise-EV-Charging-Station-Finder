package com.chargewise.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReportDto {
    private Long id;
    private Long userId;
    private String username;
    private Long stationId;
    private String stationName;
    private String issueDescription;
    private String status;
    private LocalDateTime reportedAt;
}
