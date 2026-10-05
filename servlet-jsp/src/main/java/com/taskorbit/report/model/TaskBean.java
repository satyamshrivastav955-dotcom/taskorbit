package com.taskorbit.report.model;

public class TaskBean {
  private String id;
  private String title;
  private String assigneeId;
  private String startDate;
  private String deadline;
  private String status;
  private int revisionCount;
  private int hasConflict;

  public String getId() { return id; }
  public void setId(String v) { this.id = v; }
  public String getTitle() { return title; }
  public void setTitle(String v) { this.title = v; }
  public String getAssigneeId() { return assigneeId; }
  public void setAssigneeId(String v) { this.assigneeId = v; }
  public String getStartDate() { return startDate; }
  public void setStartDate(String v) { this.startDate = v; }
  public String getDeadline() { return deadline; }
  public void setDeadline(String v) { this.deadline = v; }
  public String getStatus() { return status; }
  public void setStatus(String v) { this.status = v; }
  public int getRevisionCount() { return revisionCount; }
  public void setRevisionCount(int v) { this.revisionCount = v; }
  public int getHasConflict() { return hasConflict; }
  public void setHasConflict(int v) { this.hasConflict = v; }
}
