import fs from "node:fs";
import pool from "../src/db.js";

const sql = fs.readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");

try {
    await pool.query(sql);
    console.log("Tabelas criadas/atualizadas com sucesso.")
} catch (err){
    console.error("Falha na migração: ", err.message);
    process.exitCode= 1;
} finally {
    await pool.end();
}