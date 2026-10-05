package com.taskorbit.analytics.dto;

public class ReviewerStatDto {
  private String reviewerId;
  private long approved;
  private long rejected;
  private double approvalRate;

  public ReviewerStatDto(String reviewerId, long approved, long rejected) {
    this.reviewerId = reviewerId;
    this.approved = approved;
    this.rejected = rejected;
    long total = approved + rejected;
    this.approvalRate = total == 0 ? 0 : (approved * 100.0 / total);
  }

  public String getReviewerId() { return reviewerId; }
  public long getApproved() { return approved; }
  public long getRejected() { return rejected; }
  public double getApprovalRate() { return approvalRate; }
}
