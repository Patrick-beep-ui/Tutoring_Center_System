// @vitest-environment node
import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

const calendarControllers = vi.hoisted(() => ({
    getSessionsByTutor: vi.fn(),
    createSession: vi.fn((_req, res) => res.sendStatus(201)),
    acceptSession: vi.fn(),
    declineSession: vi.fn(),
    sendDeclineJustification: vi.fn((_req, res) => res.sendStatus(200)),
}));

const sessionControllers = vi.hoisted(() => ({
    getSessions: vi.fn(),
    getSessionsByTutor: vi.fn(),
    getSessionsByTutorCourse: vi.fn(),
    getTutorSessionById: vi.fn(),
    getSessionDetails: vi.fn(),
    getScheduledSessionsCount: vi.fn(),
    getScheduledSessionsItems: vi.fn(),
    addSession: vi.fn(),
    editSession: vi.fn((_req, res) => res.sendStatus(200)),
    cancelSession: vi.fn((_req, res) => res.sendStatus(201)),
    deleteSession: vi.fn(),
}));

vi.mock("../../controllers/calendarSessionsController.js", () => calendarControllers);
vi.mock("../../controllers/sessionsController.js", () => sessionControllers);

import CalendarSessionsRouter from "../calendarSessionsRoutes.js";
import SessionsRouter from "../sessionRoutes.js";

function createApp() {
    const app = express();
    app.use("/calendar-session", CalendarSessionsRouter);
    app.use("/sessions", SessionsRouter);
    return app;
}

async function exhaust(send, allowed, expectedStatus) {
    for (let requestNumber = 0; requestNumber < allowed; requestNumber += 1) {
        await send().expect(expectedStatus);
    }
    const response = await send().expect(429);
    expect(response.body).toEqual({ error: "Too many requests. Please try again later." });
}

describe("email-triggering route limits", () => {
    it("limits session requests separately from decline justification emails", async () => {
        const app = createApp();

        await exhaust(() => request(app).post("/calendar-session/1"), 5, 201);
        await exhaust(() => request(app).post("/calendar-session/decline/justification/1"), 15, 200);
    });

    it("limits session completion and cancellation emails independently", async () => {
        const app = createApp();

        await exhaust(() => request(app).put("/sessions/session/1"), 5, 200);
        await exhaust(() => request(app).patch("/sessions/session/1"), 15, 201);
    });
});
