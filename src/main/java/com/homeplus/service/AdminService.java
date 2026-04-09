package com.homeplus.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.homeplus.entity.Estimate;
import com.homeplus.entity.Property;
import com.homeplus.repository.EstimateRepository;
import com.homeplus.repository.PropertyRepository;

import java.time.LocalDateTime;

@Service
public class AdminService {

    @Autowired
    private EstimateRepository repo;

    @Autowired
    private PropertyRepository propertyRepository;

    public Estimate saveEstimate(Long propertyId, Estimate estimate) {
        Estimate existing = repo.findTopByPropertyIdOrderByEstimatedDateDescIdDesc(propertyId);
        Estimate target = existing != null ? existing : new Estimate();

        target.setPropertyId(propertyId);
        target.setTotalCost(estimate.getTotalCost());
        target.setValueIncreasePercent(estimate.getValueIncreasePercent());
        target.setEstimatedNewValue(estimate.getEstimatedNewValue());
        target.setAdminNotes(estimate.getAdminNotes());
        target.setEstimatedDate(LocalDateTime.now());

        Estimate saved = repo.save(target);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found"));
        property.setStatus("Estimated");
        propertyRepository.save(property);

        return saved;
    }

    public Estimate getEstimate(Long propertyId) {
        return repo.findTopByPropertyIdOrderByEstimatedDateDescIdDesc(propertyId);
    }
}