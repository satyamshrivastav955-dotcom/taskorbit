package com.taskorbit.analytics.repository;

import com.taskorbit.analytics.entity.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TaskRepository extends JpaRepository<TaskEntity, String> {
  List<TaskEntity> findByProjectId(String projectId);

  @Query("SELECT t FROM TaskEntity t WHERE t.assigneeId = :a AND t.status <> 'approved' AND t.startDate <= (SELECT o.deadline FROM TaskEntity o WHERE o.id = :other) AND (SELECT o.startDate FROM TaskEntity o WHERE o.id = :other) <= t.deadline")
  List<TaskEntity> overlapping(@Param("a") String assigneeId, @Param("other") String otherId);

  @Query("SELECT t FROM TaskEntity t WHERE t.status <> 'approved'")
  List<TaskEntity> findActive();
}
