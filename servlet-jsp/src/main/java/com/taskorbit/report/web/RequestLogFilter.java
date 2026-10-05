package com.taskorbit.report.web;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

@WebFilter("/*")
public class RequestLogFilter implements Filter {
  private ServletContext context;

  @Override
  public void init(FilterConfig config) {
    this.context = config.getServletContext();
  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    long start = System.currentTimeMillis();
    chain.doFilter(request, response);
    HttpServletRequest req = (HttpServletRequest) request;
    context.log(req.getRemoteAddr() + " " + req.getRequestURI() + " " + (System.currentTimeMillis() - start) + "ms");
  }
}
