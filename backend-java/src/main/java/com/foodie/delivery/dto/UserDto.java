package com.foodie.delivery.dto;

import com.foodie.delivery.domain.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class UserDto {

    @Data
    public static class Create {
        @NotBlank(message = "O nome deve ter no mínimo 2 caracteres.")
        @Size(min = 2)
        private String name;

        @Email(message = "Forneça um e-mail válido.")
        private String email;

        @NotBlank(message = "A senha deve ter no mínimo 6 caracteres.")
        @Size(min = 6)
        private String password;

        private Role role;
    }

    @Data
    public static class Login {
        @Email(message = "Forneça um e-mail válido.")
        private String email;

        @NotBlank(message = "A senha é obrigatória.")
        private String password;
    }

    @Data
    public static class UpdateProfile {
        private String name;
        private String address;
        private String phone;
    }
}