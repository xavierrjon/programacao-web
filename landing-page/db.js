const { Pool } = require( 'pg');

const pool  = new Pool ({
    user: process.env.PG_USER || 'postgres',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DATABASE || 'app',
    password: process.env.PG_PASSWORD || 'postgres',
    port: parseInt(process.env.PG_PORT || '5432', 10)

});

async function inicializarBanco() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      avatar TEXT,
      matricula TEXT NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      curso TEXT NOT NULL,
      data_cadastro TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Conexão com o banco de dados PostgreSQL estabelecida com sucesso!');
}

module.exports = { pool, inicializarBanco };