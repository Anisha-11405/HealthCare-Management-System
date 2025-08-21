package com.examly.springapp.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.examly.springapp.model.JwtFilter;
import com.examly.springapp.service.MyUserDetailsService;

import java.util.Arrays;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final MyUserDetailsService userDetailsService;
    private final JwtFilter jwtFilter;

    public SecurityConfig(MyUserDetailsService userDetailsService, JwtFilter jwtFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .authorizeHttpRequests(auth -> auth
                // ✅ PUBLIC ENDPOINTS
                .requestMatchers("/auth/login", "/auth/register", "/auth/logout", "/auth/test").permitAll()
                .requestMatchers("/auth/test-public").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                
                // ✅ DEBUG ENDPOINTS (for testing)
                .requestMatchers("/auth/debug").authenticated()
                .requestMatchers("/auth/test-**").authenticated()
                
                // ✅ AUTH ENDPOINTS
                .requestMatchers("/auth/me").authenticated()
                
                // ✅ CRITICAL FIX: Use hasAuthority instead of hasRole for exact matching
                // Since your JWT contains "ROLE_DOCTOR", use hasAuthority("ROLE_DOCTOR")
                
                // APPOINTMENT ENDPOINTS - FIXED
                .requestMatchers("/api/appointments/my/doctor").hasAuthority("ROLE_DOCTOR")
                .requestMatchers("/api/appointments/my/patient").hasAuthority("ROLE_PATIENT")
                .requestMatchers("/appointments/my/doctor").hasAuthority("ROLE_DOCTOR") // Non-API path
                .requestMatchers("/appointments/my/patient").hasAuthority("ROLE_PATIENT") // Non-API path
                .requestMatchers("/api/appointments/*/approve").hasAuthority("ROLE_DOCTOR")
                .requestMatchers("/api/appointments/*/reject").hasAuthority("ROLE_DOCTOR")
                .requestMatchers("/api/appointments/*/confirm").hasAnyAuthority("ROLE_DOCTOR", "ROLE_ADMIN")
                .requestMatchers("/api/appointments/*/complete").hasAnyAuthority("ROLE_DOCTOR", "ROLE_ADMIN")
                .requestMatchers("/api/appointments/*/status").hasAnyAuthority("ROLE_DOCTOR", "ROLE_ADMIN")
                .requestMatchers("/api/appointments/*/cancel").hasAnyAuthority("ROLE_PATIENT", "ROLE_DOCTOR", "ROLE_ADMIN")
                .requestMatchers("/api/appointments/patient/**").hasAnyAuthority("ROLE_PATIENT", "ROLE_DOCTOR", "ROLE_ADMIN")
                .requestMatchers("/api/appointments/doctor/**").hasAnyAuthority("ROLE_DOCTOR", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/appointments").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/appointments").hasAnyAuthority("ROLE_PATIENT", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/appointments/**").hasAuthority("ROLE_ADMIN")
                
                // PATIENT ENDPOINTS - FIXED
                .requestMatchers("/api/patients/my").hasAuthority("ROLE_DOCTOR")
                .requestMatchers("/patients/my").hasAuthority("ROLE_DOCTOR") // Non-API path
                .requestMatchers("/api/patients/dashboard/my-stats").hasAuthority("ROLE_PATIENT")
                .requestMatchers("/api/patients/dashboard/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/patients").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/patients").permitAll() // Registration
                .requestMatchers("/api/patients/{id}").hasAnyAuthority("ROLE_PATIENT", "ROLE_DOCTOR", "ROLE_ADMIN")
                .requestMatchers("/api/patients/admin").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/patients/secure/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCTOR")
                .requestMatchers(HttpMethod.PUT, "/api/patients/{id}").hasAnyAuthority("ROLE_PATIENT", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/patients/{id}").hasAuthority("ROLE_ADMIN")
                
                // DOCTOR ENDPOINTS - FIXED
                .requestMatchers("/api/doctors/my-profile").hasAuthority("ROLE_DOCTOR")
                .requestMatchers("/api/doctors/me").hasAuthority("ROLE_DOCTOR")
                .requestMatchers("/api/doctors/profiles").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/doctors/dashboard/my-stats").hasAuthority("ROLE_DOCTOR")
                .requestMatchers("/api/doctors/dashboard/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/doctors/*/availability").hasAnyAuthority("ROLE_PATIENT", "ROLE_DOCTOR", "ROLE_ADMIN")
                .requestMatchers("/api/doctors/*/appointments/**").hasAuthority("ROLE_DOCTOR")
                .requestMatchers("/api/doctors/docdelete/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/doctors").hasAnyAuthority("ROLE_PATIENT", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/doctors").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/doctors/{id}").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/doctors/{id}").hasAuthority("ROLE_ADMIN")
                
                // PROFILE MANAGEMENT
                .requestMatchers("/api/profile/**").authenticated()
                
                // DASHBOARD ENDPOINTS
                .requestMatchers("/api/appointments/dashboard/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/patients/dashboard/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/doctors/dashboard/**").hasAuthority("ROLE_ADMIN")
                
                // CATCH-ALL
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write(
                        "{\"error\":\"Unauthorized\",\"message\":\"Full authentication is required to access this resource\"," +
                        "\"status\":401,\"path\":\"" + request.getRequestURI() + "\"," +
                        "\"method\":\"" + request.getMethod() + "\",\"timestamp\":\"" + System.currentTimeMillis() + "\"}"
                    );
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType("application/json");
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write(
                        "{\"error\":\"Access Denied\",\"message\":\"Insufficient permissions for this resource\"," +
                        "\"status\":403,\"path\":\"" + request.getRequestURI() + "\"," +
                        "\"method\":\"" + request.getMethod() + "\",\"timestamp\":\"" + System.currentTimeMillis() + "\"}"
                    );
                })
            )
            .authenticationProvider(authProvider());

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000", 
            "http://localhost:3001", 
            "http://localhost:8081",
            "http://127.0.0.1:3000"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public DaoAuthenticationProvider authProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}