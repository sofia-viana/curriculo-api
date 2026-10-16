import "dotenv/config";
import pg from "pg";

pg.types.setTypeParser(1082, (value)=> value);

const {Pool} = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false},
    max: 5,
});

export default pool;