package com.homeplus.dto;

import com.homeplus.entity.Estimate;
import com.homeplus.entity.Property;

public class PropertyHistoryResponse {
    private Long id;
    private String action;
    private String details;
    private String timestamp;
    private Property propertyDetails;
    private Estimate estimateData;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public Property getPropertyDetails() {
        return propertyDetails;
    }

    public void setPropertyDetails(Property propertyDetails) {
        this.propertyDetails = propertyDetails;
    }

    public Estimate getEstimateData() {
        return estimateData;
    }

    public void setEstimateData(Estimate estimateData) {
        this.estimateData = estimateData;
    }
}