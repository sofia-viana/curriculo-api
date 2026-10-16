import pool from "../src/db.js";

const insert = async (table, data) => {
  const keys = Object.keys(data);
  const { rows } = await pool.query(
    `INSERT INTO ${table} (${keys.join(",")}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(",")}) RETURNING *`,
    Object.values(data)
  );
  return rows[0];
};


const vincula = (pessoaId, habilidadeId, nivel) =>
  pool.query(
    "INSERT INTO pessoa_habilidades (pessoa_id, habilidade_id, nivel) VALUES ($1,$2,$3)",
    [pessoaId, habilidadeId, nivel]
  );


const tecnologia = (projetoId, habilidadeId) =>
  pool.query(
    "INSERT INTO projeto_habilidades (projeto_id, habilidade_id) VALUES ($1,$2)",
    [projetoId, habilidadeId]
  );

try {
  
  await pool.query(
    `TRUNCATE projeto_habilidades, pessoa_habilidades, idiomas, projetos,
              experiencias, formacoes, habilidades, pessoas RESTART IDENTITY CASCADE`
  );

  //Catálogo de habilidades (a ORDEM define os ids: JavaScript=1 ... Express=10) 
  const h = {};
  for (const [nome, categoria] of [
    ["JavaScript", "Linguagem"], ["Node.js", "Back-end"], ["React", "Front-end"],
    ["PostgreSQL", "Banco de dados"], ["Git", "Ferramenta"], ["Python", "Linguagem"],
    ["Pandas", "Dados"], ["Power BI", "Dados"], ["SQL", "Banco de dados"], ["Express", "Back-end"],
  ]) {
    h[nome] = (await insert("habilidades", { nome, categoria })).id;
  }

  
  const eu = await insert("pessoas", {
    nome: "Sofia Viana",                                  
    titulo: "Estudante de Sistemas para Internet",             
    resumo: "Com interesse na área de dados e aprendendo sobre Servicenow!.",          
    email: "sofiavianaap@gmail.com",                                  
    telefone: "(81) 987572310",                              
    cidade: "Recife",                                          
    estado: "PE",                                            
    linkedin: "https://linkedin.com/in/sofiaviana",         
    github: "https://github.com/sofia-viana",                
  });

  await insert("formacoes", {
    pessoa_id: eu.id,
    instituicao: "Universidade Católica de Pernambuco - UNICAP",
    curso: "Sistemas para Internet",
    grau: "Tecnólogo",
    data_inicio: "2025-02",                                 
    data_fim: "2027-07",                                   
    descricao: "Descreva o que você estuda.",                  // TROQUE
  });

  await insert("formacoes", {
    pessoa_id: eu.id,
    instituicao: "Escola Técnica Estadual Cícero Dias",
    curso: "Programação de Jogos Digitais",
    grau: "Técnico",
    data_inicio: "2022-02",                                 
    data_fim: "2024-12",                                   
    descricao: "Descreva o que você estuda.",                  // TROQUE
  });

  await insert("experiencias", {
    pessoa_id: eu.id,
    empresa: "Amarante Hoteis",                  
    cargo: "Jovem Aprendiz",                              
    data_inicio: "2026-07-01",                                 
    atual: true,
    descricao: "Descreva suas tarefas em termos gerais.",      // TROQUE
  });

  const meuP1 = await insert("projetos", {
    pessoa_id: eu.id,
    nome: "AvaliaFilmes",                                           // TROQUE
    descricao: "Plataforma de avaliações de filmes (projeto da faculdade).",
    url_repositorio: "https://github.com/sofia-viana/cinelog", // TROQUE
    data_inicio: "2025-08-01",                                 // TROQUE
  });
  const meuP2 = await insert("projetos", {
    pessoa_id: eu.id,
    nome: "Place Brokers",                                     
    descricao: "Site de imobiliária (projeto em grupo da faculdade).",
    url_repositorio: "https://github.com/sofia-viana/place-brokers", // TROQUE
    data_inicio: "2026-03-01",                                 // TROQUE
  });

  await insert("idiomas", { pessoa_id: eu.id, idioma: "Português", nivel: "Nativo" });
  await insert("idiomas", { pessoa_id: eu.id, idioma: "Inglês", nivel: "Intermediário" }); 


  
  for (const [n, nivel] of [
    ["JavaScript", "Intermediário"], ["Node.js", "Intermediário"], ["Express", "Intermediário"],
    ["PostgreSQL", "Básico"], ["SQL", "Intermediário"], ["Git", "Intermediário"],
  ]) {
    await vincula(eu.id, h[n], nivel);
  }
  for (const n of ["JavaScript", "Node.js", "PostgreSQL"]) await tecnologia(meuP1.id, h[n]);
  for (const n of ["JavaScript", "React"]) await tecnologia(meuP2.id, h[n]);

  
  const carlos = await insert("pessoas", {
    nome: "Carlos Eduardo Souza",
    titulo: "Analista de Dados",
    resumo: "Analista de dados com experiência em Python, SQL e dashboards de Business Intelligence.",
    email: "carlos.souza@email.com",
    telefone: "(83) 98888-2222",
    cidade: "João Pessoa",
    estado: "PB",
    linkedin: "https://linkedin.com/in/carlos-eduardo-souza",
    github: "https://github.com/carlos-eduardo-souza",
  });
  await insert("formacoes", { pessoa_id: carlos.id, instituicao: "UFPB", curso: "Estatística", grau: "Bacharelado", data_inicio: "2019-03-01", data_fim: "2023-07-20", descricao: "Foco em análise de dados e modelagem estatística." });
  await insert("formacoes", { pessoa_id: carlos.id, instituicao: "UNICAP", curso: "Ciência de Dados", grau: "Pós-graduação", data_inicio: "2024-08-01", data_fim: "2025-12-15" });
  await insert("experiencias", { pessoa_id: carlos.id, empresa: "DataNordeste", cargo: "Analista de Dados Pleno", data_inicio: "2024-01-15", atual: true, descricao: "Criação de pipelines em Python e dashboards em Power BI." });
  await insert("experiencias", { pessoa_id: carlos.id, empresa: "Banco Regional", cargo: "Analista de BI Júnior", data_inicio: "2022-02-01", data_fim: "2023-12-20", atual: false, descricao: "Relatórios gerenciais e consultas SQL em grandes volumes." });
  const carlosP1 = await insert("projetos", { pessoa_id: carlos.id, nome: "Painel de Vendas", descricao: "Dashboard de vendas com atualização diária.", url_repositorio: "https://github.com/carlos-eduardo-souza/painel-vendas", data_inicio: "2024-03-01", data_fim: "2024-06-30" });
  const carlosP2 = await insert("projetos", { pessoa_id: carlos.id, nome: "Previsão de Demanda", descricao: "Modelo de previsão de demanda com séries temporais.", url_repositorio: "https://github.com/carlos-eduardo-souza/previsao-demanda", data_inicio: "2025-01-10" });
  await insert("idiomas", { pessoa_id: carlos.id, idioma: "Português", nivel: "Nativo" });
  await insert("idiomas", { pessoa_id: carlos.id, idioma: "Inglês", nivel: "Avançado" });
  await insert("idiomas", { pessoa_id: carlos.id, idioma: "Espanhol", nivel: "Básico" });
  for (const [n, nivel] of [["Python", "Avançado"], ["Pandas", "Avançado"], ["Power BI", "Avançado"], ["SQL", "Avançado"], ["Git", "Intermediário"], ["PostgreSQL", "Intermediário"]]) {
    await vincula(carlos.id, h[n], nivel);
  }
  for (const n of ["Power BI", "SQL"]) await tecnologia(carlosP1.id, h[n]);
  for (const n of ["Python", "Pandas"]) await tecnologia(carlosP2.id, h[n]);

  console.log("Seed concluído: 2 currículos cadastrados (o seu e o do Carlos).");
} catch (err) {
  console.error("Falha no seed:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}