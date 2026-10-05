package com.taskorbit.report.dao;

import com.taskorbit.report.model.ProjectBean;
import com.taskorbit.report.model.TaskBean;
import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ReportDao {
  private final DataSource ds;

  public ReportDao(DataSource ds) {
    this.ds = ds;
  }

  public List<ProjectBean> listProjects() throws SQLException {
    String sql = "SELECT id, title, description, status, deadline FROM projects ORDER BY deadline";
    try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
      List<ProjectBean> out = new ArrayList<>();
      while (rs.next()) {
        ProjectBean b = new ProjectBean();
        b.setId(rs.getString(1));
        b.setTitle(rs.getString(2));
        b.setDescription(rs.getString(3));
        b.setStatus(rs.getString(4));
        b.setDeadline(String.valueOf(rs.getDate(5)));
        out.add(b);
      }
      return out;
    }
  }

  public List<TaskBean> tasksFor(String projectId) throws SQLException {
    String sql = "SELECT id, title, assignee_id, start_date, deadline, status, revision_count, has_conflict FROM tasks WHERE project_id = ?";
    try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
      ps.setString(1, projectId);
      try (ResultSet rs = ps.executeQuery()) {
        List<TaskBean> out = new ArrayList<>();
        while (rs.next()) {
          TaskBean b = new TaskBean();
          b.setId(rs.getString(1));
          b.setTitle(rs.getString(2));
          b.setAssigneeId(rs.getString(3));
          b.setStartDate(String.valueOf(rs.getDate(4)));
          b.setDeadline(String.valueOf(rs.getDate(5)));
          b.setStatus(rs.getString(6));
          b.setRevisionCount(rs.getInt(7));
          b.setHasConflict(rs.getInt(8));
          out.add(b);
        }
        return out;
      }
    }
  }
}
