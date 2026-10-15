// @vitest-environment node
import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createRateLimiter } from "../rateLimiters.js";

function createApp() {
    const app = express();
    const readLimiter = createRateLimiter({ windowMs: 60_000, limit: 2 });
    const writeLimiter = createRateLimiter({ windowMs: 60_000, limit: 1 });

    app.get("/announcements", readLimiter, (_req, res) => res.sendStatus(200));
    app.post("/announcements", writeLimiter, (_req, res) => res.sendStatus(201));
    return app;
}

describe("rate limiters", () => {
    it("allows requests through the configured limit and rejects the next request", async () => {
        const app = createApp();

        await request(app).get("/announcements").expect(200);
        await request(app).get("/announcements").expect(200);
        const response = await request(app).get("/announcements").expect(429);

        expect(response.body).toEqual({ error: "Too many requests. Please try again later." });
        expect(response.headers["retry-after"]).toBeDefined();
        expect(response.headers["ratelimit-policy"]).toBeDefined();
    });

    it("keeps independently configured endpoint limits separate", async () => {
        const app = createApp();

        await request(app).get("/announcements").expect(200);
        await request(app).get("/announcements").expect(200);
        await request(app).post("/announcements").expect(201);
        await request(app).post("/announcements").expect(429);
    });
});
