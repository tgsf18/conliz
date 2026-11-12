package com.conliz.platform.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private final long loginCapacity;
    private final long loginRefillMinutes;
    private final long ipCapacity;
    private final long ipRefillMinutes;

    private final Map<String, Bucket> loginAttemptBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> generalIpBuckets = new ConcurrentHashMap<>();

    public RateLimitService(
            @Value("${conliz.rate-limit.login-capacity:5}") long loginCapacity,
            @Value("${conliz.rate-limit.login-refill-minutes:1}") long loginRefillMinutes,
            @Value("${conliz.rate-limit.ip-capacity:60}") long ipCapacity,
            @Value("${conliz.rate-limit.ip-refill-minutes:1}") long ipRefillMinutes) {
        this.loginCapacity = loginCapacity;
        this.loginRefillMinutes = loginRefillMinutes;
        this.ipCapacity = ipCapacity;
        this.ipRefillMinutes = ipRefillMinutes;
    }

    public boolean tryConsumeLoginAttempt(String key) {
        Bucket bucket = loginAttemptBuckets.computeIfAbsent(key, k -> createLoginBucket());
        return bucket.tryConsume(1);
    }

    public boolean tryConsumeIpRequest(String clientIp) {
        Bucket bucket = generalIpBuckets.computeIfAbsent(clientIp, k -> createIpBucket());
        return bucket.tryConsume(1);
    }

    public void clearAll() {
        loginAttemptBuckets.clear();
        generalIpBuckets.clear();
    }

    private Bucket createLoginBucket() {
        Bandwidth limit = Bandwidth.classic(
                loginCapacity,
                Refill.greedy(loginCapacity, Duration.ofMinutes(loginRefillMinutes))
        );
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket createIpBucket() {
        Bandwidth limit = Bandwidth.classic(
                ipCapacity,
                Refill.greedy(ipCapacity, Duration.ofMinutes(ipRefillMinutes))
        );
        return Bucket.builder().addLimit(limit).build();
    }
}
