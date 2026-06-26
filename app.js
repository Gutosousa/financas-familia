/*
====================================
Finanças da Família
Versão: 0.3.1
Arquivo: app.js
====================================
*/

const input = document.getElementById("inputMovimento");
const botao = document.getElementById("btnContinuar");

const modal = document.getElementById("modalConfirmacao");
const btnEditar = document.getElementById("btnEditar");
const btnConfirmar = document.getElementById("btnConfirmar");

const confirmTipo = document.getElementById("confirmTipo");
const confirmDescricao = document.getElementById("confirmDescricao");
const confirmCategoria = document.getElementById("confirmCategoria");
const confirmValor = document.getElementById("confirmValor");
const confirmPagamento = document.getElementById("confirmPagamento");

const toast = document.getElementById("toast");
const toastMensagem = document.getElementById("toastMensagem");

let dadosInterpretados = null;
let toastTimer = null;

async function continuar() {
    const texto = input.value.trim();

    if (texto === "") {
        mostrarToast("Digite uma movimentação.", "erro");
        input.focus();
        return;
    }

    botao.textContent = "Interpretando...";
    botao.disabled = true;

    const resposta = await backendInterpretar(texto);

    botao.textContent = "Continuar";
    botao.disabled = false;

    if (!resposta || !resposta.ok) {
        mostrarToast("Não consegui interpretar essa movimentação.", "erro");
        input.focus();
        return;
    }

    dadosInterpretados = resposta.dados;

    mostrarConfirmacao(dadosInterpretados);
}

function mostrarConfirmacao(dados) {
    confirmTipo.textContent = dados.tipo === "Receita" ? "🟢 Receita" : "🔴 Despesa";

    confirmTipo.className = "tipo-lancamento";

    if (dados.tipo === "Receita") {
        confirmTipo.classList.add("tipo-receita");
    } else {
        confirmTipo.classList.add("tipo-despesa");
    }

    confirmDescricao.textContent = dados.descricao || "Sem descrição";
    confirmCategoria.textContent = dados.categoria;
    confirmValor.textContent = formatarMoeda(dados.valor);
    confirmPagamento.textContent = dados.pagamento;

    modal.classList.remove("oculto");
}

function fecharModal() {
    modal.classList.add("oculto");
    input.focus();
}

async function salvarLancamento() {
    if (!dadosInterpretados) {
        mostrarToast("Nenhum lançamento para salvar.", "erro");
        return;
    }

    btnConfirmar.textContent = "Salvando...";
    btnConfirmar.disabled = true;
    btnEditar.disabled = true;

    const resposta = await backendSalvar({
        pessoa: "Augusto",
        ...dadosInterpretados
    });

    btnConfirmar.disabled = false;
    btnEditar.disabled = false;

    if (!resposta || !resposta.ok) {
        btnConfirmar.textContent = "Salvar";
        mostrarToast("Não consegui salvar o lançamento.", "erro");
        return;
    }

    mostrarToast("Lançamento salvo.", "sucesso");

    setTimeout(() => {
        fecharModal();

        input.value = "";
        input.focus();

        dadosInterpretados = null;

        btnConfirmar.textContent = "Salvar";
    }, 500);
}

function mostrarToast(mensagem, tipo = "sucesso") {
    toastMensagem.textContent = mensagem;

    toast.className = "toast";
    toast.classList.add(tipo);
    toast.classList.add("mostrar");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("mostrar");
    }, 2200);
}

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

botao.addEventListener("click", continuar);

input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        continuar();
    }
});

btnEditar.addEventListener("click", fecharModal);

btnConfirmar.addEventListener("click", salvarLancamento);
