package com.homeplus.repository;

import com.homeplus.entity.Estimate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstimateRepository extends JpaRepository<Estimate, Long> {
    Estimate findByPropertyId(Long propertyId);
}