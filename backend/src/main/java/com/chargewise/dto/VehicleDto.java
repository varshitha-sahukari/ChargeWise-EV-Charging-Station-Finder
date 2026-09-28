package com.chargewise.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class VehicleDto {
    private Long id;

    @NotBlank(message = "Brand is required")
    private String brand;

    @NotBlank(message = "Model is required")
    private String model;

    @Positive(message = "Battery capacity must be positive")
    private double batteryCapacity; // kWh

    @Positive(message = "Max range must be positive")
    private double maxRange; // km

    @NotBlank(message = "Connector type is required")
    private String connectorType;

    private Long userId;
}
