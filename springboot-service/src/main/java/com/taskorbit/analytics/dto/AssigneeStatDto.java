package com.taskorbit.analytics.dto;

public class AssigneeStatDto {
  private String assigneeId;
  private long taskCount;
  private long approvedCount;
  private double avgRevisions;
  private long conflicting;

  public AssigneeStatDto(String assigneeId, long taskCount, long approvedCount, double avgRevisions, long conflicting) {
    this.assigneeId = assigneeId;
    this.taskCount = taskCount;
    this.approvedCount = approvedCount;
    this.avgRevisions = avgRevisions;
    this.conflicting = conflicting;
  }

  public String getAssigneeId() { return assigneeId; }
  public long getTaskCount() { return taskCount; }
  public long getApprovedCount() { return approvedCount; }
  public double getAvgRevisions() { return avgRevisions; }
  public long getConflicting() { return conflicting; }
}
