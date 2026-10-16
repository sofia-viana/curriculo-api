CREATE TABLE IF NOT EXISTS pessoas (
    id         SERIAL PRIMARY KEY,
    nome       VARCHAR(150) NOT NULL,
    titulo     VARCHAR(150),
    resumo     TEXT,
    email      VARCHAR(150) NOT NULL UNIQUE,
    telefone   VARCHAR(30),
    cidade     VARCHAR(100),
    estado     VARCHAR(2),
    linkedin   VARCHAR(255),
    github     VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

CREATE TABLE IF NOT EXISTS formacoes (
  id          SERIAL PRIMARY KEY,
  pessoa_id   INTEGER NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  instituicao VARCHAR(150) NOT NULL,
  curso       VARCHAR(150) NOT NULL,
  grau        VARCHAR(50),
  data_inicio DATE,
  data_fim    DATE,
  descricao   TEXT
);

CREATE TABLE IF NOT EXISTS experiencias (
  id          SERIAL PRIMARY KEY,
  pessoa_id   INTEGER NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  empresa     VARCHAR(150) NOT NULL,
  cargo       VARCHAR(150) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim    DATE,
  atual       BOOLEAN NOT NULL DEFAULT FALSE,
  descricao   TEXT
);

CREATE TABLE IF NOT EXISTS projetos (
  id              SERIAL PRIMARY KEY,
  pessoa_id       INTEGER NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  nome            VARCHAR(150) NOT NULL,
  descricao       TEXT,
  url_repositorio VARCHAR(255),
  url_deploy      VARCHAR(255),
  data_inicio     DATE,
  data_fim        DATE
);

CREATE TABLE IF NOT EXISTS idiomas (
  id        SERIAL PRIMARY KEY,
  pessoa_id INTEGER NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  idioma    VARCHAR(80) NOT NULL,
  nivel     VARCHAR(50)
);


CREATE TABLE IF NOT EXISTS habilidades (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(100) NOT NULL UNIQUE,
  categoria VARCHAR(80)
);

-- N:N pessoa <-> habilidade (com nível)
CREATE TABLE IF NOT EXISTS pessoa_habilidades (
  pessoa_id     INTEGER NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  habilidade_id INTEGER NOT NULL REFERENCES habilidades(id) ON DELETE CASCADE,
  nivel         VARCHAR(50),
  PRIMARY KEY (pessoa_id, habilidade_id)
);

-- N:N projeto <-> habilidade
CREATE TABLE IF NOT EXISTS projeto_habilidades (
  projeto_id    INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  habilidade_id INTEGER NOT NULL REFERENCES habilidades(id) ON DELETE CASCADE,
  PRIMARY KEY (projeto_id, habilidade_id)
);