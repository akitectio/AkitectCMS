package io.akitect.cms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private UUID id;
    private String username;
    private String email;
    private String fullName;
    private String avatarUrl;
    private boolean superAdmin;
    private List<String> roles;

    public JwtResponse(String token, UUID id, String username, String email,
                       String fullName, String avatarUrl, boolean superAdmin, List<String> roles) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.superAdmin = superAdmin;
        this.roles = roles;
    }
}