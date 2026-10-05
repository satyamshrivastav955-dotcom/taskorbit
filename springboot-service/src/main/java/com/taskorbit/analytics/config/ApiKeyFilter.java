package com.taskorbit.analytics.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class ApiKeyFilter extends OncePerRequestFilter {
  @Value("${app.api-key:change-me}")
  private String apiKey;

  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {
    if (req.getRequestURI().startsWith("/api/")) {
      String key = req.getHeader("X-API-Key");
      if (key == null || !key.equals(apiKey)) {
        res.setStatus(401);
        res.setContentType("application/json");
        res.getWriter().write("{\"error\":{\"code\":\"unauthorized\",\"message\":\"Invalid API key\"}}");
        return;
      }
    }
    chain.doFilter(req, res);
  }
}
