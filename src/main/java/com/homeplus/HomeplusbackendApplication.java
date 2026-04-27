package com.homeplus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.homeplus.repository")
@EntityScan(basePackages = "com.homeplus.entity")
public class HomeplusbackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(HomeplusbackendApplication.class, args);
    }
}