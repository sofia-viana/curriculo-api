import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const resultado = await pool.query("SELECT * FROM habilidades ORDER BY id");
  res.status(200).send(resultado.rows);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const resultado = await pool.query("SELECT * FROM habilidades WHERE id = $1", [id]);
  if (resultado.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Habilidade não encontrada" });
  }
  res.status(200).send(resultado.rows[0]);
});

router.post("/", async (req, res) => {
  const { nome, categoria } = req.body || {};

  if (!nome) {
    return res.status(400).send({ status: "fail", message: "Campo obrigatório: nome" });
  }

  const resultado = await pool.query(
    "INSERT INTO habilidades (nome, categoria) VALUES ($1, $2) RETURNING *",
    [nome, categoria]
  );
  res.status(201).send(resultado.rows[0]);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, categoria } = req.body || {};

  const resultado = await pool.query(
    `UPDATE habilidades SET
       nome = COALESCE($1, nome),
       categoria = COALESCE($2, categoria)
     WHERE id = $3 RETURNING *`,
    [nome, categoria, id]
  );
  if (resultado.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Habilidade não encontrada" });
  }
  res.status(200).send(resultado.rows[0]);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const resultado = await pool.query("DELETE FROM habilidades WHERE id = $1 RETURNING *", [id]);
  if (resultado.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Habilidade não encontrada" });
  }
  res.status(200).send({ message: "Habilidade removida com sucesso", removido: resultado.rows[0] });
});

export default router;