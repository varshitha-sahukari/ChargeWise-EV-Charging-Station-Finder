package com.chargewise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIRecommendationResponse {
    private double score;
    private StationDto station;
    private double distanceKm;
    private List<Integer> predictedPeakHours; // List of hours (0-23) which are busy
    private StationDto lessCrowdedAlternative;
}
