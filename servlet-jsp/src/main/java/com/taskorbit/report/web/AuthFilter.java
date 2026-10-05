package com.taskorbit.report.web;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebFilter("/*")
public class AuthFilter implements Filter {
  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    HttpServletRequest req = (HttpServletRequest) request;
    HttpServletResponse res = (HttpServletResponse) response;
    String path = req.getRequestURI().substring(req.getContextPath().length());
    if (path.equals("/login") || path.startsWith("/assets/")) {
      chain.doFilter(request, response);
      return;
    }
    HttpSession session = req.getSession(false);
    if (session == null || session.getAttribute("manager") == null) {
      res.sendRedirect(req.getContextPath() + "/login");
      return;
    }
    chain.doFilter(request, response);
  }
}
