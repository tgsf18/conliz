package com.conliz.platform.config;

import com.conliz.platform.domain.Role;
import com.conliz.platform.domain.User;
import com.conliz.platform.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class InitialAdminConfig implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(InitialAdminConfig.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${conliz.admin.email:admin@conliz.com.br}")
    private String adminEmail;

    @Value("${conliz.admin.password:ConlizAdmin2026!#Segura}")
    private String adminPassword;

    @Value("${conliz.admin.name:Diretoria Conliz}")
    private String adminName;

    public InitialAdminConfig(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Initial ADMIN User
        if (!userRepository.existsByEmail(adminEmail.toLowerCase().trim())) {
            User admin = new User(
                    adminName,
                    adminEmail.toLowerCase().trim(),
                    passwordEncoder.encode(adminPassword),
                    Role.ADMIN
            );
            userRepository.save(admin);
            log.info("Initial ADMIN user provisioned: email={}", adminEmail);
        }

        // 2. Provision department users for role testing if they don't exist
        provisionRoleUserIfNotExists("RH Conliz", "rh@conliz.com.br", adminPassword, Role.RH);
        provisionRoleUserIfNotExists("Comercial Conliz", "comercial@conliz.com.br", adminPassword, Role.COMERCIAL);
        provisionRoleUserIfNotExists("Engenharia Conliz", "engenharia@conliz.com.br", adminPassword, Role.ENGENHARIA);
    }

    private void provisionRoleUserIfNotExists(String name, String email, String password, Role role) {
        if (!userRepository.existsByEmail(email.toLowerCase().trim())) {
            User user = new User(
                    name,
                    email.toLowerCase().trim(),
                    passwordEncoder.encode(password),
                    role
            );
            userRepository.save(user);
            log.info("Role user provisioned: email={} role={}", email, role);
        }
    }
}
