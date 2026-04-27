package com.homeplus.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.homeplus.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
}