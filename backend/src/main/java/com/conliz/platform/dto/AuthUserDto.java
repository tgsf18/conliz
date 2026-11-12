package com.conliz.platform.dto;

import com.conliz.platform.domain.Role;
import com.conliz.platform.domain.User;

import java.util.UUID;

public record AuthUserDto(
        UUID id,
        String nome,
        String email,
        Role role,
        boolean twoFactorEnabled
) {
    public static AuthUserDto fromEntity(User user) {
        return new AuthUserDto(
                user.getId(),
                user.getNome(),
                user.getEmail(),
                user.getRole(),
                user.isTwoFactorEnabled()
        );
    }
}
