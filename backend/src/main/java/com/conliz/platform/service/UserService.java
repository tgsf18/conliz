package com.conliz.platform.service;

import com.conliz.platform.domain.Role;
import com.conliz.platform.domain.User;
import com.conliz.platform.repository.UserRepository;
import com.conliz.platform.twofactor.TwoFactorService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final TwoFactorService twoFactorService;
    private final int lockoutAttempts;
    private final int lockoutMinutes;

    public UserService(
            UserRepository userRepository,
            TwoFactorService twoFactorService,
            @Value("${conliz.rate-limit.lockout-attempts:5}") int lockoutAttempts,
            @Value("${conliz.rate-limit.lockout-minutes:15}") int lockoutMinutes) {
        this.userRepository = userRepository;
        this.twoFactorService = twoFactorService;
        this.lockoutAttempts = lockoutAttempts;
        this.lockoutMinutes = lockoutMinutes;
    }

    public Optional<User> findByEmail(String email) {
        if (email == null) return Optional.empty();
        return userRepository.findByEmail(email.trim().toLowerCase());
    }

    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Transactional
    public void registerFailedLogin(User user) {
        int attempts = user.getFailedAttempts() + 1;
        user.setFailedAttempts(attempts);
        if (attempts >= lockoutAttempts) {
            user.setLockoutUntil(LocalDateTime.now().plusMinutes(lockoutMinutes));
        }
        userRepository.save(user);
    }

    @Transactional
    public void registerSuccessfulLogin(User user) {
        if (user.getFailedAttempts() > 0 || user.getLockoutUntil() != null) {
            user.setFailedAttempts(0);
            user.setLockoutUntil(null);
            userRepository.save(user);
        }
    }

    @Transactional
    public void enable2fa(User user, String secret, List<String> recoveryCodes) {
        user.setTwoFactorSecret(secret);
        user.setTwoFactorEnabled(true);
        user.setRecoveryCodes(twoFactorService.serializeRecoveryCodesHashes(recoveryCodes));
        userRepository.save(user);
    }

    @Transactional
    public void disable2fa(User user) {
        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        user.setRecoveryCodes(null);
        userRepository.save(user);
    }

    @Transactional
    public boolean verifyAndConsumeRecoveryCode(User user, String inputCode) {
        List<String> remaining = new ArrayList<>();
        boolean valid = twoFactorService.consumeRecoveryCode(user.getRecoveryCodes(), inputCode, remaining);
        if (valid) {
            user.setRecoveryCodes(twoFactorService.serializeRecoveryCodesHashes(remaining));
            userRepository.save(user);
        }
        return valid;
    }

    @Transactional
    public User createUser(String nome, String email, String senhaHash, Role role) {
        User user = new User(nome, email.trim().toLowerCase(), senhaHash, role);
        return userRepository.save(user);
    }
}
