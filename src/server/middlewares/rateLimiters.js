import rateLimit from "express-rate-limit";

const TOO_MANY_REQUESTS = { error: "Too many requests. Please try again later." };

export function createRateLimiter({ windowMs, limit, message = TOO_MANY_REQUESTS }) {
    return rateLimit({
        windowMs,
        limit,
        standardHeaders: true,
        legacyHeaders: false,
        message,
    });
}

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export const apiLimiter = createRateLimiter({
    windowMs: FIFTEEN_MINUTES,
    limit: 1000,
});

export const loginLimiter = createRateLimiter({
    windowMs: FIFTEEN_MINUTES,
    limit: 10,
});

export const announcementReadLimiter = createRateLimiter({
    windowMs: FIFTEEN_MINUTES,
    limit: 200,
});

export const announcementPublishLimiter = createRateLimiter({
    windowMs: FIFTEEN_MINUTES,
    limit: 5,
});

export const announcementMutationLimiter = createRateLimiter({
    windowMs: FIFTEEN_MINUTES,
    limit: 30,
});

export const emailLimiter = createRateLimiter({
    windowMs: FIFTEEN_MINUTES,
    limit: 5,
});

export const sessionRequestLimiter = createRateLimiter({
    windowMs: FIFTEEN_MINUTES,
    limit: 5,
});

export const sessionCompletionLimiter = createRateLimiter({
    windowMs: FIFTEEN_MINUTES,
    limit: 5,
});

export const sessionCancellationLimiter = createRateLimiter({
    windowMs: FIFTEEN_MINUTES,
    limit: 15,
});

export const sessionDeclineJustificationLimiter = createRateLimiter({
    windowMs: FIFTEEN_MINUTES,
    limit: 15,
});
