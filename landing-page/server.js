const express = require("express");
const path = require("path");
const config = require("./config");
const { inicializarBanco } = require("./db");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

//meus serviços
app.use('/api/usuarios', require('./microservices/usuarios/routes'));

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ error: "JSON inválido na requisição" });
  }
  next(error);
});

async function iniciarServidor() {
  try {
    await inicializarBanco();
    app.listen(config.port, () => {
      console.log(`Server is running on port http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Não foi possível inicializar o banco de dados:", error.message);
    process.exitCode = 1;
  }
}

iniciarServidor();
