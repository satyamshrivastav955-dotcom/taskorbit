package com.taskorbit.analytics.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class ReviewEntity {
  @Id
  private String id;
  @Column(name = "task_id")
  private String taskId;
  @Column(name = "reviewer_id")
  private String reviewerId;
  private String decision;
  private String comments;
  @Column(name = "created_at")
  private LocalDateTime createdAt;

  public String getId() { return id; }
  public void setId(String v) { this.id = v; }
  public String getTaskId() { return taskId; }
  public void setTaskId(String v) { this.taskId = v; }
  public String getReviewerId() { return reviewerId; }
  public void setReviewerId(String v) { this.reviewerId = v; }
  public String getDecision() { return decision; }
  public void setDecision(String v) { this.decision = v; }
}
