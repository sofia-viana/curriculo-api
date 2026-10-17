import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/projetos", async (req, res) => {
  const resultado = await pool.query("SELECT * FROM projetos ORDER BY id");
  res.status(200).send(resultado.rows);
});

router.get("/pessoas/:pessoaId/projetos", async (req, res) => {
  const { pessoaId } = req.params;
  const resultado = await pool.query("SELECT * FROM projetos WHERE pessoa_id = $1 ORDER BY id", [pessoaId]);
  res.status(200).send(resultado.rows);
});

router.get("/projetos/:id", async (req, res) => {
  const { id } = req.params;
  const resultado = await pool.query("SELECT * FROM projetos WHERE id = $1", [id]);
  if (resultado.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Projeto não encontrado" });
  }
  res.status(200).send(resultado.rows[0]);
});

router.post("/pessoas/:pessoaId/projetos", async (req, res) => {
  const { pessoaId } = req.params;
  const { nome, descricao, url_repositorio, url_deploy, data_inicio, data_fim } = req.body || {};

  if (!nome) {
    return res.status(400).send({ status: "fail", message: "Campo obrigatório: nome" });
  }

  const resultado = await pool.query(
    `INSERT INTO projetos (pessoa_id, nome, descricao, url_repositorio, url_deploy, data_inicio, data_fim)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [pessoaId, nome, descricao, url_repositorio, url_deploy, data_inicio, data_fim]
  );
  res.status(201).send(resultado.rows[0]);
});

router.put("/projetos/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, url_repositorio, url_deploy, data_inicio, data_fim } = req.body || {};

  const resultado = await pool.query(
    `UPDATE projetos SET
       nome = COALESCE($1, nome),
       descricao = COALESCE($2, descricao),
       url_repositorio = COALESCE($3, url_repositorio),
       url_deploy = COALESCE($4, url_deploy),
       data_inicio = COALESCE($5, data_inicio),
       data_fim = COALESCE($6, data_fim)
     WHERE id = $7 RETURNING *`,
    [nome, descricao, url_repositorio, url_deploy, data_inicio, data_fim, id]
  );
  if (resultado.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Projeto não encontrado" });
  }
  res.status(200).send(resultado.rows[0]);
});

router.delete("/projetos/:id", async (req, res) => {
  const { id } = req.params;
  const resultado = await pool.query("DELETE FROM projetos WHERE id = $1 RETURNING *", [id]);
  if (resultado.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Projeto não encontrado" });
  }
  res.status(200).send({ message: "Projeto removido com sucesso", removido: resultado.rows[0] });
});

export default router;