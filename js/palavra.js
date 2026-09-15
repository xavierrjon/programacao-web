const digitou = require('readline');
const mensagem = document.getElementById('meuParagrafo');

function imprimirPalavra(palavra) {
    mensagem.textContent = "Palavra digitada: " + palavra;
}

const rl = digitou.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (palavra) => {
    imprimirPalavra(palavra);
    rl.close();
});

rl.setPrompt('Digite uma palavra: ');
rl.prompt();

// Atividade: linkar saída do console para a tag p