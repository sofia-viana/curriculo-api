import express from "express";
import cors from "cors";

import pessoasRouter from "./routes/pessoas.js";
import formacoesRouter from "./routes/formacoes.js";
import experienciasRouter from "./routes/experiencias.js";
import projetosRouter from "./routes/projetos.js";
import idiomasRouter from "./routes/idiomas.js";
import habilidadesRouter from "./routes/habilidades.js";
import vinculosRouter from "./routes/vinculos.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).send({ message: "API de Currículo no ar"});
});

app.use("/pessoas", pessoasRouter);
app.use(formacoesRouter);
app.use(experienciasRouter);
app.use(projetosRouter);
app.use(idiomasRouter);
app.use("/habilidades", habilidadesRouter);
app.use(vinculosRouter);

app.use((req, res) => {
    res.status(404).send ({ status: "fail", message: "Rota não encontrada"});
});

app.use((err, req, res, next)=> { 
    if (err.type === "enity.parse.failed") {
        return res.status(400).send({ status: "fail", message: "JSON inválido"});
    }
    if (err.code === "23505") {
    return res.status(409).send({ status: "fail", message: "Já existe um registro com esse valor (duplicado)" });
  }
  if (err.code === "23503") {
    return res.status(404).send({ status: "fail", message: "Registro relacionado não encontrado (confira os ids)" });
  }
  if (["22P02", "22007", "22008", "23502", "22001"].includes(err.code)) {
    return res.status(400).send({ status: "fail", message: "Valor inválido (confira ids, datas AAAA-MM-DD e campos)" });
  }
  console.error(err);
  res.status(500).send({ status: "error", message: "Erro interno do servidor" });
});

export default app;
