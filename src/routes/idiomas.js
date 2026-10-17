import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/idiomas", async (req, res) => {
  const resultado = await pool.query("SELECT * FROM idiomas ORDER BY id");
  res.status(200).send(resultado.rows);
});

router.get("/pessoas/:pessoaId/idiomas", async (req, res) => {
  const { pessoaId } = req.params;
  const resultado = await pool.query("SELECT * FROM idiomas WHERE pessoa_id = $1 ORDER BY id", [pessoaId]);
  res.status(200).send(resultado.rows);
});

router.get("/idiomas/:id", async (req, res) => {
  const { id } = req.params;
  const resultado = await pool.query("SELECT * FROM idiomas WHERE id = $1", [id]);
  if (resultado.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Idioma não encontrado" });
  }
  res.status(200).send(resultado.rows[0]);
});

router.post("/pessoas/:pessoaId/idiomas", async (req, res) => {
  const { pessoaId } = req.params;
  const { idioma, nivel } = req.body || {};

  if (!idioma) {
    return res.status(400).send({ status: "fail", message: "Campo obrigatório: idioma" });
  }

  const resultado = await pool.query(
    "INSERT INTO idiomas (pessoa_id, idioma, nivel) VALUES ($1, $2, $3) RETURNING *",
    [pessoaId, idioma, nivel]
  );
  res.status(201).send(resultado.rows[0]);
});

router.put("/idiomas/:id", async (req, res) => {
  const { id } = req.params;
  const { idioma, nivel } = req.body || {};

  const resultado = await pool.query(
    `UPDATE idiomas SET
       idioma = COALESCE($1, idioma),
       nivel = COALESCE($2, nivel)
     WHERE id = $3 RETURNING *`,
    [idioma, nivel, id]
  );
  if (resultado.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Idioma não encontrado" });
  }
  res.status(200).send(resultado.rows[0]);
});

router.delete("/idiomas/:id", async (req, res) => {
  const { id } = req.params;
  const resultado = await pool.query("DELETE FROM idiomas WHERE id = $1 RETURNING *", [id]);
  if (resultado.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Idioma não encontrado" });
  }
  res.status(200).send({ message: "Idioma removido com sucesso", removido: resultado.rows[0] });
});

export default router;