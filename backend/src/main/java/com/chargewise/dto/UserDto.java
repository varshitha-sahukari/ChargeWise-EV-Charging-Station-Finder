package com.chargewise.dto;

import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String email;
    private String username;
    private String role;
    private String profilePicture;
    private boolean emailVerified;
}
