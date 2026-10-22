const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { pool } = require('../../db'); // Importa a conexão com o banco de dados

const { dataBR } = require('../../utils/date');

// local onde as imagens serão armazenadas
const AVATAR_DIR = path.join(__dirname, '..', '..', 'public', 'img', 'avatar');
if (!fs.existsSync(AVATAR_DIR)) {
    fs.mkdirSync(AVATAR_DIR, { recursive: true });
}
//config de upload de arquivos
const storage = multer.diskStorage({
    destination:  (req, file, cb) => cb(null, AVATAR_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const nome = 'avatar_' + Date.now() + '_' + Math.floor(Math.random() *  1e9) + ext;
        cb(null, nome);
    }
});
// upload e limite de tamanho do arquivo
const upload  =  multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const permitidos = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
       const ext = path.extname(file.originalname).toLowerCase();
       if (permitidos.includes(ext)) return cb(null, true);
       return cb(new Error('Apenas arquivos de imagem são permitidos!, Use JPG, PNG, GIF  ou WEBP'));
    }
});
// remover o arquivo
function removerArquivoAvatar (nomeArquivo){
    if(!nomeArquivo) return;
    //so remove arquivo da nossa parta (nunca caminhos externos)
    const nome = path.basename(nomeArquivo);
    if (!nome.startsWith('avatar_')) return;
    const caminho = path.join(AVATAR_DIR, nome);
    fs.unlink(caminho, ()=> {});

}
// rota para nossa API para fazer o PUT de avatar
router.put('/avatar', upload.single('avatar'), (req, res) => {
    try{
        if(!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
          res.json({ avatar: '/img/avatar/' + req.file.filename });

    }  catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//GET /api/usuarios
router.get('/', async (req, res ) => {
   try {
    const { rows } = await pool.query('SELECT * FROM usuarios ORDER BY  nome');
    res.json(rows.map(u => ({
        id: u.id,
        avatar: u.avatar,
        matricula: u.matricula,
        nome: u.nome,
        curso: u.curso,
        data_cadastro: dataBR(u.data_cadastro)
    })));
   } catch (error) {
    res.status(500).json({ error: error.message });
   }
});

// POST /api/usuarios
router.post('/', async (req, res) => {
    try {
        const  {avatar, matricula, nome, curso} = req.body;
        if(!matricula || !nome || !curso) {
            return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
        }
        const { rows } = await pool.query(
            `INSERT INTO usuarios (avatar, matricula, nome, curso)
            VALUES ($1, $2, $3, $4)
            RETURNING  id, avatar, matricula, nome, curso, data_cadastro`,
            [avatar || null, matricula, nome, curso]
        );
        res.status(201).json({
            id: rows[0].id,
            avatar: rows[0].avatar,
            matricula: rows[0].matricula,
            nome: rows[0].nome,
            curso: rows[0].curso,
            data_cadastro: dataBR(rows[0].data_cadastro)
        });

    }catch (err){
        if (err.code === '23505'){
            return res.status(400).json({ erro: 'Matrícula já cadastrada' });
        }
        res.status(500).json({ erro: err.message });
    }
});

// PUT /api/usuarios/:id (atualizar usuário)
router.put('/:id', async (req, res) => {
    try {
        const { avatar, matricula, nome, curso } = req.body;
        if (!matricula || !nome || !curso) {
            return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
        }

        //se o avatar mudou, remover o arquivo antigo
        if (avatar) {
            const atual = await pool.query('SELECT avatar FROM usuarios WHERE id = $1', [req.params.id]);
            if(atual.rows.length > 0 && atual.rows[0].avatar !== avatar) {
                removerArquivoAvatar(atual.rows[0].avatar);
            }
        }
        //update no banco
        const { rows } = await pool.query(
            `UPDATE usuarios
            SET avatar = $1, matricula = $2, nome = $3, curso = $4
            WHERE id = $5
            RETURNING id, avatar, matricula, nome, curso, data_cadastro`,
            [avatar || null, matricula, nome, curso, req.params.id]
        );
        //se não encontrou o usuário
        if(rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
        res.json({
            id: rows[0].id,
            avatar: rows[0].avatar,
            matricula: rows[0].matricula,
            nome: rows[0].nome,
            curso: rows[0].curso,
            data_cadastro: dataBR(rows[0].data_cadastro)
        });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Matrícula já cadastrada' });
        }
        res.status(500).json({ error: err.message });
    }
});
// DELETE /api/usuarios/:id (excluir usuário)
router.delete('/:id', async (req, res) => {
    try {
        //pegar o avatar do usuário antes de deletar
        const atual = await pool.query('SELECT avatar FROM usuarios WHERE id = $1', [req.params.id]);
        await pool.query('DELETE FROM usuarios WHERE id = $1', [req.params.id]);
        if(atual.rows.length > 0) removerArquivoAvatar(atual.rows[0].avatar);
        res.json({ message: 'Usuário excluído com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
