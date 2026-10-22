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
