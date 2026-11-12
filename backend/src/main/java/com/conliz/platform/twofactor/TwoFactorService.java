package com.conliz.platform.twofactor;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.apache.commons.codec.binary.Base32;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;

@Service
public class TwoFactorService {

    private static final int TIME_STEP_SECONDS = 30;
    private static final int CODE_DIGITS = 6;
    private static final int WINDOW_SIZE = 1; // +/- 1 time step drift tolerance

    private final String issuer;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Base32 base32 = new Base32();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TwoFactorService(@Value("${conliz.totp.issuer:Conliz Construtora}") String issuer) {
        this.issuer = issuer;
    }

    public record TwoFactorSetupData(String secret, String otpauthUrl, String qrCodeBase64, List<String> recoveryCodes) {}

    public String generateSecret() {
        byte[] buffer = new byte[20];
        secureRandom.nextBytes(buffer);
        return base32.encodeToString(buffer).replace("=", "");
    }

    public List<String> generateRecoveryCodes() {
        List<String> codes = new ArrayList<>(8);
        for (int i = 0; i < 8; i++) {
            byte[] bytes = new byte[5];
            secureRandom.nextBytes(bytes);
            String raw = HexFormat.of().formatHex(bytes).toUpperCase();
            codes.add(raw.substring(0, 4) + "-" + raw.substring(4, 8));
        }
        return codes;
    }

    public String hashRecoveryCode(String code) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(code.trim().toUpperCase().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new IllegalStateException("Error hashing recovery code", e);
        }
    }

    public String serializeRecoveryCodesHashes(List<String> rawCodes) {
        try {
            List<String> hashes = rawCodes.stream()
                    .map(this::hashRecoveryCode)
                    .toList();
            return objectMapper.writeValueAsString(hashes);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialize recovery codes", e);
        }
    }

    public boolean consumeRecoveryCode(String storedJson, String inputCode, List<String> updatedHashesContainer) {
        if (storedJson == null || storedJson.isBlank()) {
            return false;
        }
        try {
            List<String> hashes = objectMapper.readValue(storedJson, new TypeReference<List<String>>() {});
            String targetHash = hashRecoveryCode(inputCode);
            if (hashes.contains(targetHash)) {
                List<String> remaining = new ArrayList<>(hashes);
                remaining.remove(targetHash);
                updatedHashesContainer.addAll(remaining);
                return true;
            }
        } catch (Exception ignored) {
        }
        return false;
    }

    public TwoFactorSetupData initSetup(String userEmail) {
        String secret = generateSecret();
        List<String> recoveryCodes = generateRecoveryCodes();
        String encodedIssuer = URLEncoder.encode(issuer, StandardCharsets.UTF_8).replace("+", "%20");
        String encodedEmail = URLEncoder.encode(userEmail, StandardCharsets.UTF_8).replace("+", "%20");
        String otpauthUrl = String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30",
                encodedIssuer, encodedEmail, secret, encodedIssuer);

        String qrCodeBase64 = generateQrCodeBase64(otpauthUrl);
        return new TwoFactorSetupData(secret, otpauthUrl, qrCodeBase64, recoveryCodes);
    }

    public String generateQrCodeBase64(String content) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, 240, 240);
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate QR code", e);
        }
    }

    public boolean verifyTotp(String secret, String inputCode) {
        if (secret == null || inputCode == null || inputCode.trim().length() != CODE_DIGITS) {
            return false;
        }
        try {
            int code = Integer.parseInt(inputCode.trim());
            long currentStep = Instant.now().getEpochSecond() / TIME_STEP_SECONDS;

            for (int i = -WINDOW_SIZE; i <= WINDOW_SIZE; i++) {
                if (generateCodeForStep(secret, currentStep + i) == code) {
                    return true;
                }
            }
        } catch (NumberFormatException ignored) {
        }
        return false;
    }

    private int generateCodeForStep(String secret, long step) {
        try {
            byte[] key = base32.decode(secret);
            byte[] data = ByteBuffer.allocate(8).putLong(step).array();

            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            byte[] hash = mac.doFinal(data);

            int offset = hash[hash.length - 1] & 0xF;
            int binary = ((hash[offset] & 0x7F) << 24)
                    | ((hash[offset + 1] & 0xFF) << 16)
                    | ((hash[offset + 2] & 0xFF) << 8)
                    | (hash[offset + 3] & 0xFF);

            return binary % (int) Math.pow(10, CODE_DIGITS);
        } catch (Exception e) {
            return -1;
        }
    }
}
