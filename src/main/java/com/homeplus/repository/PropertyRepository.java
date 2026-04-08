package com.homeplus.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.homeplus.entity.Property;

public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByOwnerEmail(String email);
    List<Property> findByOwnerEmailIgnoreCase(String email);
    List<Property> findByOwnerEmailIsNull();
}