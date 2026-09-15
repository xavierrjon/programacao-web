const botao = document.getElementById('meuBotao');
const mensagem = document.getElementById('meuParagrafo');

function alterarMensagem() {
    mensagem.textContent = 'Botão clicado!';
}

function resetMensagem() {
    setTimeout(() => {
        mensagem.textContent = '';
    }, 3000);
}

botao.addEventListener('click', alterarMensagem);
botao.addEventListener('click', resetMensagem);