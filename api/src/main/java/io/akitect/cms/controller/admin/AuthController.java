package io.akitect.cms.controller.admin;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.akitect.cms.dto.JwtResponse;
import io.akitect.cms.dto.LoginDTO;
import io.akitect.cms.dto.MessageResponse;
import io.akitect.cms.dto.RegisterDTO;
import io.akitect.cms.service.AuthService;
import io.akitect.cms.util.Constants;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@CrossOrigin
@RequestMapping(Constants.ADMIN_BASE_PATH + "/auth") // Use centralized constant for base path
public class AuthController extends AdminBaseController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginDTO loginDTO, HttpServletRequest request) {
        JwtResponse jwtResponse = authService.login(loginDTO, request);
        return ResponseEntity.ok(jwtResponse);
    }

//    @PostMapping("/logout")
//    public ResponseEntity<?> logoutUser(HttpServletRequest request) {
//        String jwt = parseJwt(request);
//        boolean result = authService.logout(jwt, request);
//
//        if (result) {
//            return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
//        } else {
//            return ResponseEntity.ok(new MessageResponse("No active session found"));
//        }
//    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterDTO registerDTO, HttpServletRequest request) {
        MessageResponse response = authService.register(registerDTO, request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestParam String token) {
        boolean isValid = authService.validateToken(token);
        Map<String, Boolean> response = new HashMap<>();
        response.put("valid", isValid);
        return ResponseEntity.ok(response);
    }

    // Helper method to extract JWT from request
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}