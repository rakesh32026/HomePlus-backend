package com.homeplus.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.homeplus.entity.Estimate;
import com.homeplus.service.AdminService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("http://localhost:5173")
public class AdminController {

    @Autowired
    private AdminService service;

    @PostMapping("/estimate/{propertyId}")
    public Estimate addEstimate(@PathVariable Long propertyId,
                                @RequestBody Estimate estimate) {
        return service.saveEstimate(propertyId, estimate);
    }
}