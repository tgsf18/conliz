package com.conliz.platform.dto;

import java.util.List;

public record TwoFactorSetupResponse(
        String secret,
        String otpauthUrl,
        String qrCodeBase64,
        List<String> recoveryCodes
) {}
