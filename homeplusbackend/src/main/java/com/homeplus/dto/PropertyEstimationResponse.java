package com.homeplus.dto;

import java.util.List;

public class PropertyEstimationResponse {
    private String propertyTitle;
    private Double basePrice;
    private Double locationPercentage;
    private Double agePercentage;
    private Double totalAmenitiesPercentage;
    private Double totalImprovementsPercentage;
    private Double currentPropertyValue;
    private Double improvedPropertyValue;
    private Double estimatedValueIncrease;
    private String recommendationMessage;
    private String locationType;
    private String propertyAgeBand;
    private List<String> amenities;
    private List<String> improvements;

    public String getPropertyTitle() {
        return propertyTitle;
    }

    public void setPropertyTitle(String propertyTitle) {
        this.propertyTitle = propertyTitle;
    }

    public Double getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(Double basePrice) {
        this.basePrice = basePrice;
    }

    public Double getLocationPercentage() {
        return locationPercentage;
    }

    public void setLocationPercentage(Double locationPercentage) {
        this.locationPercentage = locationPercentage;
    }

    public Double getAgePercentage() {
        return agePercentage;
    }

    public void setAgePercentage(Double agePercentage) {
        this.agePercentage = agePercentage;
    }

    public Double getTotalAmenitiesPercentage() {
        return totalAmenitiesPercentage;
    }

    public void setTotalAmenitiesPercentage(Double totalAmenitiesPercentage) {
        this.totalAmenitiesPercentage = totalAmenitiesPercentage;
    }

    public Double getTotalImprovementsPercentage() {
        return totalImprovementsPercentage;
    }

    public void setTotalImprovementsPercentage(Double totalImprovementsPercentage) {
        this.totalImprovementsPercentage = totalImprovementsPercentage;
    }

    public Double getCurrentPropertyValue() {
        return currentPropertyValue;
    }

    public void setCurrentPropertyValue(Double currentPropertyValue) {
        this.currentPropertyValue = currentPropertyValue;
    }

    public Double getImprovedPropertyValue() {
        return improvedPropertyValue;
    }

    public void setImprovedPropertyValue(Double improvedPropertyValue) {
        this.improvedPropertyValue = improvedPropertyValue;
    }

    public Double getEstimatedValueIncrease() {
        return estimatedValueIncrease;
    }

    public void setEstimatedValueIncrease(Double estimatedValueIncrease) {
        this.estimatedValueIncrease = estimatedValueIncrease;
    }

    public String getRecommendationMessage() {
        return recommendationMessage;
    }

    public void setRecommendationMessage(String recommendationMessage) {
        this.recommendationMessage = recommendationMessage;
    }

    public String getLocationType() {
        return locationType;
    }

    public void setLocationType(String locationType) {
        this.locationType = locationType;
    }

    public String getPropertyAgeBand() {
        return propertyAgeBand;
    }

    public void setPropertyAgeBand(String propertyAgeBand) {
        this.propertyAgeBand = propertyAgeBand;
    }

    public List<String> getAmenities() {
        return amenities;
    }

    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }

    public List<String> getImprovements() {
        return improvements;
    }

    public void setImprovements(List<String> improvements) {
        this.improvements = improvements;
    }
}