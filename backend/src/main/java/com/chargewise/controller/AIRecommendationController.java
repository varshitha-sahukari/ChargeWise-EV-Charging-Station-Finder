package com.chargewise.controller;

import com.chargewise.dto.AIRecommendationResponse;
import com.chargewise.service.AIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Recommendation Controller", description = "AI-powered station recommendations and peak hours predictions")
public class AIRecommendationController {

    private final AIService aiService;

    public AIRecommendationController(AIService aiService) {
        this.aiService = aiService;
    }

    @GetMapping("/recommend")
    @Operation(summary = "Get ranked station recommendations based on distance, speed, price, and status")
    public ResponseEntity<List<AIRecommendationResponse>> getRecommendations(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(required = false) String connectorType) {
        return ResponseEntity.ok(aiService.getRecommendations(latitude, longitude, connectorType));
    }
}
