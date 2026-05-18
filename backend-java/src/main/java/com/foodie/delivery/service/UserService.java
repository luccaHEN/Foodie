package com.foodie.delivery.service;

import com.foodie.delivery.domain.entity.User;
import com.foodie.delivery.domain.enums.Role;
import com.foodie.delivery.dto.UserDto;
import com.foodie.delivery.repository.UserRepository;
import com.foodie.delivery.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public User register(UserDto.Create data) {
        if (userRepository.findByEmail(data.getEmail()).isPresent()) {
            throw new IllegalArgumentException("E-mail já cadastrado.");
        }

        User user = User.builder()
                .name(data.getName())
                .email(data.getEmail())
                .password(passwordEncoder.encode(data.getPassword()))
                .role(data.getRole() != null ? data.getRole() : Role.CUSTOMER)
                .build();

        return userRepository.save(user);
    }

    public Map<String, Object> login(UserDto.Login data) {
        User user = userRepository.findByEmail(data.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas."));

        if (!passwordEncoder.matches(data.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Credenciais inválidas.");
        }

        String token = jwtUtil.generateToken(user.getId().toString(), user.getRole().name());
        user.setPassword(null); // Esconde a senha no retorno

        return Map.of("user", user, "token", token);
    }

    public User updateProfile(UUID userId, UserDto.UpdateProfile data) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        if (data.getName() != null && !data.getName().isBlank()) user.setName(data.getName());
        if (data.getAddress() != null && !data.getAddress().isBlank()) user.setAddress(data.getAddress());
        if (data.getPhone() != null && !data.getPhone().isBlank()) user.setPhone(data.getPhone());

        User updatedUser = userRepository.save(user);
        updatedUser.setPassword(null);
        
        return updatedUser;
    }
}