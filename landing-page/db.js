const { Pool } = require( 'pg');

const pool  = new Pool ({
    user: process.env.PG_USER || 'postgres',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DATABASE || 'app',
    password: process.env.PG_PASSWORD || 'postgres',
    port: parseInt(process.env.PG_PORT || '5432', 10)

});
// Função para testar a conexão com o banco de dados
async function testarConexao() {
  try {
    const client = await pool.connect();
    console.log('Conexão com o banco de dados PostgreSQL estabelecida com sucesso!');
    client.release(); // Libera o cliente de volta para o pool
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error.message);
  }
}
// Executa o teste de conexão
testarConexao();

module.exports = pool;