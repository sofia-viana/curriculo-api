import fs from "node:fs";

const BASE_URL = process.env.BASE_URL || "https://SEU-PROJETO.vercel.app";

const J = [{ key: "Content-Type", value: "application/json" }];

const url = (path) => ({
  raw: `{{baseUrl}}${path}`,
  host: ["{{baseUrl}}"],
  path: path.split("/").filter(Boolean),
});

// saveVar: guarda o id retornado no POST | resetVar: após excluir, volta a variável ao id do seed
const req = (name, method, path, body, { saveVar, expect, resetVar } = {}) => {
  const status = expect ?? (method === "POST" ? 201 : 200);
  const exec = [`pm.test("Status ${status}", () => pm.response.to.have.status(${status}));`];
  if (saveVar) {
    exec.push(`const json = pm.response.json();`);
    exec.push(`if (json.id) pm.collectionVariables.set("${saveVar}", json.id);`);
  }
  if (resetVar) exec.push(`pm.collectionVariables.set("${resetVar[0]}", "${resetVar[1]}");`);
  return {
    name,
    event: [{ listen: "test", script: { type: "text/javascript", exec } }],
    request: {
      method,
      header: body ? J : [],
      ...(body && { body: { mode: "raw", raw: JSON.stringify(body, null, 2), options: { raw: { language: "json" } } } }),
      url: url(path),
    },
  };
};

const childFolder = (nome, rota, varId, createBody, updateBody) => ({
  name: nome,
  item: [
    req(`Listar todos (${nome})`, "GET", `/${rota}`),
    req(`Listar da pessoa`, "GET", `/pessoas/{{pessoaId}}/${rota}`),
    req(`Criar para a pessoa`, "POST", `/pessoas/{{pessoaId}}/${rota}`, createBody, { saveVar: varId }),
    req(`Buscar por id`, "GET", `/${rota}/{{${varId}}}`),
    req(`Atualizar`, "PUT", `/${rota}/{{${varId}}}`, updateBody),
    req(`Excluir`, "DELETE", `/${rota}/{{${varId}}}`, null, { resetVar: [varId, "1"] }),
  ],
});

const collection = {
  info: {
    name: "API Currículo (Express + PostgreSQL)",
    description:
      "Troque `baseUrl` para apontar para o servidor (Vercel ou localhost). " +
      "Os POSTs salvam o id criado nas variáveis da coleção. " +
      "Troque pessoaId (1 ou 2) para alternar entre os currículos.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    { key: "baseUrl", value: BASE_URL },
    { key: "pessoaId", value: "1" },
    { key: "formacaoId", value: "1" },
    { key: "experienciaId", value: "1" },
    { key: "projetoId", value: "1" },
    { key: "idiomaId", value: "1" },
    { key: "certificacaoId", value: "1" },
    { key: "habilidadeId", value: "8" },
  ],
  item: [
    {
      name: "Pessoas",
      item: [
        req("Listar pessoas", "GET", "/pessoas"),
        req("Buscar pessoa por id", "GET", "/pessoas/{{pessoaId}}"),
        req("Currículo completo da pessoa", "GET", "/pessoas/{{pessoaId}}/curriculo"),
        req("Criar pessoa", "POST", "/pessoas", {
          nome: "Maria Teste",
          titulo: "Desenvolvedora Back-end",
          resumo: "Pessoa criada pelo Postman.",
          email: "maria.{{$timestamp}}@email.com",
          telefone: "(81) 90000-0000",
          cidade: "Recife",
          estado: "PE",
          linkedin: "https://linkedin.com/in/maria-teste",
          github: "https://github.com/maria-teste",
        }, { saveVar: "pessoaId" }),
        req("Atualizar pessoa", "PUT", "/pessoas/{{pessoaId}}", { titulo: "Desenvolvedora Full Stack", cidade: "Olinda" }),
        req("Excluir pessoa", "DELETE", "/pessoas/{{pessoaId}}", null, { resetVar: ["pessoaId", "1"] }),
      ],
    },
    childFolder("Formações", "formacoes", "formacaoId",
      { instituicao: "UNICAP", curso: "Sistemas para Internet", grau: "Tecnólogo", data_inicio: "2024-02-01", data_fim: "2026-12-15", descricao: "Formação criada pelo Postman." },
      { grau: "Bacharelado", descricao: "Descrição atualizada." }),
    childFolder("Experiências", "experiencias", "experienciaId",
      { empresa: "Empresa Teste", cargo: "Desenvolvedora", data_inicio: "2025-01-10", atual: true, descricao: "Experiência criada pelo Postman." },
      { cargo: "Desenvolvedora Sênior", atual: false, data_fim: "2026-06-30" }),
    childFolder("Projetos", "projetos", "projetoId",
      { nome: "Projeto Teste", descricao: "Projeto criado pelo Postman.", url_repositorio: "https://github.com/exemplo/projeto", url_deploy: "https://projeto.vercel.app", data_inicio: "2026-01-01" },
      { descricao: "Descrição atualizada.", data_fim: "2026-09-30" }),
    childFolder("Idiomas", "idiomas", "idiomaId",
      { idioma: "Francês", nivel: "Básico" },
      { nivel: "Intermediário" }),
    childFolder("Certificações", "certificacoes", "certificacaoId",
      { nome: "Certificação Teste", instituicao: "Alura", data_emissao: "2026-05-10", url: "https://alura.com.br/certificado/exemplo" },
      { instituicao: "Rocketseat" }),
    {
      name: "Habilidades (catálogo)",
      item: [
        req("Listar habilidades", "GET", "/habilidades"),
        req("Criar habilidade", "POST", "/habilidades", { nome: "Docker {{$timestamp}}", categoria: "DevOps" }, { saveVar: "habilidadeId" }),
        req("Buscar habilidade por id", "GET", "/habilidades/{{habilidadeId}}"),
        req("Atualizar habilidade", "PUT", "/habilidades/{{habilidadeId}}", { categoria: "Infraestrutura" }),
        req("Excluir habilidade", "DELETE", "/habilidades/{{habilidadeId}}", null, { resetVar: ["habilidadeId", "8"] }),
      ],
    },
    {
      name: "Relacionamentos N:N",
      item: [
        req("Pessoa → listar habilidades", "GET", "/pessoas/{{pessoaId}}/habilidades"),
        req("Pessoa → vincular habilidade", "POST", "/pessoas/{{pessoaId}}/habilidades", { habilidade_id: "{{habilidadeId}}", nivel: "Básico" }),
        req("Pessoa → atualizar nível da habilidade", "PUT", "/pessoas/{{pessoaId}}/habilidades/{{habilidadeId}}", { nivel: "Avançado" }),
        req("Pessoa → desvincular habilidade", "DELETE", "/pessoas/{{pessoaId}}/habilidades/{{habilidadeId}}"),
        req("Projeto → listar tecnologias", "GET", "/projetos/{{projetoId}}/habilidades"),
        req("Projeto → vincular tecnologia", "POST", "/projetos/{{projetoId}}/habilidades", { habilidade_id: "{{habilidadeId}}" }),
        req("Projeto → desvincular tecnologia", "DELETE", "/projetos/{{projetoId}}/habilidades/{{habilidadeId}}"),
      ],
    },
    {
      name: "Erros (validações)",
      item: [
        req("Pessoa sem campos obrigatórios (400)", "POST", "/pessoas", { titulo: "Sem nome" }, { expect: 400 }),
        req("Pessoa inexistente (404)", "GET", "/pessoas/99999", null, { expect: 404 }),
        req("Id inválido (400)", "GET", "/pessoas/abc", null, { expect: 400 }),
      ],
    },
  ],
};

const out = JSON.stringify(collection, null, 2).replace(/\\"\{\{habilidadeId\}\}\\"/g, "{{habilidadeId}}");
fs.writeFileSync(new URL("./curriculo-api.postman_collection.json", import.meta.url), out);
console.log("Coleção gerada em postman/curriculo-api.postman_collection.json");