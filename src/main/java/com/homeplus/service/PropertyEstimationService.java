package com.homeplus.service;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.homeplus.dto.PropertyEstimationRequest;
import com.homeplus.dto.PropertyEstimationResponse;

@Service
public class PropertyEstimationService {

    public PropertyEstimationResponse calculate(PropertyEstimationRequest request) {
        validateRequest(request);

        double locationFactor = resolveLocationFactor(request.getLocationType());
        double ageFactor = resolveAgeFactor(request.getPropertyAgeBand());
        double amenitiesFactor = resolveAmenitiesFactor(request.getAmenities());
        double improvementsFactor = resolveImprovementsFactor(request.getImprovements());

        double basePrice = request.getAreaSqFt() * request.getBasePricePerSqFt();
        double currentPropertyValue = basePrice * (1 + locationFactor + ageFactor + amenitiesFactor);
        double improvedPropertyValue = basePrice * (1 + locationFactor + ageFactor + amenitiesFactor + improvementsFactor);
        double estimatedValueIncrease = improvedPropertyValue - currentPropertyValue;

        PropertyEstimationResponse response = new PropertyEstimationResponse();
        response.setPropertyTitle(request.getPropertyTitle().trim());
        response.setLocationType(request.getLocationType());
        response.setPropertyAgeBand(request.getPropertyAgeBand());
        response.setAmenities(request.getAmenities());
        response.setImprovements(request.getImprovements());
        response.setBasePrice(round(basePrice));
        response.setLocationPercentage(round(locationFactor * 100));
        response.setAgePercentage(round(ageFactor * 100));
        response.setTotalAmenitiesPercentage(round(amenitiesFactor * 100));
        response.setTotalImprovementsPercentage(round(improvementsFactor * 100));
        response.setCurrentPropertyValue(round(currentPropertyValue));
        response.setImprovedPropertyValue(round(improvedPropertyValue));
        response.setEstimatedValueIncrease(round(estimatedValueIncrease));
        response.setRecommendationMessage(buildRecommendation(request.getImprovements(), improvementsFactor, amenitiesFactor));
        return response;
    }

    private void validateRequest(PropertyEstimationRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Estimation request is required");
        }
        if (request.getPropertyTitle() == null || request.getPropertyTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Property title is required");
        }
        if (request.getLocationType() == null || request.getLocationType().trim().isEmpty()) {
            throw new IllegalArgumentException("Location type is required");
        }
        if (request.getPropertyAgeBand() == null || request.getPropertyAgeBand().trim().isEmpty()) {
            throw new IllegalArgumentException("Property age is required");
        }
        if (request.getAreaSqFt() == null || request.getAreaSqFt() <= 0) {
            throw new IllegalArgumentException("Area in sq.ft must be greater than 0");
        }
        if (request.getBasePricePerSqFt() == null || request.getBasePricePerSqFt() <= 0) {
            throw new IllegalArgumentException("Base price per sq.ft must be greater than 0");
        }
    }

    private double resolveLocationFactor(String locationType) {
        return switch (normalize(locationType)) {
            case "prime city", "prime-city", "prime_city" -> 0.30;
            case "normal area", "normal-area", "normal_area" -> 0.0;
            case "remote area", "remote-area", "remote_area" -> -0.10;
            default -> throw new IllegalArgumentException("Invalid location type");
        };
    }

    private double resolveAgeFactor(String propertyAgeBand) {
        return switch (normalize(propertyAgeBand)) {
            case "0-5", "0–5", "0 to 5" -> 0.10;
            case "5-15", "5–15", "5 to 15" -> 0.0;
            case "above 15", "above-15", "15+" -> -0.15;
            default -> throw new IllegalArgumentException("Invalid property age band");
        };
    }

    private double resolveAmenitiesFactor(List<String> amenities) {
        Set<String> selected = normalizeSet(amenities);
        double total = 0.0;

        if (selected.contains("parking")) total += 0.05;
        if (selected.contains("security")) total += 0.05;
        if (selected.contains("lift")) total += 0.05;
        if (selected.contains("garden-balcony") || selected.contains("garden / balcony") || selected.contains("garden/balcony") || selected.contains("garden balcony")) total += 0.03;
        if (selected.contains("smart-home") || selected.contains("smart home") || selected.contains("smarthome")) total += 0.08;

        return total;
    }

    private double resolveImprovementsFactor(List<String> improvements) {
        Set<String> selected = normalizeSet(improvements);
        double total = 0.0;

        if (selected.contains("modular-kitchen") || selected.contains("modular kitchen")) total += 0.05;
        if (selected.contains("interior-design") || selected.contains("interior design")) total += 0.07;
        if (selected.contains("painting")) total += 0.02;
        if (selected.contains("flooring-upgrade") || selected.contains("flooring upgrade")) total += 0.04;
        if (selected.contains("bathroom-upgrade") || selected.contains("bathroom upgrade")) total += 0.04;
        if (selected.contains("solar-panels") || selected.contains("solar panels")) total += 0.08;

        return total;
    }

    private String buildRecommendation(List<String> improvements, double improvementsFactor, double amenitiesFactor) {
        Set<String> selected = normalizeSet(improvements);

        if ((selected.contains("solar-panels") || selected.contains("solar panels"))
            && (selected.contains("modular-kitchen") || selected.contains("modular kitchen"))) {
            return "Adding Solar Panels and Modular Kitchen gives better return.";
        }

        if (improvementsFactor >= 0.10) {
            return "The selected improvements significantly increase the estimated value.";
        }

        if (amenitiesFactor >= 0.15) {
            return "This property has strong improvement potential.";
        }

        return "This property has strong improvement potential. Consider Solar Panels or Modular Kitchen for higher returns.";
    }

    private Set<String> normalizeSet(List<String> values) {
        Set<String> normalized = new HashSet<>();
        if (values == null) {
            return normalized;
        }

        for (String value : values) {
            if (value != null) {
                normalized.add(normalize(value));
            }
        }
        return normalized;
    }

    private String normalize(String value) {
        return value.trim().toLowerCase(Locale.ENGLISH).replace('_', '-');
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}