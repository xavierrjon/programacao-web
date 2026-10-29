// ============= ESTADO =======================
let usuario = [];
let arquivoAvatarSelecionado = null;

function obterIniciais(nome) {
  const partes = nome.trim().split(" ");
  if (partes.length > 2)
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  return nome.substring(0, 2).toUpperCase();
}

//===== cliente API =========
const api = {
  async request(rota, metodo, dados) {
    const opcoes = {
      method: metodo,
      headers: { "Content-Type": "application/json" },
    };
    if (dados !== undefined) opcoes.body = JSON.stringify(dados);
    const r = await fetch("/api" + rota, opcoes);
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error(e.error || e.erro || "Erro na operação.");
    }
    return r.json();
  },
  //rotas
  get(rota) {
    return this.request(rota, "GET");
  },
  post(rota, dados) {
    return this.request(rota, "POST", dados);
  },
  put(rota, dados) {
    return this.request(rota, "PUT", dados);
  },
  del(rota) {
    return this.request(rota, "DELETE");
  },
  async uploadAvatar(arquivo) {
    const fd = new FormData();
    fd.append("avatar", arquivo);
    const r = await fetch("/api/usuarios/avatar", { method: "PUT", body: fd });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error(e.error || e.erro || "Erro no upload da imagem.");
    }
    return r.json();
  },
};

// Visualização do avatar

document.getElementById("usuarioAvatar").addEventListener("change", (e) => {
  const arquivo = e.target.files[0];

  if (!arquivo) return;

  if (
    !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
      arquivo.type,
    )
  ) {
    alert("Formato de arquivo inválido. Use JPG, PNG, GIF ou WEBP.");
    e.target.value = "";
    arquivoAvatarSelecionado = null;
    return;
  }
  if (arquivo.size > 5 * 1024 * 1024) {
    alert("Arquivo muito grande. O tamanho máximo permitido é 5MB.");
    e.target.value = "";
    return;
  }
  arquivoAvatarSelecionado = arquivo;
  const preview = document.getElementById("avatarPreview");
  preview.innerHTML = "";
  const img = document.createElement("img");
  img.src = caminho;
  img.onerror = () => {
    exibirPreview(null, iniciais);
  };
  preview.appendChild(img);
});

function exibirPreview(caminho, iniciais) {
  const preview = document.getElementById("avatarPreview");
  preview.innerHTML = "";
  if (caminho) {
    const img = document.createElement("img");
    img.src = caminho;
    img.onerror = () => {
      exibirPreview(null, iniciais);
    };
    preview.appendChild(img);
  } else {
    const icone = document.createElement("i");
    icone.className = "fas fa-user";
    preview.appendChild(icone);
  }
}

// atualização (renderização do frontend)

function renderizarUsuario() {
  const termo = (document.getElementById("pesquisaUsuario").value || "")
    .trim()
    .toLowerCase();
  const tbody = document.getElementById("tabelaUsuariosBody");
  const tabelaVazia = document.getElementById("tabelaUsuariosVazia");
  tbody.innerHTML = "";

  let lista = renderizarUsuarios.slice();
  if (termo) {
    lista = lista.filter(
      (u) =>
        u.nome.toLowerCase().includes(termo) ||
        u.matricula.toLowerCase().includes(termo) ||
        u.curso.toLowerCase().includes(termo),
    );
  }
}
if (lista.length === 0) {
  tabelaVazia.style.display = "flex";
  if (usuarios.length > 0 && termo) {
    tabelaVazia.innerHTML =
      "<i class='fas fa-search'></i> <p>Nenhum usuário encontrado para <strong>" +
      termo +
      "</strong></p>";
  } else {
    tabelaVazia.innerHTML =
      "<i class='fas fa-users-slash'></i> <p>Nenhum usuário cadastrado</p>";
  }
}
tabelaVazia.style.display = "none";

lista.forEach((usuario, index) => {
  const tr = document.createElement("tr");
  tr.innerHTML =
    "<td>" +
    (index + 1) +
    "</td>" +
    "<td>" +
    "<div class='avatar-cell'>" +
    (usuario.avatar
      ? "<img src='" +
        usuario.avatar +
        "' alt='Avatar' class='avatar-img' onerror = 'this.style.display = \"none\"; this.nextSibling.style.display = \"flex\";' />"
      : "") +
    '<div class="avatar-iniciais"' +
    (usuario.avatar ? 'style="display: none;"' : "") +
    ">" +
    ">" +
    obterIniciais(usuario.nome) +
    "</div>" +
    "</div>" +
    "</td>" +
    "<td>" +
    usuario.matricula +
    "</td>" +
    "<td><strong>" +
    usuario.nome +
    "</strong></td>" +
    "<td>" +
    usuario.curso +
    "</td>" +
    "<td class='data-lancamento'>" +
    (usuario.dataCadastro || "--") +
    "</td>" +
    "<td class='acao-btns'>" +
    "<button class='btn-acao editar' onclick='editarUsuario(" +
    usuario.id +
    ")' title='Editar usuário'>" +
    '<i class="fas fa-pen"></i>' +
    "</button>" +
    "<button class='btn-acao excluir' onclick='excluirUsuario(" +
    usuario.id +
    ")' title='Excluir usuário'>" +
    '<i class="fas fa-trash"></i>' +
    "</button>" +
    "</td>";
  tbody.appendChild(tr);
});

async function carregarUsuarios() {
  try {
    usuarios = await api.get("/usuarios");
  } catch (err) {
    alert(err.message);
    usuarios = [];
  }
  renderizarUsuarios();
}

document.addEventListener("DOMContentLoaded", () => {
  carregarUsuarios();
});

// formulario cadastro (submit)

document.getElementById("usuarioForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  // campos ID e ocultos
  const editandoId = document.getElementById("usuarioEditandoId").value;
  const matricula = document.getElementById("usuarioMatricula").value.trim();
  const nome = document.getElementById("usuarioNome").value.trim();
  const curso = document.getElementById("usuarioCurso").value.trim();

  if (!matricula || !nome || !curso) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  try {
    let avatar = document.getElementById("usuarioAvatarAtual").value || null;

    if (arquivoAvatarSelecionado) {
      const up = await api.uploadAvatar(arquivoAvatarSelecionado);
      avatar = up.avatar;
    }
    if (editandoId) {
      await api.put("/usuarios/" + editandoId, {
        matricula,
        nome,
        curso,
        avatar,
      });
    } else {
      const duplicada = usuarios.some((u) => u.matricula === matricula);
      if (duplicada) {
        alert("Matrícula já cadastrada. Use outra matrícula.");
        return;
      }
      await api.post("/usuarios", { matricula, nome, curso, avatar });
    }
    // limpar o form 
  }

})