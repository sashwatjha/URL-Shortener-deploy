package com.sashwatjha.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@RestController
public class Controller {

    private final Map<String, String> urlStore = new HashMap<>();
    private final Random random = new Random();
    private static final String CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    @Value("${app.base-url:}")
    private String configuredBaseUrl;

    @RequestMapping("/api/name")
    public String backend() {
        System.out.println("Backend is working");
        return "URL Shortener";
    }

    @PostMapping("/api/shorten")
    public Map<String, String> shorten(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String longUrl = body.get("url");
        if (longUrl == null || longUrl.isBlank()) {
            throw new IllegalArgumentException("URL is required");
        }

        String code = generateCode(6);
        urlStore.put(code, longUrl);

        // Build base URL dynamically: use configured value or derive from request
        String baseUrl = (configuredBaseUrl != null && !configuredBaseUrl.isBlank())
                ? configuredBaseUrl
                : request.getScheme() + "://" + request.getServerName()
                  + (request.getServerPort() != 80 && request.getServerPort() != 443
                     ? ":" + request.getServerPort() : "");

        Map<String, String> response = new HashMap<>();
        response.put("code", code);
        response.put("shortUrl", baseUrl + "/api/r/" + code);
        response.put("originalUrl", longUrl);
        return response;
    }

    @GetMapping("/api/r/{code}")
    public ResponseEntity<Void> redirect(@PathVariable String code) {
        String longUrl = urlStore.get(code);
        if (longUrl == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(longUrl)).build();
    }

    @GetMapping("/api/urls")
    public Map<String, String> getAllUrls() {
        return urlStore;
    }

    private String generateCode(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        return sb.toString();
    }
}
