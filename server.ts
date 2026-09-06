import express from "express";
import path from "path";
import fs from "fs";
import db from "./database.js";

const app = express();
const PORT = 3000;

app.use(express.json());

const sourceStaticDirectory = path.join(process.cwd(), "static");
const compiledStaticDirectory = path.join(process.cwd(), "dist", "static");

app.use("/static", express.static(sourceStaticDirectory));

if (fs.existsSync(compiledStaticDirectory)) {
    app.use("/static", express.static(compiledStaticDirectory));
}

app.get("/", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "pages", "index.html"));
});

app.get("/about", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "pages", "about.html"));
});

app.get("/api/media", (_req, res) => {
    const media = db
        .prepare(`
            SELECT *
            FROM media
            ORDER BY finished_at DESC, id DESC
        `)
        .all();

    res.json(media);
});

app.post("/api/media", (req, res) => {
    const body = req.body;
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const type = typeof body?.type === "string" ? body.type.trim() : "";
    const genre = typeof body?.genre === "string" ? body.genre.trim() : null;
    const rating = Number(body?.rating ?? 0);

    if (!title || !type) {
        res.status(400).json({
            error: "Title and type are required"
        });
        return;
    }

    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
        res.status(400).json({
            error: "Rating must be an integer from 0 to 5"
        });
        return;
    }

    const now = new Date().toISOString();

    const result = db
        .prepare(`
            INSERT INTO media (
                title,
                type,
                genre,
                rating,
                finished_at,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `)
        .run(
            title,
            type,
            genre || null,
            rating,
            now,
            now
        );

    const media = db
        .prepare("SELECT * FROM media WHERE id = ?")
        .get(result.lastInsertRowid);

    res.status(201).json(media);
});

app.delete("/api/media/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        res.status(400).json({
            error: "Invalid media ID"
        });
        return;
    }

    const result = db
        .prepare("DELETE FROM media WHERE id = ?")
        .run(id);

    if (result.changes === 0) {
        res.status(404).json({
            error: "Media not found"
        });
        return;
    }

    res.json({
        success: true
    });
});

app.patch("/api/media/:id/rating", (req, res) => {
    const id = Number(req.params.id);
    const rating = Number(req.body?.rating);

    if (
        !Number.isInteger(id) ||
        !Number.isInteger(rating) ||
        rating < 0 ||
        rating > 5
    ) {
        res.status(400).json({
            error: "Invalid rating"
        });
        return;
    }

    const result = db
        .prepare(`
            UPDATE media
            SET rating = ?
            WHERE id = ?
        `)
        .run(rating, id);

    if (result.changes === 0) {
        res.status(404).json({
            error: "Media not found"
        });
        return;
    }

    const media = db
        .prepare("SELECT * FROM media WHERE id = ?")
        .get(id);

    res.json(media);
});

app.listen(PORT, () => {
    console.log(`Cadence running at http://localhost:${PORT}`);
});