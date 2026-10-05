package com.taskorbit.analytics.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tasks")
public class TaskEntity {
  @Id
  private String id;
  @Column(name = "project_id")
  private String projectId;
  private String title;
  @Column(name = "assignee_id")
  private String assigneeId;
  @Column(name = "reviewer_id")
  private String reviewerId;
  @Column(name = "start_date")
  private LocalDate startDate;
  private LocalDate deadline;
  private String priority;
  private String status;
  @Column(name = "revision_count")
  private int revisionCount;
  @Column(name = "has_conflict")
  private int hasConflict;

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getProjectId() { return projectId; }
  public void setProjectId(String v) { this.projectId = v; }
  public String getAssigneeId() { return assigneeId; }
  public void setAssigneeId(String v) { this.assigneeId = v; }
  public String getReviewerId() { return reviewerId; }
  public void setReviewerId(String v) { this.reviewerId = v; }
  public LocalDate getStartDate() { return startDate; }
  public void setStartDate(LocalDate v) { this.startDate = v; }
  public LocalDate getDeadline() { return deadline; }
  public void setDeadline(LocalDate v) { this.deadline = v; }
  public String getStatus() { return status; }
  public void setStatus(String v) { this.status = v; }
  public int getRevisionCount() { return revisionCount; }
  public void setRevisionCount(int v) { this.revisionCount = v; }
  public int getHasConflict() { return hasConflict; }
  public void setHasConflict(int v) { this.hasConflict = v; }
}
