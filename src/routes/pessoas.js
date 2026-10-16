import {Router} from "express";
import pool from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
    const resultado = await pool.query("SELECT * FROM pessoas ORDER BY id");
    res.status(200).send(resultado.rows);
});

router.get("/:id", async (req, res) => {
    const { id} = req.params;
    const resultado = await pool.query("SELECT * FROM pessoas WHERE id = $1", [id]);
    if(resultado.rows.lenght === 0 ){
        returns res.status(404).send({status: "fail", message: "Pessoa não encontrada"});
    }
    res.status(200).send(resultado.rows[0]);
});

router.get("/:id/curriculo", async (req, res) => {
  const { id } = req.params;

  const pessoa = await pool.query("SELECT * FROM pessoas WHERE id = $1", [id]);
  if (pessoa.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Pessoa não encontrada" });
  }

  const formacoes = await pool.query("SELECT * FROM formacoes WHERE pessoa_id = $1 ORDER BY data_inicio DESC", [id]);
  const experiencias = await pool.query("SELECT * FROM experiencias WHERE pessoa_id = $1 ORDER BY data_inicio DESC", [id]);
  const idiomas = await pool.query("SELECT * FROM idiomas WHERE pessoa_id = $1 ORDER BY id", [id]);
  const projetos = await pool.query("SELECT * FROM projetos WHERE pessoa_id = $1 ORDER BY id", [id]);

  
  for (const projeto of projetos.rows) {
    const tecnologias = await pool.query(
      `SELECT h.id, h.nome FROM projeto_habilidades ph
       JOIN habilidades h ON h.id = ph.habilidade_id
       WHERE ph.projeto_id = $1 ORDER BY h.nome`,
      [projeto.id]
    );
    projeto.tecnologias = tecnologias.rows;
  }

  
  const habilidades = await pool.query(
    `SELECT h.id, h.nome, h.categoria, ph.nivel FROM pessoa_habilidades ph
     JOIN habilidades h ON h.id = ph.habilidade_id
     WHERE ph.pessoa_id = $1 ORDER BY h.nome`,
    [id]
  );

  const curriculo = pessoa.rows[0];
  curriculo.formacoes = formacoes.rows;
  curriculo.experiencias = experiencias.rows;
  curriculo.projetos = projetos.rows;
  curriculo.habilidades = habilidades.rows;
  curriculo.idiomas = idiomas.rows;

  res.status(200).send(curriculo);
});


router.post("/", async (req, res) => {
  const { nome, titulo, resumo, email, telefone, cidade, estado, linkedin, github } = req.body || {};

  if (!nome || !email) {
    return res.status(400).send({ status: "fail", message: "Campos obrigatórios: nome e email" });
  }

  const resultado = await pool.query(
    `INSERT INTO pessoas (nome, titulo, resumo, email, telefone, cidade, estado, linkedin, github)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [nome, titulo, resumo, email, telefone, cidade, estado, linkedin, github]
  );
  res.status(201).send(resultado.rows[0]);
});


router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, titulo, resumo, email, telefone, cidade, estado, linkedin, github } = req.body || {};

  const resultado = await pool.query(
    `UPDATE pessoas SET
       nome = COALESCE($1, nome),
       titulo = COALESCE($2, titulo),
       resumo = COALESCE($3, resumo),
       email = COALESCE($4, email),
       telefone = COALESCE($5, telefone),
       cidade = COALESCE($6, cidade),
       estado = COALESCE($7, estado),
       linkedin = COALESCE($8, linkedin),
       github = COALESCE($9, github)
     WHERE id = $10 RETURNING *`,
    [nome, titulo, resumo, email, telefone, cidade, estado, linkedin, github, id]
  );
  if (resultado.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Pessoa não encontrada" });
  }
  res.status(200).send(resultado.rows[0]);
});


router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const resultado = await pool.query("DELETE FROM pessoas WHERE id = $1 RETURNING *", [id]);
  if (resultado.rows.length === 0) {
    return res.status(404).send({ status: "fail", message: "Pessoa não encontrada" });
  }
  res.status(200).send({ message: "Pessoa removida com sucesso", removido: resultado.rows[0] });
});

export default router;