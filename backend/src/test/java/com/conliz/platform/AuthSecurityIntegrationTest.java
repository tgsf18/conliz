package com.conliz.platform;

import com.conliz.platform.auth.CookieService;
import com.conliz.platform.domain.Role;
import com.conliz.platform.domain.User;
import com.conliz.platform.dto.LoginRequest;
import com.conliz.platform.dto.TwoFactorVerifyRequest;
import com.conliz.platform.repository.RefreshTokenRepository;
import com.conliz.platform.repository.UserRepository;
import com.conliz.platform.twofactor.TwoFactorService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TwoFactorService twoFactorService;

    @Autowired
    private com.conliz.platform.ratelimit.RateLimitService rateLimitService;

    @Autowired
    private ObjectMapper objectMapper;

    private final String rawPassword = "ConlizAdmin2026!#Segura";

    @BeforeEach
    void setup() {
        rateLimitService.clearAll();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();

        // Seed test admin
        User admin = new User("Admin Test", "admin@conliz.com.br", passwordEncoder.encode(rawPassword), Role.ADMIN);
        userRepository.save(admin);

        // Seed test rh
        User rh = new User("RH Test", "rh@conliz.com.br", passwordEncoder.encode(rawPassword), Role.RH);
        userRepository.save(rh);

        // Seed test engenharia
        User eng = new User("Eng Test", "eng@conliz.com.br", passwordEncoder.encode(rawPassword), Role.ENGENHARIA);
        userRepository.save(eng);
    }

    @Test
    @DisplayName("Login com credenciais válidas deve emitir cookies HttpOnly de Access e Refresh Token")
    void testLoginSuccessIssuesHttpOnlyCookies() throws Exception {
        LoginRequest req = new LoginRequest("admin@conliz.com.br", rawPassword);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists(CookieService.ACCESS_COOKIE_NAME))
                .andExpect(cookie().exists(CookieService.REFRESH_COOKIE_NAME))
                .andExpect(cookie().httpOnly(CookieService.ACCESS_COOKIE_NAME, true))
                .andExpect(cookie().httpOnly(CookieService.REFRESH_COOKIE_NAME, true))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.requires2fa").value(false))
                .andExpect(jsonPath("$.user.email").value("admin@conliz.com.br"))
                .andReturn();

        Cookie accessCookie = result.getResponse().getCookie(CookieService.ACCESS_COOKIE_NAME);
        assertThat(accessCookie).isNotNull();
        assertThat(accessCookie.getValue()).isNotBlank();
    }

    @Test
    @DisplayName("Login com credenciais inválidas deve retornar 401 com mensagem genérica")
    void testLoginInvalidCredentials() throws Exception {
        LoginRequest req = new LoginRequest("admin@conliz.com.br", "SenhaErrada123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Credenciais inválidas."));
    }

    @Test
    @DisplayName("Anti Força Bruta: 5 tentativas falhas consecutivas devem bloquear a conta temporariamente")
    void testAccountLockoutAfterFiveFailedAttempts() throws Exception {
        LoginRequest req = new LoginRequest("admin@conliz.com.br", "SenhaErrada123!");

        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isUnauthorized());
        }

        // 6th attempt should be blocked by account lockout
        User user = userRepository.findByEmail("admin@conliz.com.br").orElseThrow();
        assertThat(user.isLockedOut()).isTrue();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("admin@conliz.com.br", rawPassword))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("temporariamente bloqueada")));
    }

    @Test
    @DisplayName("2FA TOTP: Usuário com 2FA ativado deve exigir pre-auth e código TOTP ou recuperação")
    void testTwoFactorTotpWorkflow() throws Exception {
        User user = userRepository.findByEmail("admin@conliz.com.br").orElseThrow();
        String secret = twoFactorService.generateSecret();
        List<String> recoveryCodes = twoFactorService.generateRecoveryCodes();
        user.setTwoFactorEnabled(true);
        user.setTwoFactorSecret(secret);
        user.setRecoveryCodes(twoFactorService.serializeRecoveryCodesHashes(recoveryCodes));
        userRepository.save(user);

        // Step 1: Login should return requires2fa = true with preAuthToken
        LoginRequest req = new LoginRequest("admin@conliz.com.br", rawPassword);
        MvcResult step1Result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requires2fa").value(true))
                .andExpect(jsonPath("$.preAuthToken").isNotEmpty())
                .andReturn();

        JsonNode step1Json = objectMapper.readTree(step1Result.getResponse().getContentAsString());
        String preAuthToken = step1Json.get("preAuthToken").asText();

        // Step 2: Invalid code fails
        TwoFactorVerifyRequest invalidReq = new TwoFactorVerifyRequest(preAuthToken, "000000");
        mockMvc.perform(post("/api/auth/2fa/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isUnauthorized());

        // Step 3: Valid recovery code succeeds and issues HttpOnly cookies
        String recoveryCode = recoveryCodes.get(0);
        TwoFactorVerifyRequest recoveryReq = new TwoFactorVerifyRequest(preAuthToken, recoveryCode);
        mockMvc.perform(post("/api/auth/2fa/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(recoveryReq)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists(CookieService.ACCESS_COOKIE_NAME))
                .andExpect(cookie().exists(CookieService.REFRESH_COOKIE_NAME))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.user.email").value("admin@conliz.com.br"));

        // Step 4: Used recovery code cannot be reused
        MvcResult step1Again = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();
        String preAuthToken2 = objectMapper.readTree(step1Again.getResponse().getContentAsString()).get("preAuthToken").asText();

        mockMvc.perform(post("/api/auth/2fa/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TwoFactorVerifyRequest(preAuthToken2, recoveryCode))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Rotação de Refresh Token: Chamada ao /refresh emite novo access e refresh token")
    void testRefreshTokenRotation() throws Exception {
        LoginRequest req = new LoginRequest("admin@conliz.com.br", rawPassword);
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        Cookie refreshCookie = loginResult.getResponse().getCookie(CookieService.REFRESH_COOKIE_NAME);
        assertThat(refreshCookie).isNotNull();

        // Refresh request with cookie
        MvcResult refreshResult = mockMvc.perform(post("/api/auth/refresh")
                        .cookie(refreshCookie))
                .andExpect(status().isOk())
                .andExpect(cookie().exists(CookieService.ACCESS_COOKIE_NAME))
                .andExpect(cookie().exists(CookieService.REFRESH_COOKIE_NAME))
                .andReturn();

        Cookie newRefreshCookie = refreshResult.getResponse().getCookie(CookieService.REFRESH_COOKIE_NAME);
        assertThat(newRefreshCookie).isNotNull();
        assertThat(newRefreshCookie.getValue()).isNotEqualTo(refreshCookie.getValue());

        // Attempting to reuse the old refresh token must fail
        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(refreshCookie))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("RBAC: @PreAuthorize bloqueia rotas administrativas para perfis sem permissão")
    void testRbacPreAuthorizeRestrictions() throws Exception {
        // 1. Anonymous calling admin route -> 401
        mockMvc.perform(get("/api/admin/overview"))
                .andExpect(status().isUnauthorized());

        // 2. Login as ENGENHARIA
        LoginRequest engReq = new LoginRequest("eng@conliz.com.br", rawPassword);
        MvcResult engLogin = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(engReq)))
                .andExpect(status().isOk())
                .andReturn();

        Cookie engAccess = engLogin.getResponse().getCookie(CookieService.ACCESS_COOKIE_NAME);

        // ENGENHARIA can access overview
        mockMvc.perform(get("/api/admin/overview").cookie(engAccess))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ENGENHARIA"));

        // ENGENHARIA can access engenhariaOnly
        mockMvc.perform(get("/api/admin/engenharia/check").cookie(engAccess))
                .andExpect(status().isOk());

        // ENGENHARIA cannot access rhOnly -> 403 Forbidden
        mockMvc.perform(get("/api/admin/rh/check").cookie(engAccess))
                .andExpect(status().isForbidden());

        // ENGENHARIA cannot access root admin -> 403 Forbidden
        mockMvc.perform(get("/api/admin/root/check").cookie(engAccess))
                .andExpect(status().isForbidden());

        // 3. Login as ADMIN
        LoginRequest adminReq = new LoginRequest("admin@conliz.com.br", rawPassword);
        MvcResult adminLogin = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminReq)))
                .andExpect(status().isOk())
                .andReturn();

        Cookie adminAccess = adminLogin.getResponse().getCookie(CookieService.ACCESS_COOKIE_NAME);

        // ADMIN can access all endpoints
        mockMvc.perform(get("/api/admin/overview").cookie(adminAccess)).andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/rh/check").cookie(adminAccess)).andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/engenharia/check").cookie(adminAccess)).andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/root/check").cookie(adminAccess)).andExpect(status().isOk());
    }
}
