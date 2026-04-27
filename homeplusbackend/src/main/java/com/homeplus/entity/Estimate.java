package com.homeplus.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Estimate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long propertyId;
    private Double totalCost;
    private Double valueIncreasePercent;
    private Double estimatedNewValue;
    private String adminNotes;
    private LocalDateTime estimatedDate;

    // Getter and Setter for id
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // Getter and Setter for propertyId
    public Long getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    // Getter and Setter for totalCost
    public Double getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(Double totalCost) {
        this.totalCost = totalCost;
    }

    // Getter and Setter for valueIncreasePercent
    public Double getValueIncreasePercent() {
        return valueIncreasePercent;
    }

    public void setValueIncreasePercent(Double valueIncreasePercent) {
        this.valueIncreasePercent = valueIncreasePercent;
    }

    // Getter and Setter for estimatedNewValue
    public Double getEstimatedNewValue() {
        return estimatedNewValue;
    }

    public void setEstimatedNewValue(Double estimatedNewValue) {
        this.estimatedNewValue = estimatedNewValue;
    }

    // Getter and Setter for adminNotes
    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    // Getter and Setter for estimatedDate
    public LocalDateTime getEstimatedDate() {
        return estimatedDate;
    }

    public void setEstimatedDate(LocalDateTime estimatedDate) {
        this.estimatedDate = estimatedDate;
    }
}