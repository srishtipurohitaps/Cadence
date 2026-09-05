import express from "express";
import path from "path";
import db from "./database";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/static", express.static(path.join(process.cwd(), "static")));

app.get("/", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "pages", "index.html"));
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
    const { title, type, genre, rating } = req.body;

    if (!title || !type) {
        res.status(400).json({
            error: "Title and type are required"
        });
        return;
    }

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
        run(
            title.trim(),
            type,
            genre?.trim() || null,
            Number(rating) || 0,
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
    const rating = Number(req.body.rating);

    if (!Number.isInteger(id) || rating < 0 || rating > 5) {
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