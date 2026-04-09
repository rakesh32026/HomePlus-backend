package com.homeplus.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.homeplus.entity.Estimate;
import com.homeplus.dto.PropertyEstimationRequest;
import com.homeplus.dto.PropertyEstimationResponse;
import com.homeplus.service.AdminService;
import com.homeplus.service.PropertyEstimationService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("http://localhost:5173")
public class AdminController {

    @Autowired
    private AdminService service;

    @Autowired
    private PropertyEstimationService estimationService;

    @PostMapping("/estimate/{propertyId}")
    public Estimate addEstimate(@PathVariable Long propertyId,
                                @RequestBody Estimate estimate) {
        return service.saveEstimate(propertyId, estimate);
    }

    @GetMapping("/estimate/{propertyId}")
    public Estimate getEstimate(@PathVariable Long propertyId) {
        return service.getEstimate(propertyId);
    }

    @PostMapping("/estimate/calculate")
    public PropertyEstimationResponse calculatePropertyEstimate(@RequestBody PropertyEstimationRequest request) {
        return estimationService.calculate(request);
    }
}