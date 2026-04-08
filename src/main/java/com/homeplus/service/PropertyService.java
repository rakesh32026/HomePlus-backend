package com.homeplus.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.homeplus.entity.Property;
import com.homeplus.repository.PropertyRepository;

@Service
public class PropertyService {

    @Autowired
    private PropertyRepository repo;

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
        return repo.findAll();
    }

    public List<Property> getByUser(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("email is required");
        }
        return repo.findByOwnerEmailIgnoreCase(email.trim());
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