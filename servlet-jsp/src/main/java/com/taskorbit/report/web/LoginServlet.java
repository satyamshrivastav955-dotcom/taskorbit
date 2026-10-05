package com.taskorbit.report.web;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import org.mindrot.jbcrypt.BCrypt;
import javax.naming.InitialContext;
import javax.sql.DataSource;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
    req.getRequestDispatcher("/WEB-INF/views/login.jsp").forward(req, res);
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
    String email = req.getParameter("email");
    String password = req.getParameter("password");
    try {
      DataSource ds = (DataSource) new InitialContext().lookup("java:comp/env/jdbc/taskorbit");
      try (Connection c = ds.getConnection();
           PreparedStatement ps = c.prepareStatement("SELECT password_hash FROM report_users WHERE email = ?")) {
        ps.setString(1, email);
        try (ResultSet rs = ps.executeQuery()) {
          if (rs.next() && BCrypt.checkpw(password, rs.getString(1))) {
            req.getSession().setAttribute("manager", email);
            res.sendRedirect(req.getContextPath() + "/projects");
            return;
          }
        }
      }
    } catch (Exception e) {
      throw new ServletException(e);
    }
    req.setAttribute("error", "Invalid email or password.");
    req.getRequestDispatcher("/WEB-INF/views/login.jsp").forward(req, res);
  }
}
