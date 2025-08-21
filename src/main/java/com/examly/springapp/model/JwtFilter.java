package com.examly.springapp.model;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws IOException, jakarta.servlet.ServletException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        System.out.println("🔍 JwtFilter - Processing request: " + method + " " + path);

        if (shouldNotFilter(request)) {
            System.out.println("⏭️ JwtFilter - Skipping authentication for: " + path);
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        System.out.println("🔑 JwtFilter - Auth header present: " + (authHeader != null));

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            System.out.println("🎫 JwtFilter - Extracted JWT (first 20 chars): " + jwt.substring(0, Math.min(jwt.length(), 20)) + "...");
            
            try {
                System.out.println("⚡ JwtFilter - Validating token...");
                
                if (jwtUtil.isTokenValid(jwt)) {
                    System.out.println("✅ JwtFilter - Token is valid");
                    
                    String username = jwtUtil.extractUsername(jwt);
                    String roleClaim = jwtUtil.extractClaim(jwt, "role");

                    System.out.println("👤 JwtFilter - Username: " + username);
                    System.out.println("🏷️ JwtFilter - Role claim: '" + roleClaim + "'");

                    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        if (roleClaim == null || roleClaim.trim().isEmpty()) {
                            System.out.println("❌ JwtFilter - No role found in token");
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"No role found in token\",\"status\":403}");
                            return;
                        }

                        // Role already stored with ROLE_ prefix
                        String authority = roleClaim;
                        System.out.println("🛡️ JwtFilter - Setting authority: " + authority);

                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(
                                        username,
                                        null,
                                        Collections.singletonList(new SimpleGrantedAuthority(authority))
                                );

                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        System.out.println("✅ JwtFilter - Authentication set successfully");
                        
                        // Debug: Print current authentication
                        System.out.println("🔐 JwtFilter - Current authentication: " + SecurityContextHolder.getContext().getAuthentication());
                        System.out.println("🔐 JwtFilter - Authorities: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
                    }
                } else {
                    System.out.println("❌ JwtFilter - Token validation failed");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Invalid or expired token\",\"status\":401}");
                    return;
                }
            } catch (Exception e) {
                System.out.println("💥 JwtFilter - Exception during token processing: " + e.getClass().getSimpleName() + " - " + e.getMessage());
                e.printStackTrace();
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Invalid JWT token\",\"status\":401}");
                return;
            }
        } else {
            System.out.println("❌ JwtFilter - No authorization token provided");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"No authorization token provided\",\"status\":401}");
            return;
        }

        System.out.println("🎯 JwtFilter - Proceeding to next filter...");
        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        boolean shouldSkip = path.equals("/auth/login") ||
               path.equals("/auth/register") ||
               path.equals("/auth/logout") ||
               path.equals("/auth/test") ||
               path.startsWith("/public/");
        
        System.out.println("🤔 JwtFilter - Should skip filtering for " + path + "? " + shouldSkip);
        return shouldSkip;
    }
}
