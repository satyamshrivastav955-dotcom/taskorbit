package com.taskorbit.analytics.dto;

import java.util.Map;

public class ProjectSummaryDto {
  private int totalTasks;
  private Map<String, Long> byStatus;
  private double completionPct;
  private long overdue;
  private long totalRevisions;

  public ProjectSummaryDto(int totalTasks, Map<String, Long> byStatus, double completionPct, long overdue, long totalRevisions) {
    this.totalTasks = totalTasks;
    this.byStatus = byStatus;
    this.completionPct = completionPct;
    this.overdue = overdue;
    this.totalRevisions = totalRevisions;
  }

  public int getTotalTasks() { return totalTasks; }
  public Map<String, Long> getByStatus() { return byStatus; }
  public double getCompletionPct() { return completionPct; }
  public long getOverdue() { return overdue; }
  public long getTotalRevisions() { return totalRevisions; }
}
