const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs");

const multer = require("multer");
const pool = require("../../db");

const { dataBR } = require("../../utils/dataBR");

const AVATAR_DIR = path.join(__dirname, "..", "..", "public", "img", "avatar");
if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, AVATAR_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const nome =
      "avatar" + Date.now() + "_" + Math.floor(Math.random() * 1e9) + ext;
    cb(null, nome);
  },
});

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const permitidos = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (permitidos.includes(ext)) return cb(null, true);
    return cb(new Error("Apenas arquivos de imagem são permitidos!"));
  },
});

function removerArquivoAvatar(nomeArquivo) {
  if (!nomeArquivo) return;
  const nome = path.basename(nomeArquivo);
  if (!nome.startsWith("avatar_")) return;
  const caminho = path.join(AVATAR_DIR, nome);
  fs.unlink(caminho, (err) => {
    if (err) console.error("Erro ao remover arquivo de avatar:", err);
  });
}

router.post("/avatar", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
      res.json({ avatar: "/img/avatar/" + req.file.filename });
    }
    res.json({ avatar: "/img/avatar/" + req.file.filename });
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM usuarios ORDER BY nome");
    res.json(rows.map((usuario) => ({
      id: usuario.id,
      avatar: usuario.avatar,
      matricula: usuario.matricula,
      nome: usuario.nome,
      curso: usuario.curso,
      data_cadastro: dataBR(usuario.data_cadastro),
    })));
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { avatar, matricula, nome, curso } = req.body;
    if (!matricula || !nome || !curso) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }
    const { rows } = await pool.query(
      "INSERT INTO usuarios (avatar, matricula, nome, curso) VALUES ($1, $2, $3, $4) RETURNING *",
      [avatar || null, matricula, nome, curso]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

module.exports = router;