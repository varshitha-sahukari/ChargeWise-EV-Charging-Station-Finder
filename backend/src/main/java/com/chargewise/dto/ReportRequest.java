package com.chargewise.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReportRequest {
    @NotNull(message = "Station ID is required")
    private Long stationId;

    @NotBlank(message = "Issue description is required")
    private String issueDescription;
}
