package com.chargewise.dto;

import lombok.Data;

@Data
public class ConnectorTypeDto {
    private Long id;
    private String name;
    private String description;
    private double maxPowerKw;
}
