import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get ("/formacoes", async (req, res) => {
    const resultado = await pool.query("SELECT * FROM formacoes ORDER BY id");
    res.status(200).send(resultado.rows);
});

router.get("/pessoas/:pessoaId/formacoes", async (req, res) => {
    const {pessoaId} = req.params;
    const resultado = await pool.query("SELECT * FROM formacoes WHERE pessoa_id = $1 ORDER BY id", [pessoaId]);
    res.status(200).send(resultado.rows);
});

router.get("/formacoes/:id", async (req, res) => {
  const { id } = req.params;
  const resultado = await pool.query("SELECT * FROM formacoes WHERE id = $1", [id]);
  if (resultado.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Formação não encontrada" });
  }
  res.status(200).send(resultado.rows[0]);
});

router.post("/pessoas/:pessoaId/formacoes", async (req, res) => {
  const { pessoaId } = req.params;
  const { instituicao, curso, grau, data_inicio, data_fim, descricao } = req.body || {};

  if (!instituicao || !curso) {
    return res.status(400).send({ status: "fail", message: "Campos obrigatórios: instituicao e curso" });
  }

  const resultado = await pool.query(
    `INSERT INTO formacoes (pessoa_id, instituicao, curso, grau, data_inicio, data_fim, descricao)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [pessoaId, instituicao, curso, grau, data_inicio, data_fim, descricao]
  );
  res.status(201).send(resultado.rows[0]);
});

router.put("/formacoes/:id", async (req, res) => {
  const { id } = req.params;
  const { instituicao, curso, grau, data_inicio, data_fim, descricao } = req.body || {};

  const resultado = await pool.query(
    `UPDATE formacoes SET
       instituicao = COALESCE($1, instituicao),
       curso = COALESCE($2, curso),
       grau = COALESCE($3, grau),
       data_inicio = COALESCE($4, data_inicio),
       data_fim = COALESCE($5, data_fim),
       descricao = COALESCE($6, descricao)
     WHERE id = $7 RETURNING *`,
    [instituicao, curso, grau, data_inicio, data_fim, descricao, id]
  );
  if (resultado.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Formação não encontrada" });
  }
  res.status(200).send(resultado.rows[0]);
});

router.delete("/formacoes/:id", async (req, res) => {
  const { id } = req.params;
  const resultado = await pool.query("DELETE FROM formacoes WHERE id = $1 RETURNING *", [id]);
  if (resultado.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Formação não encontrada" });
  }
  res.status(200).send({ message: "Formação removida com sucesso", removido: resultado.rows[0] });
});

export default router;