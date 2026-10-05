package com.taskorbit.report.model;

public class ProjectBean {
  private String id;
  private String title;
  private String description;
  private String status;
  private String deadline;

  public String getId() { return id; }
  public void setId(String v) { this.id = v; }
  public String getTitle() { return title; }
  public void setTitle(String v) { this.title = v; }
  public String getDescription() { return description; }
  public void setDescription(String v) { this.description = v; }
  public String getStatus() { return status; }
  public void setStatus(String v) { this.status = v; }
  public String getDeadline() { return deadline; }
  public void setDeadline(String v) { this.deadline = v; }
}
