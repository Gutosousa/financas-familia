/*
====================================
Finanças da Família
Versão: 0.2.4
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

let dadosInterpretados = null;

async function continuar() {
    const texto = input.value.trim();

    if (texto === "") {
        alert("Digite uma movimentação.");
        input.focus();
        return;
    }

    botao.textContent = "Interpretando...";
    botao.disabled = true;

    const resposta = await backendInterpretar(texto);

    botao.textContent = "Continuar";
    botao.disabled = false;

    if (!resposta || !resposta.ok) {
        alert("Não consegui interpretar essa movimentação.");
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
        alert("Nenhum lançamento para salvar.");
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
        alert("Não consegui salvar o lançamento.");
        return;
    }

    btnConfirmar.textContent = "✓ Salvo";

    setTimeout(() => {
        fecharModal();

        input.value = "";
        input.focus();

        dadosInterpretados = null;

        btnConfirmar.textContent = "Salvar";
    }, 800);
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