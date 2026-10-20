const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get("/api/hello", (req, res) => res.json({ message: "Hallo vom Backend!" }));

app.listen(port, () => console.log(`Backend läuft auf Port ${port}`));
