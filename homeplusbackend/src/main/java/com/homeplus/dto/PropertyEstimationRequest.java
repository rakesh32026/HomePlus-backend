package com.homeplus.dto;

import java.util.List;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PropertyEstimationRequest {
    @NotBlank(message = "Property title is required")
    private String propertyTitle;

    @NotBlank(message = "Location type is required")
    private String locationType;

    @NotNull(message = "Area in sq.ft is required")
    @DecimalMin(value = "0.1", inclusive = true, message = "Area must be greater than 0")
    private Double areaSqFt;

    @NotNull(message = "Base price per sq.ft is required")
    @DecimalMin(value = "0.1", inclusive = true, message = "Base price per sq.ft must be greater than 0")
    private Double basePricePerSqFt;

    @NotBlank(message = "Property age is required")
    private String propertyAgeBand;

    private List<String> amenities;
    private List<String> improvements;

    public String getPropertyTitle() {
        return propertyTitle;
    }

    public void setPropertyTitle(String propertyTitle) {
        this.propertyTitle = propertyTitle;
    }

    public String getLocationType() {
        return locationType;
    }

    public void setLocationType(String locationType) {
        this.locationType = locationType;
    }

    public Double getAreaSqFt() {
        return areaSqFt;
    }

    public void setAreaSqFt(Double areaSqFt) {
        this.areaSqFt = areaSqFt;
    }

    public Double getBasePricePerSqFt() {
        return basePricePerSqFt;
    }

    public void setBasePricePerSqFt(Double basePricePerSqFt) {
        this.basePricePerSqFt = basePricePerSqFt;
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