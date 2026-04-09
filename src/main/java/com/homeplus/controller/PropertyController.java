package com.homeplus.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.homeplus.dto.PropertyHistoryResponse;
import com.homeplus.entity.Property;
import com.homeplus.service.PropertyService;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin("http://localhost:5173")
public class PropertyController {

    @Autowired
    private PropertyService service;

    @PostMapping
    public Property create(@RequestBody Property property) {
        return service.save(property);
    }

    @GetMapping
    public List<Property> getAll() {
        return service.getAll();
    }

    @GetMapping("/user/{email}")
    public List<Property> getUser(@PathVariable String email) {
        return service.getByUser(email);
    }

    @GetMapping("/user/{email}/history")
    public List<PropertyHistoryResponse> getUserHistory(@PathVariable String email) {
        return service.getHistoryByUser(email);
    }

    @PutMapping("/user/{email}/claim-unassigned")
    public Map<String, Object> claimUnassigned(@PathVariable String email) {
        int updatedCount = service.claimUnassignedProperties(email);
        return Map.of(
                "message", "Unassigned properties claimed",
                "updatedCount", updatedCount,
                "email", email);
    }

    @PutMapping("/{id}/approve")
    public Property approve(@PathVariable Long id) {
        return service.updateStatus(id, "Approved");
    }

    @PutMapping("/{id}/reject")
    public Property reject(@PathVariable Long id) {
        return service.updateStatus(id, "Rejected");
    }
}