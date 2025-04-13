package io.akitect.cms.dto;

import java.util.Set;
import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserCreateDTO {

    @NotBlank
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank
    @Email
    private String email;

    @Size(min = 6, max = 100)
    private String password;

    @NotBlank
    @Size(max = 100)
    private String fullName;

    private Set<UUID> roleIds; // Added field for role IDs

    // Getters and Setters

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Set<UUID> getRoleIds() {
        return roleIds;
    }

    public void setRoleIds(Set<UUID> roleIds) {
        this.roleIds = roleIds;
    }
}