package com.homeplus.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.homeplus.entity.Estimate;
import com.homeplus.entity.Property;
import com.homeplus.dto.PropertyHistoryResponse;
import com.homeplus.repository.EstimateRepository;
import com.homeplus.repository.PropertyRepository;

@Service
public class PropertyService {

    @Autowired
    private PropertyRepository repo;

    @Autowired
    private EstimateRepository estimateRepository;

    private void attachEstimateAndBackfillStatus(Property property) {
        Estimate estimate = estimateRepository.findTopByPropertyIdOrderByEstimatedDateDescIdDesc(property.getId());
        property.setAdminEstimate(estimate);

        // Backfill legacy rows where estimate exists but status was never updated.
        if (estimate != null && !"Estimated".equalsIgnoreCase(property.getStatus())) {
            property.setStatus("Estimated");
            repo.save(property);
        }
    }

    public Property save(Property property) {
        if (property.getOwnerEmail() == null || property.getOwnerEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("ownerEmail is required");
        }
        property.setOwnerEmail(property.getOwnerEmail().trim().toLowerCase());
        property.setStatus("Pending Review");
        property.setSubmissionDate(LocalDateTime.now());
        return repo.save(property);
    }

    public List<Property> getAll() {
        List<Property> properties = repo.findAll();
        properties.forEach(this::attachEstimateAndBackfillStatus);
        return properties;
    }

    public List<Property> getByUser(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("email is required");
        }
        List<Property> properties = repo.findByOwnerEmailIgnoreCase(email.trim());
        properties.forEach(this::attachEstimateAndBackfillStatus);
        return properties;
    }

    public List<PropertyHistoryResponse> getHistoryByUser(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("email is required");
        }

        List<Property> properties = repo.findByOwnerEmailIgnoreCase(email.trim());
        List<PropertyHistoryResponse> history = new ArrayList<>();

        for (Property property : properties) {
            attachEstimateAndBackfillStatus(property);

            PropertyHistoryResponse submissionEntry = new PropertyHistoryResponse();
            submissionEntry.setId(property.getId());
            submissionEntry.setAction("Submission");
            submissionEntry.setDetails("Property details submitted for " + (property.getCity() != null ? property.getCity() : "your location"));
            submissionEntry.setTimestamp(property.getSubmissionDate() != null ? property.getSubmissionDate().toString() : LocalDateTime.now().toString());
            submissionEntry.setPropertyDetails(property);
            history.add(submissionEntry);

            Estimate estimate = property.getAdminEstimate();
            if (estimate != null) {
                PropertyHistoryResponse estimateEntry = new PropertyHistoryResponse();
                estimateEntry.setId(estimate.getId());
                estimateEntry.setAction("Estimate Received");
                double estimatedNewValue = estimate.getEstimatedNewValue() != null ? estimate.getEstimatedNewValue() : 0.0;
                estimateEntry.setDetails("Your property has been estimated at ₹" + String.format("%,.0f", estimatedNewValue));
                estimateEntry.setTimestamp(estimate.getEstimatedDate() != null ? estimate.getEstimatedDate().toString() : LocalDateTime.now().toString());
                estimateEntry.setPropertyDetails(property);
                estimateEntry.setEstimateData(estimate);
                history.add(estimateEntry);
            }
        }

        history.sort(Comparator.comparing(PropertyHistoryResponse::getTimestamp).reversed());
        return history;
    }

    public int claimUnassignedProperties(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("email is required");
        }

        String normalizedEmail = email.trim().toLowerCase();
        List<Property> unassigned = repo.findByOwnerEmailIsNull();
        for (Property property : unassigned) {
            property.setOwnerEmail(normalizedEmail);
        }
        repo.saveAll(unassigned);
        return unassigned.size();
    }

    public Property updateStatus(Long id, String status) {
        Property p = repo.findById(id).orElseThrow();
        p.setStatus(status);
        return repo.save(p);
    }
}