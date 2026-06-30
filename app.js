/*
====================================
Finanças da Família
Versão: 0.8.0-beta
Arquivo: app.js
====================================
*/

const STORAGE_USUARIO = "financas_usuario";

const PLACEHOLDERS = [
    "Ex.: giassi 40 cc",
    "Ex.: notebook 12x 300",
    "Ex.: internet 119 mensal",
    "Ex.: salário 5300 pix"
];

const LIMITE_HISTORICO = 15;

const input = document.getElementById("inputMovimento");
const botao = document.getElementById("btnContinuar");
const btnTrocarUsuario = document.getElementById("btnTrocarUsuario");

const telaRegistro = document.getElementById("telaRegistro");
const telaDashboard = document.getElementById("telaDashboard");
const telaHistorico = document.getElementById("telaHistorico");

const navRegistro = document.getElementById("navRegistro");
const navDashboard = document.getElementById("navDashboard");
const navHistorico = document.getElementById("navHistorico");

const btnAtualizarDashboard = document.getElementById("btnAtualizarDashboard");

const modalUsuario = document.getElementById("modalUsuario");
const modal = document.getElementById("modalConfirmacao");
const btnEditar = document.getElementById("btnEditar");
const btnConfirmar = document.getElementById("btnConfirmar");

const confirmTipo = document.getElementById("confirmTipo");
const confirmDescricao = document.getElementById("confirmDescricao");
const confirmCategoria = document.getElementById("confirmCategoria");
const confirmValor = document.getElementById("confirmValor");
const confirmPagamento = document.getElementById("confirmPagamento");
const confirmDetalhesExtras = document.getElementById("confirmDetalhesExtras");
const iconeDescricao = document.getElementById("iconeDescricao");
const iconeCategoria = document.getElementById("iconeCategoria");

const toast = document.getElementById("toast");
const toastMensagem = document.getElementById("toastMensagem");

const dashboardMesNome = document.getElementById("dashboardMesNome");
const dashboardAno = document.getElementById("dashboardAno");
const btnMesAnterior = document.getElementById("btnMesAnterior");
const btnMesProximo = document.getElementById("btnMesProximo");

const totalReceitas = document.getElementById("totalReceitas");
const totalDespesas = document.getElementById("totalDespesas");
const saldoMes = document.getElementById("saldoMes");

const listaCategorias = document.getElementById("listaCategorias");
const listaParcelas = document.getElementById("listaParcelas");
const listaUltimos = document.getElementById("listaUltimos");

const historicoMesNome = document.getElementById("historicoMesNome");
const historicoAno = document.getElementById("historicoAno");
const listaHistorico = document.getElementById("listaHistorico");
const btnHistoricoAnterior = document.getElementById("btnHistoricoAnterior");
const btnHistoricoProximo = document.getElementById("btnHistoricoProximo");
const historicoPaginaInfo = document.getElementById("historicoPaginaInfo");

let dadosInterpretados = null;
let toastTimer = null;
let usuarioAtual = localStorage.getItem(STORAGE_USUARIO) || "";
let placeholderIndex = 0;
let placeholderTimer = null;

const dataHoje = new Date();
let mesSelecionado = dataHoje.getMonth();
let anoSelecionado = dataHoje.getFullYear();

let paginaHistorico = 1;
let totalPaginasHistorico = 1;

function iniciarApp() {
    atualizarUsuarioNaTela();
    iniciarPlaceholders();
    atualizarSeletorMes();

    if (!usuarioAtual) {
        abrirModalUsuario();
    } else {
        input.focus();
    }

    carregarDashboard();
}

function abrirModalUsuario() {
    modalUsuario.classList.remove("oculto");
}

function fecharModalUsuario() {
    modalUsuario.classList.add("oculto");
    input.focus();
}

function selecionarUsuario(nome) {
    usuarioAtual = nome;
    localStorage.setItem(STORAGE_USUARIO, nome);
    atualizarUsuarioNaTela();
    fecharModalUsuario();
    mostrarToast(`Usuário: ${nome}`, "sucesso");
}

function atualizarUsuarioNaTela() {
    btnTrocarUsuario.textContent = usuarioAtual || "Escolher usuário";
}

async function continuar() {
    const texto = input.value.trim();

    if (!usuarioAtual) {
        abrirModalUsuario();
        mostrarToast("Escolha quem está usando.", "erro");
        return;
    }

    if (texto === "") {
        mostrarToast("Digite uma movimentação.", "erro");
        input.focus();
        return;
    }

    setBotaoCarregando(botao, "Interpretando...");

    const resposta = await backendInterpretar(texto, usuarioAtual);

    restaurarBotao(botao, "Continuar");

    if (!resposta || !resposta.ok) {
        mostrarToast("Não consegui interpretar essa movimentação.", "erro");
        input.focus();
        return;
    }

    dadosInterpretados = {
        ...resposta.dados,
        _categoriaOriginal: resposta.dados.categoria || "Outros",
        _textoOriginal: texto
    };

    mostrarConfirmacao(dadosInterpretados);
}

function mostrarConfirmacao(dados) {
    const ehReceita = dados.tipo === "Receita";

    confirmTipo.textContent = ehReceita ? "Receita" : "Despesa";
    confirmTipo.className = "tipo-lancamento";
    confirmTipo.classList.add(ehReceita ? "tipo-receita" : "tipo-despesa");

    iconeDescricao.textContent = obterIconeCategoria(dados.categoria, dados.tipo);
    iconeCategoria.textContent = "🏷";

    confirmDescricao.textContent = capitalizar(dados.descricao || "Sem descrição");
    confirmCategoria.textContent = dados.categoria || "Outros";
    confirmValor.textContent = formatarMoeda(dados.valor || dados.valorParcela || dados.valorTotal || 0);
    confirmPagamento.textContent = dados.pagamento || "Não informado";

    preencherDetalhesExtras(dados);
    modal.classList.remove("oculto");
}

function preencherDetalhesExtras(dados) {
    confirmDetalhesExtras.classList.add("oculto");
    confirmDetalhesExtras.innerHTML = "";

    if (dados.parcelado) {
        confirmDetalhesExtras.classList.remove("oculto");
        confirmDetalhesExtras.innerHTML = `
            <div><strong>💳 ${dados.totalParcelas}x de ${formatarMoeda(dados.valorParcela)}</strong></div>
            <div>💰 Total: ${formatarMoeda(dados.valorTotal)}</div>
        `;
    }

    if (dados.recorrente) {
        confirmDetalhesExtras.classList.remove("oculto");
        confirmDetalhesExtras.innerHTML += `
            <div><strong>🔁 Conta fixa mensal</strong></div>
            <div>Será considerada todo mês no resumo.</div>
        `;
    }
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

    setBotaoCarregando(btnConfirmar, "Salvando...");
    btnEditar.disabled = true;

    const resposta = await backendSalvar({
        pessoa: usuarioAtual,
        ...dadosInterpretados
    });

    btnEditar.disabled = false;

    if (!resposta || !resposta.ok) {
        restaurarBotao(btnConfirmar, "Salvar");
        mostrarToast("Não consegui salvar o lançamento.", "erro");
        return;
    }

    const aprendeuCategoria = await aprenderCategoriaSeNecessario();
    mostrarToast(mensagemSucesso(dadosInterpretados, aprendeuCategoria), "sucesso");

    setTimeout(() => {
        fecharModal();
        input.value = "";
        input.focus();
        dadosInterpretados = null;
        restaurarBotao(btnConfirmar, "Salvar");
        carregarDashboard(false);
        carregarHistorico(false);
    }, 450);
}

function mensagemSucesso(dados, aprendeuCategoria = false) {
    if (aprendeuCategoria) return "Salvo. Categoria aprendida.";
    if (dados.parcelado) return "Parcelas registradas.";
    if (dados.recorrente) return "Conta fixa cadastrada.";
    return "Lançamento salvo.";
}

async function aprenderCategoriaSeNecessario() {
    if (!dadosInterpretados) return false;

    const categoriaOriginal = normalizarTextoComparacao(dadosInterpretados._categoriaOriginal || "Outros");
    const categoriaAtual = normalizarTextoComparacao(dadosInterpretados.categoria || "Outros");

    if (!categoriaAtual || categoriaOriginal === categoriaAtual) {
        return false;
    }

    const textoBase = dadosInterpretados._textoOriginal || dadosInterpretados.descricao || "";

    const resposta = await backendAprenderCategoria({
        palavra: textoBase,
        categoria: dadosInterpretados.categoria
    });

    return Boolean(
        resposta &&
        resposta.ok &&
        resposta.resultado &&
        resposta.resultado.aprendido
    );
}

function editarCampo(campo) {
    if (!dadosInterpretados) return;

    const atual = dadosInterpretados[campo] || "";
    let novoValor = null;

    if (campo === "valor") {
        const valorBase = dadosInterpretados.valor || dadosInterpretados.valorParcela || dadosInterpretados.valorTotal || 0;
        novoValor = prompt("Novo valor:", String(valorBase).replace(".", ","));
        if (novoValor === null) return;

        const numero = normalizarNumero(novoValor);

        if (!numero || numero <= 0) {
            mostrarToast("Valor inválido.", "erro");
            return;
        }

        if (dadosInterpretados.parcelado) {
            dadosInterpretados.valorParcela = numero;
            dadosInterpretados.valorTotal = numero * Number(dadosInterpretados.totalParcelas || 1);
            dadosInterpretados.valor = numero;
        } else {
            dadosInterpretados.valor = numero;
        }
    } else if (campo === "pagamento") {
        novoValor = prompt("Pagamento (Pix, Cartão de crédito, Cartão de débito, Dinheiro, VA, VC, VT):", atual);
        if (novoValor === null) return;
        dadosInterpretados.pagamento = normalizarPagamento(novoValor);
    } else if (campo === "categoria") {
        novoValor = prompt("Categoria:", atual);
        if (novoValor === null) return;
        dadosInterpretados.categoria = capitalizar(novoValor.trim() || "Outros");
    } else if (campo === "descricao") {
        novoValor = prompt("Descrição:", atual);
        if (novoValor === null) return;
        dadosInterpretados.descricao = novoValor.trim() || "Sem descrição";
    }

    mostrarConfirmacao(dadosInterpretados);
}

async function carregarDashboard(mostrarMensagem = false) {
    atualizarSeletorMes();

    listaCategorias.textContent = "Carregando...";
    listaCategorias.classList.add("vazio");

    if (listaParcelas) {
        listaParcelas.textContent = "Carregando...";
        listaParcelas.classList.add("vazio");
    }

    listaUltimos.textContent = "Carregando...";
    listaUltimos.classList.add("vazio");

    const resposta = await backendDashboard(mesSelecionado, anoSelecionado);

    if (!resposta || !resposta.ok) {
        listaCategorias.textContent = "Não consegui carregar o resumo.";

        if (listaParcelas) {
            listaParcelas.textContent = "Não consegui carregar as parcelas.";
        }

        listaUltimos.textContent = "Não consegui carregar os últimos lançamentos.";

        if (mostrarMensagem) mostrarToast("Erro ao carregar resumo.", "erro");
        return;
    }

    renderizarDashboard(resposta.dados);
    atualizarSeletorMes();

    if (mostrarMensagem) mostrarToast("Resumo atualizado.", "sucesso");
}

function renderizarDashboard(dados) {
    if (typeof dados.mesNumero === "number") {
        mesSelecionado = dados.mesNumero;
    }

    if (typeof dados.ano === "number") {
        anoSelecionado = dados.ano;
    }

    dashboardMesNome.textContent = dados.mes || obterNomeMes(mesSelecionado);
    dashboardAno.textContent = String(anoSelecionado);

    totalReceitas.textContent = formatarMoeda(dados.receitas || 0);
    totalDespesas.textContent = formatarMoeda(dados.despesas || 0);
    saldoMes.textContent = formatarMoeda(dados.saldo || 0);

    saldoMes.parentElement.classList.toggle("positivo", Number(dados.saldo) >= 0);
    saldoMes.parentElement.classList.toggle("negativo", Number(dados.saldo) < 0);

    renderizarCategorias(dados.categorias || []);
    renderizarParcelas(dados.parcelas || []);
    renderizarUltimos(dados.ultimos || []);
}

function renderizarCategorias(categorias) {
    listaCategorias.innerHTML = "";

    if (!categorias.length) {
        listaCategorias.textContent = "Nenhuma despesa registrada neste mês.";
        listaCategorias.classList.add("vazio");
        return;
    }

    listaCategorias.classList.remove("vazio");

    categorias.forEach(item => {
        const div = document.createElement("div");
        div.className = "item-dashboard";
        div.innerHTML = `
            <div>
                <span class="principal">${obterIconeCategoria(item.categoria)} ${item.categoria}</span>
                <span class="secundario">${item.quantidade} lançamento(s)</span>
            </div>
            <span class="valor negativo">${formatarMoeda(item.total)}</span>
        `;
        listaCategorias.appendChild(div);
    });
}

function renderizarParcelas(parcelas) {
    if (!listaParcelas) return;

    listaParcelas.innerHTML = "";

    if (!parcelas.length) {
        listaParcelas.textContent = "Nenhuma compra parcelada neste mês.";
        listaParcelas.classList.add("vazio");
        return;
    }

    listaParcelas.classList.remove("vazio");

    parcelas.forEach(item => {
        const div = document.createElement("div");
        div.className = "item-dashboard";

        div.innerHTML = `
            <div>
                <span class="principal">${obterIconeCategoria(item.categoria)} ${capitalizar(item.descricao)}</span>
                <span class="secundario">${item.parcela || ""} • ${item.categoria || "Outros"}</span>
            </div>
            <span class="valor negativo">${formatarMoeda(item.valor)}</span>
        `;

        listaParcelas.appendChild(div);
    });
}

function renderizarUltimos(ultimos) {
    listaUltimos.innerHTML = "";

    if (!ultimos.length) {
        listaUltimos.textContent = "Nenhum lançamento recente.";
        listaUltimos.classList.add("vazio");
        return;
    }

    listaUltimos.classList.remove("vazio");

    ultimos.forEach(item => {
        const ehReceita = item.tipo === "Receita";
        const div = document.createElement("div");
        div.className = "item-dashboard";
        div.innerHTML = `
            <div>
                <span class="principal">${obterIconeCategoria(item.categoria, item.tipo)} ${capitalizar(item.descricao)}</span>
                <span class="secundario">${item.pessoa || ""} • ${item.categoria || "Outros"}</span>
            </div>
            <span class="valor ${ehReceita ? "positivo" : "negativo"}">${ehReceita ? "+" : "-"}${formatarMoeda(item.valor)}</span>
        `;
        listaUltimos.appendChild(div);
    });
}

async function carregarHistorico(mostrarMensagem = false) {
    if (!listaHistorico) return;

    atualizarCabecalhoHistorico();

    listaHistorico.textContent = "Carregando...";
    listaHistorico.classList.add("vazio");

    const resposta = await backendHistorico(
        mesSelecionado,
        anoSelecionado,
        paginaHistorico,
        LIMITE_HISTORICO
    );

    if (!resposta || !resposta.ok) {
        listaHistorico.textContent = "Não consegui carregar o histórico.";
        if (mostrarMensagem) mostrarToast("Erro ao carregar histórico.", "erro");
        return;
    }

    renderizarHistorico(resposta.dados);

    if (mostrarMensagem) mostrarToast("Histórico atualizado.", "sucesso");
}

function renderizarHistorico(dados) {
    if (!listaHistorico) return;

    paginaHistorico = Number(dados.pagina || 1);
    totalPaginasHistorico = Number(dados.totalPaginas || 1);

    atualizarCabecalhoHistorico();

    listaHistorico.innerHTML = "";

    const itens = dados.itens || [];

    if (!itens.length) {
        listaHistorico.textContent = "Nenhum lançamento neste mês.";
        listaHistorico.classList.add("vazio");
        atualizarPaginacaoHistorico();
        return;
    }

    listaHistorico.classList.remove("vazio");

    itens.forEach(item => {
        const ehReceita = item.tipo === "Receita";
        const div = document.createElement("div");
        div.className = "item-dashboard item-historico";

        div.innerHTML = `
            <div>
                <span class="principal">${obterIconeCategoria(item.categoria, item.tipo)} ${capitalizar(item.descricao)}</span>
                <span class="secundario">${formatarDataCurta(item.data)} • ${item.pessoa || ""} • ${item.categoria || "Outros"}${item.parcela ? " • " + item.parcela : ""}</span>
            </div>
            <span class="valor ${ehReceita ? "positivo" : "negativo"}">${ehReceita ? "+" : "-"}${formatarMoeda(item.valor)}</span>
        `;

        listaHistorico.appendChild(div);
    });

    atualizarPaginacaoHistorico();
}

function atualizarCabecalhoHistorico() {
    if (historicoMesNome) {
        historicoMesNome.textContent = obterNomeMes(mesSelecionado);
    }

    if (historicoAno) {
        historicoAno.textContent = String(anoSelecionado);
    }
}

function atualizarPaginacaoHistorico() {
    if (historicoPaginaInfo) {
        historicoPaginaInfo.textContent = `Página ${paginaHistorico} de ${totalPaginasHistorico}`;
    }

    if (btnHistoricoAnterior) {
        btnHistoricoAnterior.disabled = paginaHistorico <= 1;
    }

    if (btnHistoricoProximo) {
        btnHistoricoProximo.disabled = paginaHistorico >= totalPaginasHistorico;
    }
}

function historicoAnterior() {
    if (paginaHistorico <= 1) return;

    paginaHistorico--;
    carregarHistorico();
}

function historicoProximo() {
    if (paginaHistorico >= totalPaginasHistorico) return;

    paginaHistorico++;
    carregarHistorico();
}

function mesAnterior() {
    mesSelecionado--;

    if (mesSelecionado < 0) {
        mesSelecionado = 11;
        anoSelecionado--;
    }

    paginaHistorico = 1;
    carregarDashboard();
    carregarHistorico();
}

function mesProximo() {
    if (estaNoMesAtualOuFuturo()) {
        return;
    }

    mesSelecionado++;

    if (mesSelecionado > 11) {
        mesSelecionado = 0;
        anoSelecionado++;
    }

    paginaHistorico = 1;
    carregarDashboard();
    carregarHistorico();
}

function atualizarSeletorMes() {
    if (dashboardMesNome) {
        dashboardMesNome.textContent = obterNomeMes(mesSelecionado);
    }

    if (dashboardAno) {
        dashboardAno.textContent = String(anoSelecionado);
    }

    atualizarCabecalhoHistorico();

    if (btnMesProximo) {
        btnMesProximo.disabled = estaNoMesAtualOuFuturo();
    }
}

function estaNoMesAtualOuFuturo() {
    return anoSelecionado > dataHoje.getFullYear() ||
        (anoSelecionado === dataHoje.getFullYear() && mesSelecionado >= dataHoje.getMonth());
}

function obterNomeMes(mes) {
    const meses = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ];

    return meses[mes] || "Resumo";
}

function trocarTela(tela) {
    const dashboardAtivo = tela === "dashboard";
    const historicoAtivo = tela === "historico";
    const registroAtivo = tela === "registro";

    telaRegistro.classList.toggle("ativa", registroAtivo);
    telaDashboard.classList.toggle("ativa", dashboardAtivo);

    if (telaHistorico) {
        telaHistorico.classList.toggle("ativa", historicoAtivo);
    }

    navRegistro.classList.toggle("ativo", registroAtivo);
    navDashboard.classList.toggle("ativo", dashboardAtivo);

    if (navHistorico) {
        navHistorico.classList.toggle("ativo", historicoAtivo);
    }

    if (dashboardAtivo) {
        carregarDashboard();
    } else if (historicoAtivo) {
        carregarHistorico();
    } else {
        setTimeout(() => input.focus(), 80);
    }
}

function mostrarToast(mensagem, tipo = "sucesso") {
    toastMensagem.textContent = mensagem;
    toast.className = "toast";
    toast.classList.add(tipo, "mostrar");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("mostrar");
    }, 2200);
}

function setBotaoCarregando(botaoAlvo, texto) {
    botaoAlvo.dataset.textoOriginal = botaoAlvo.textContent;
    botaoAlvo.textContent = texto;
    botaoAlvo.disabled = true;
}

function restaurarBotao(botaoAlvo, textoPadrao) {
    botaoAlvo.textContent = textoPadrao || botaoAlvo.dataset.textoOriginal || "Salvar";
    botaoAlvo.disabled = false;
}

function normalizarTextoComparacao(texto) {
    return removerAcentos(String(texto || "").toLowerCase()).trim();
}

function normalizarNumero(valor) {
    const limpo = String(valor).replace(/[^\d,\.]/g, "").replace(",", ".");
    return Number(limpo);
}

function normalizarPagamento(valor) {
    const raw = removerAcentos(String(valor).toLowerCase());

    if (raw.includes("pix")) return "Pix";
    if (raw.includes("debito") || raw === "cd") return "Cartão de débito";
    if (raw.includes("credito") || raw === "cc") return "Cartão de crédito";
    if (raw.includes("dinheiro") || raw === "din") return "Dinheiro";
    if (raw === "va" || raw.includes("vale alimentacao")) return "Vale alimentação";
    if (raw === "vc" || raw.includes("vale combustivel")) return "Vale combustível";
    if (raw === "vt" || raw.includes("vale transporte")) return "Vale transporte";

    return capitalizar(valor.trim() || "Não informado");
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarDataCurta(data) {
    const d = new Date(data);

    if (isNaN(d.getTime())) {
        return "";
    }

    return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit"
    });
}

function capitalizar(texto) {
    const valor = String(texto || "").trim();
    if (!valor) return "";
    return valor.charAt(0).toUpperCase() + valor.slice(1);
}

function removerAcentos(texto) {
    return String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function obterIconeCategoria(categoria = "", tipo = "") {
    if (tipo === "Receita") return "💵";

    const raw = removerAcentos(categoria.toLowerCase());

    if (raw.includes("mercado")) return "🛒";
    if (raw.includes("alimentacao") || raw.includes("restaurante")) return "🍔";
    if (raw.includes("combustivel")) return "⛽";
    if (raw.includes("saude")) return "💊";
    if (raw.includes("casa")) return "🏠";
    if (raw.includes("lazer")) return "🎮";
    if (raw.includes("eletronico")) return "💻";
    if (raw.includes("recebimento")) return "💵";

    return "🏷";
}

function iniciarPlaceholders() {
    if (!input) return;

    input.placeholder = PLACEHOLDERS[0];

    clearInterval(placeholderTimer);

    placeholderTimer = setInterval(() => {
        if (document.activeElement === input && input.value.trim()) return;

        placeholderIndex = (placeholderIndex + 1) % PLACEHOLDERS.length;
        input.placeholder = PLACEHOLDERS[placeholderIndex];
    }, 2800);
}

botao.addEventListener("click", continuar);

input.addEventListener("keydown", event => {
    if (event.key === "Enter") continuar();
});

btnEditar.addEventListener("click", fecharModal);
btnConfirmar.addEventListener("click", salvarLancamento);
btnTrocarUsuario.addEventListener("click", abrirModalUsuario);
btnAtualizarDashboard.addEventListener("click", () => carregarDashboard(true));
btnMesAnterior.addEventListener("click", mesAnterior);
btnMesProximo.addEventListener("click", mesProximo);

if (btnHistoricoAnterior) {
    btnHistoricoAnterior.addEventListener("click", historicoAnterior);
}

if (btnHistoricoProximo) {
    btnHistoricoProximo.addEventListener("click", historicoProximo);
}

navRegistro.addEventListener("click", () => trocarTela("registro"));
navDashboard.addEventListener("click", () => trocarTela("dashboard"));

if (navHistorico) {
    navHistorico.addEventListener("click", () => trocarTela("historico"));
}

modalUsuario.querySelectorAll(".btn-opcao-usuario").forEach(botaoUsuario => {
    botaoUsuario.addEventListener("click", () => selecionarUsuario(botaoUsuario.dataset.usuario));
});

modal.querySelectorAll(".recibo-linha").forEach(linha => {
    linha.addEventListener("click", () => editarCampo(linha.dataset.edit));
});

iniciarApp();
