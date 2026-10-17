import { Router } from "express";
import pool from "../db.js";

const router = Router();

//PESSOA <-> HABILIDADE (relacionamento N:N, com nível)

router.get("/pessoas/:pessoaId/habilidades", async (req, res) => {
  const { pessoaId } = req.params;
  const resultado = await pool.query(
    `SELECT h.id AS habilidade_id, h.nome, h.categoria, ph.nivel
     FROM pessoa_habilidades ph
     JOIN habilidades h ON h.id = ph.habilidade_id
     WHERE ph.pessoa_id = $1
     ORDER BY h.nome`,
    [pessoaId]
  );
  res.status(200).send(resultado.rows);
});

router.post("/pessoas/:pessoaId/habilidades", async (req, res) => {
  const { pessoaId } = req.params;
  const { habilidade_id, nivel } = req.body || {};

  if (!habilidade_id) {
    return res.status(400).send({ status: "fail", message: "Campo obrigatório: habilidade_id" });
  }

  const resultado = await pool.query(
    "INSERT INTO pessoa_habilidades (pessoa_id, habilidade_id, nivel) VALUES ($1, $2, $3) RETURNING *",
    [pessoaId, habilidade_id, nivel]
  );
  res.status(201).send(resultado.rows[0]);
});

router.put("/pessoas/:pessoaId/habilidades/:habilidadeId", async (req, res) => {
  const { pessoaId, habilidadeId } = req.params;
  const { nivel } = req.body || {};

  if (!nivel) {
    return res.status(400).send({ status: "fail", message: "Campo obrigatório: nivel" });
  }

  const resultado = await pool.query(
    "UPDATE pessoa_habilidades SET nivel = $1 WHERE pessoa_id = $2 AND habilidade_id = $3 RETURNING *",
    [nivel, pessoaId, habilidadeId]
  );
  if (resultado.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Vínculo não encontrado" });
  }
  res.status(200).send(resultado.rows[0]);
});

router.delete("/pessoas/:pessoaId/habilidades/:habilidadeId", async (req, res) => {
  const { pessoaId, habilidadeId } = req.params;
  const resultado = await pool.query(
    "DELETE FROM pessoa_habilidades WHERE pessoa_id = $1 AND habilidade_id = $2 RETURNING *",
    [pessoaId, habilidadeId]
  );
  if (resultado.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Vínculo não encontrado" });
  }
  res.status(200).send({ message: "Habilidade desvinculada da pessoa", removido: resultado.rows[0] });
});


// PROJETO <-> HABILIDADE (relacionamento N:N, tecnologias do projeto)

router.get("/projetos/:projetoId/habilidades", async (req, res) => {
  const { projetoId } = req.params;
  const resultado = await pool.query(
    `SELECT h.id AS habilidade_id, h.nome, h.categoria
     FROM projeto_habilidades ph
     JOIN habilidades h ON h.id = ph.habilidade_id
     WHERE ph.projeto_id = $1
     ORDER BY h.nome`,
    [projetoId]
  );
  res.status(200).send(resultado.rows);
});

router.post("/projetos/:projetoId/habilidades", async (req, res) => {
  const { projetoId } = req.params;
  const { habilidade_id } = req.body || {};

  if (!habilidade_id) {
    return res.status(400).send({ status: "fail", message: "Campo obrigatório: habilidade_id" });
  }

  const resultado = await pool.query(
    "INSERT INTO projeto_habilidades (projeto_id, habilidade_id) VALUES ($1, $2) RETURNING *",
    [projetoId, habilidade_id]
  );
  res.status(201).send(resultado.rows[0]);
});

router.delete("/projetos/:projetoId/habilidades/:habilidadeId", async (req, res) => {
  const { projetoId, habilidadeId } = req.params;
  const resultado = await pool.query(
    "DELETE FROM projeto_habilidades WHERE projeto_id = $1 AND habilidade_id = $2 RETURNING *",
    [projetoId, habilidadeId]
  );
  if (resultado.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Vínculo não encontrado" });
  }
  res.status(200).send({ message: "Tecnologia desvinculada do projeto", removido: resultado.rows[0] });
});

export default router;