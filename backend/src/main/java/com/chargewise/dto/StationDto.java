package com.chargewise.dto;

import lombok.Data;
import java.util.List;

@Data
public class StationDto {
    private Long id;
    private String name;
    private String address;
    private double latitude;
    private double longitude;
    private String network;
    private String state;
    private String pinCode;
    private String operatingHours;
    private String contactDetails;
    private double basePricing;
    private String status;
    private double averageRating;
    private int reviewsCount;
    private double carbonSavedKg;
    private List<StationConnectorDto> connectors;
    private List<StationImageDto> images;
}
