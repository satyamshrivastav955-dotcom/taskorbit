package com.taskorbit.analytics.repository;

import com.taskorbit.analytics.entity.ReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<ReviewEntity, String> {
}
