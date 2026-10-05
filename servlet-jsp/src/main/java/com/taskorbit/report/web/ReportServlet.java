package com.taskorbit.report.web;

import com.taskorbit.report.dao.ReportDao;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import javax.naming.InitialContext;
import javax.sql.DataSource;
import java.io.IOException;

@WebServlet("/report")
public class ReportServlet extends HttpServlet {
  private ReportDao dao;

  @Override
  public void init() {
    try {
      DataSource ds = (DataSource) new InitialContext().lookup("java:comp/env/jdbc/taskorbit");
      dao = new ReportDao(ds);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
    String projectId = req.getParameter("projectId");
    try {
      req.setAttribute("tasks", dao.tasksFor(projectId));
      req.getRequestDispatcher("/WEB-INF/views/report.jsp").forward(req, res);
    } catch (Exception e) {
      throw new ServletException(e);
    }
  }
}
