package com.taskorbit.analytics.controller;

import com.taskorbit.analytics.dto.AssigneeStatDto;
import com.taskorbit.analytics.dto.ProjectSummaryDto;
import com.taskorbit.analytics.dto.ReviewerStatDto;
import com.taskorbit.analytics.service.AnalyticsService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
  private final AnalyticsService service;

  public AnalyticsController(AnalyticsService service) {
    this.service = service;
  }

  @GetMapping("/health")
  public Map<String, String> health() {
    return Map.of("ok", "true");
  }

  @GetMapping("/projects/{id}/summary")
  public ProjectSummaryDto summary(@PathVariable String id) {
    return service.summary(id);
  }

  @GetMapping("/projects/{id}/assignees")
  public List<AssigneeStatDto> assignees(@PathVariable String id) {
    return service.byAssignee(id);
  }

  @GetMapping("/conflicts")
  public List<String> conflicts() {
    return service.assigneesWithConflicts();
  }

  @GetMapping("/reviews/stats")
  public List<ReviewerStatDto> reviewStats() {
    return service.reviewStats();
  }
}
