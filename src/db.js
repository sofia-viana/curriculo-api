import "dotenv/config";
import net from "node:net";
import pg from "pg";

net.setDefaultAutoSelectFamilyAttemptTimeout(5000);
pg.types.setTypeParser(1082, (value) => value);

pg.types.setTypeParser(1082, (value)=> value);

const {Pool} = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false},
    max: 5,
});

export default pool;