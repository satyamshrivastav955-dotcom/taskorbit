package com.taskorbit.analytics.service;

import com.taskorbit.analytics.dto.AssigneeStatDto;
import com.taskorbit.analytics.dto.ProjectSummaryDto;
import com.taskorbit.analytics.dto.ReviewerStatDto;
import com.taskorbit.analytics.entity.TaskEntity;
import com.taskorbit.analytics.repository.ReviewRepository;
import com.taskorbit.analytics.repository.TaskRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;

@Service
public class AnalyticsService {
  private final TaskRepository tasks;
  private final ReviewRepository reviews;

  public AnalyticsService(TaskRepository tasks, ReviewRepository reviews) {
    this.tasks = tasks;
    this.reviews = reviews;
  }

  public ProjectSummaryDto summary(String projectId) {
    List<TaskEntity> list = tasks.findByProjectId(projectId);
    Map<String, Long> byStatus = new HashMap<>();
    long revisions = 0;
    long approved = 0;
    long overdue = 0;
    LocalDate today = LocalDate.now();
    for (TaskEntity t : list) {
      byStatus.merge(t.getStatus(), 1L, Long::sum);
      revisions += t.getRevisionCount();
      if ("approved".equals(t.getStatus())) approved++;
      if (!"approved".equals(t.getStatus()) && t.getDeadline() != null && t.getDeadline().isBefore(today)) overdue++;
    }
    double pct = list.isEmpty() ? 0 : (approved * 100.0 / list.size());
    return new ProjectSummaryDto(list.size(), byStatus, pct, overdue, revisions);
  }

  public List<AssigneeStatDto> byAssignee(String projectId) {
    List<TaskEntity> list = tasks.findByProjectId(projectId);
    Map<String, List<TaskEntity>> grouped = new HashMap<>();
    for (TaskEntity t : list) grouped.computeIfAbsent(t.getAssigneeId(), k -> new ArrayList<>()).add(t);
    List<AssigneeStatDto> out = new ArrayList<>();
    for (Map.Entry<String, List<TaskEntity>> e : grouped.entrySet()) {
      List<TaskEntity> g = e.getValue();
      long approved = g.stream().filter(t -> "approved".equals(t.getStatus())).count();
      double avg = g.stream().mapToInt(TaskEntity::getRevisionCount).average().orElse(0);
      long conf = g.stream().filter(t -> t.getHasConflict() == 1).count();
      out.add(new AssigneeStatDto(e.getKey(), g.size(), approved, avg, conf));
    }
    return out;
  }

  public List<ReviewerStatDto> reviewStats() {
    Map<String, long[]> counts = new HashMap<>();
    for (var r : reviews.findAll()) {
      long[] c = counts.computeIfAbsent(r.getReviewerId(), k -> new long[2]);
      if ("approved".equals(r.getDecision())) c[0]++;
      else c[1]++;
    }
    List<ReviewerStatDto> out = new ArrayList<>();
    for (Map.Entry<String, long[]> e : counts.entrySet()) {
      out.add(new ReviewerStatDto(e.getKey(), e.getValue()[0], e.getValue()[1]));
    }
    return out;
  }

  public List<String> assigneesWithConflicts() {
    List<TaskEntity> active = tasks.findActive();
    Set<String> out = new HashSet<>();
    for (int i = 0; i < active.size(); i++) {
      for (int j = i + 1; j < active.size(); j++) {
        TaskEntity a = active.get(i);
        TaskEntity b = active.get(j);
        if (!Objects.equals(a.getAssigneeId(), b.getAssigneeId())) continue;
        if (a.getStartDate() == null || b.getStartDate() == null) continue;
        if (!a.getStartDate().isAfter(b.getDeadline()) && !b.getStartDate().isAfter(a.getDeadline())) {
          out.add(a.getAssigneeId());
        }
      }
    }
    return new ArrayList<>(out);
  }
}
