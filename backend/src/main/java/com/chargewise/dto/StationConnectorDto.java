package com.chargewise.dto;

import lombok.Data;

@Data
public class StationConnectorDto {
    private Long id;
    private ConnectorTypeDto connectorType;
    private String status;
    private double powerOutputKw;
    private double pricing;
}
