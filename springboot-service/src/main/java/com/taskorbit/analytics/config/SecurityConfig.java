package com.taskorbit.analytics.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {
  private final ApiKeyFilter apiKeyFilter;

  public SecurityConfig(ApiKeyFilter apiKeyFilter) {
    this.apiKeyFilter = apiKeyFilter;
  }

  @Bean
  public SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable());
    http.authorizeHttpRequests(a -> a.anyRequest().permitAll());
    http.addFilterBefore(apiKeyFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }
}
