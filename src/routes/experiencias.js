import {Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/experiencias", async (req, res) => {
  const resultado = await pool.query("SELECT * FROM experiencias ORDER BY id");
  res.status(200).send(resultado.rows);
});

router.get("/pessoas/:pessoaId/experiencias", async (req, res) => {
  const { pessoaId } = req.params;
  const resultado = await pool.query("SELECT * FROM experiencias WHERE pessoa_id = $1 ORDER BY id", [pessoaId]);
  res.status(200).send(resultado.rows);
});

router.get("/experiencias/:id", async (req, res) => {
  const { id } = req.params;
  const resultado = await pool.query("SELECT * FROM experiencias WHERE id = $1", [id]);
  if (resultado.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Experiência não encontrada" });
  }
  res.status(200).send(resultado.rows[0]);
});

router.post("/pessoas/:pessoaId/experiencias", async (req, res) => {
  const { pessoaId } = req.params;
  const { empresa, cargo, data_inicio, data_fim, atual, descricao } = req.body || {};

  if (!empresa || !cargo || !data_inicio) {
    return res.status(400).send({ status: "fail", message: "Campos obrigatórios: empresa, cargo e data_inicio" });
  }

  const resultado = await pool.query(
    `INSERT INTO experiencias (pessoa_id, empresa, cargo, data_inicio, data_fim, atual, descricao)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [pessoaId, empresa, cargo, data_inicio, data_fim, atual || false, descricao]
  );
  res.status(201).send(resultado.rows[0]);
});

router.put("/experiencias/:id", async (req, res) => {
  const { id } = req.params;
  const { empresa, cargo, data_inicio, data_fim, atual, descricao } = req.body || {};

  const resultado = await pool.query(
    `UPDATE experiencias SET
       empresa = COALESCE($1, empresa),
       cargo = COALESCE($2, cargo),
       data_inicio = COALESCE($3, data_inicio),
       data_fim = COALESCE($4, data_fim),
       atual = COALESCE($5, atual),
       descricao = COALESCE($6, descricao)
     WHERE id = $7 RETURNING *`,
    [empresa, cargo, data_inicio, data_fim, atual, descricao, id]
  );
  if (resultado.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Experiência não encontrada" });
  }
  res.status(200).send(resultado.rows[0]);
});

router.delete("/experiencias/:id", async (req, res) => {
  const { id } = req.params;
  const resultado = await pool.query("DELETE FROM experiencias WHERE id = $1 RETURNING *", [id]);
  if (resultado.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Experiência não encontrada" });
  }
  res.status(200).send({ message: "Experiência removida com sucesso", removido: resultado.rows[0] });
});

export default router;