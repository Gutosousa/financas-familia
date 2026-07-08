/*
====================================
Finanças da Família
Versão: 0.9.5-beta
Arquivo: app.js
====================================
*/

const STORAGE_USUARIO = "financas_usuario";
const STORAGE_CATEGORIAS_CONFIG = "financas_categorias_config";

const PLACEHOLDERS = [
    "Ex.: giassi 40 cc",
    "Ex.: notebook 12x 300",
    "Ex.: internet 119 mensal",
    "Ex.: salário 5300 pix"
];

const LIMITE_HISTORICO = 200;

const TIPOS_LANCAMENTO = ["Despesa", "Receita"];

const PAGAMENTOS_BASE = [
    "Pix",
    "Cartão de crédito",
    "Cartão de débito",
    "Dinheiro",
    "Vale alimentação",
    "Vale combustível",
    "Vale transporte",
    "Não informado"
];

const CATEGORIAS_BASE = [
    "Mercado",
    "Alimentação",
    "Combustível",
    "Carro",
    "Casa",
    "Saúde",
    "Eletrônicos",
    "Lazer",
    "Benefícios",
    "Recebimento",
    "Outros"
];

const EMOJIS_CATEGORIAS_PADRAO = {
    "Mercado": "🛒",
    "Alimentação": "🍔",
    "Combustível": "⛽",
    "Carro": "🚗",
    "Casa": "🏠",
    "Saúde": "💊",
    "Eletrônicos": "💻",
    "Lazer": "🎮",
    "Benefícios": "🎁",
    "Recebimento": "💵",
    "Outros": "🏷"
};

const EMOJIS_DISPONIVEIS = [
    "🛒", "🍔", "🍕", "🥩", "🥗", "☕", "⛽", "🚗", "🏍️", "🚌",
    "🏠", "⚡", "💧", "🌐", "📱", "💻", "🎮", "🎬", "💊", "🐶",
    "👶", "🎓", "💼", "✈️", "🎁", "💵", "🏋️", "🛠️", "❤️", "🏷"
];

let categoriasPersonalizadas = [];
let categoriasConfig = carregarCategoriasConfig();

const DIAS_VENCIMENTO = Array.from({ length: 31 }, (_, index) => String(index + 1));
const TIPOS_VALOR_CONTA = ["Fixo", "Variável"];

const input = document.getElementById("inputMovimento");
const botao = document.getElementById("btnContinuar");
const btnTrocarUsuario = document.getElementById("btnTrocarUsuario");

const telaRegistro = document.getElementById("telaRegistro");
const telaDashboard = document.getElementById("telaDashboard");
const telaHistorico = document.getElementById("telaHistorico");
const telaConfiguracoes = document.getElementById("telaConfiguracoes");

const navRegistro = document.getElementById("navRegistro");
const navDashboard = document.getElementById("navDashboard");
const navHistorico = document.getElementById("navHistorico");
const navConfiguracoes = document.getElementById("navConfiguracoes");

const btnAtualizarDashboard = document.getElementById("btnAtualizarDashboard");

const modalUsuario = document.getElementById("modalUsuario");
const modal = document.getElementById("modalConfirmacao");
const btnEditar = document.getElementById("btnEditar");
const btnConfirmar = document.getElementById("btnConfirmar");

const confirmTipo = document.getElementById("confirmTipo");
const confirmTipoEditavel = document.getElementById("confirmTipoEditavel");
const confirmDescricao = document.getElementById("confirmDescricao");
const confirmCategoria = document.getElementById("confirmCategoria");
const confirmValor = document.getElementById("confirmValor");
const confirmPagamento = document.getElementById("confirmPagamento");
const confirmDetalhesExtras = document.getElementById("confirmDetalhesExtras");
const iconeDescricao = document.getElementById("iconeDescricao");
const iconeCategoria = document.getElementById("iconeCategoria");

const modalOpcoes = document.getElementById("modalOpcoes");
const modalOpcoesTitulo = document.getElementById("modalOpcoesTitulo");
const modalOpcoesLista = document.getElementById("modalOpcoesLista");
const btnFecharOpcoes = document.getElementById("btnFecharOpcoes");

const loadingOverlay = document.getElementById("loadingOverlay");
const loadingMensagem = document.getElementById("loadingMensagem");

const toast = document.getElementById("toast");
const toastMensagem = document.getElementById("toastMensagem");

const dashboardMesNome = document.getElementById("dashboardMesNome");
const dashboardAno = document.getElementById("dashboardAno");
const btnMesAnterior = document.getElementById("btnMesAnterior");
const btnMesProximo = document.getElementById("btnMesProximo");

const totalReceitas = document.getElementById("totalReceitas");
const totalDespesas = document.getElementById("totalDespesas");
const totalPendentes = document.getElementById("totalPendentes");
const saldoMes = document.getElementById("saldoMes");
const saldoAposPendentes = document.getElementById("saldoAposPendentes");

const listaCategorias = document.getElementById("listaCategorias");
const cardContasPendentes = document.getElementById("cardContasPendentes");
const listaContasPendentes = document.getElementById("listaContasPendentes");
const cardBeneficios = document.getElementById("cardBeneficios");
const listaBeneficios = document.getElementById("listaBeneficios");
const cardCartaoCredito = document.getElementById("cardCartaoCredito");
const totalCartaoCredito = document.getElementById("totalCartaoCredito");
const listaCartaoCredito = document.getElementById("listaCartaoCredito");
const btnDetalhesCartao = document.getElementById("btnDetalhesCartao");
const listaParcelas = document.getElementById("listaParcelas");
const btnDetalhesParcelas = document.getElementById("btnDetalhesParcelas");
const totalParcelasMes = document.getElementById("totalParcelasMes");
const parcelasResumoTitulo = document.getElementById("parcelasResumoTitulo");
const listaUltimos = document.getElementById("listaUltimos");

const modalDetalhes = document.getElementById("modalDetalhes");
const modalDetalhesTitulo = document.getElementById("modalDetalhesTitulo");
const modalDetalhesSubtitulo = document.getElementById("modalDetalhesSubtitulo");
const modalDetalhesConteudo = document.getElementById("modalDetalhesConteudo");
const btnFecharDetalhes = document.getElementById("btnFecharDetalhes");

const buscaHistorico = document.getElementById("buscaHistorico");
const botoesFiltroHistorico = document.querySelectorAll(".filtro-historico");

const historicoMesNome = document.getElementById("historicoMesNome");
const historicoAno = document.getElementById("historicoAno");
const listaHistorico = document.getElementById("listaHistorico");
const btnHistoricoAnterior = document.getElementById("btnHistoricoAnterior");
const btnHistoricoProximo = document.getElementById("btnHistoricoProximo");
const historicoPaginaInfo = document.getElementById("historicoPaginaInfo");

const listaCategoriasConfig = document.getElementById("listaCategoriasConfig");
const btnNovaCategoriaConfig = document.getElementById("btnNovaCategoriaConfig");

let dadosInterpretados = null;
let toastTimer = null;
let usuarioAtual = localStorage.getItem(STORAGE_USUARIO) || "";
let placeholderIndex = 0;
let placeholderTimer = null;
let modalOpcoesCancelamento = null;

const dataHoje = new Date();
let mesSelecionado = dataHoje.getMonth();
let anoSelecionado = dataHoje.getFullYear();

let paginaHistorico = 1;
let totalPaginasHistorico = 1;
let detalhesCartaoCredito = [];
let detalhesParcelas = [];
let itensHistoricoAtuais = [];
let filtroHistoricoAtual = "todos";
let buscaHistoricoAtual = "";


function carregarCategoriasConfig() {
    try {
        const salvo = JSON.parse(localStorage.getItem(STORAGE_CATEGORIAS_CONFIG) || "{}");
        return {
            ...EMOJIS_CATEGORIAS_PADRAO,
            ...salvo
        };
    } catch (erro) {
        return { ...EMOJIS_CATEGORIAS_PADRAO };
    }
}

function salvarCategoriasConfig() {
    localStorage.setItem(STORAGE_CATEGORIAS_CONFIG, JSON.stringify(categoriasConfig));
}

function obterTodasCategoriasConfig() {
    return [...new Set([
        ...CATEGORIAS_BASE,
        ...categoriasPersonalizadas,
        ...Object.keys(categoriasConfig || {})
    ].filter(Boolean))];
}

function renderizarConfiguracoes() {
    renderizarCategoriasConfig();
}

function renderizarCategoriasConfig() {
    if (!listaCategoriasConfig) return;

    listaCategoriasConfig.innerHTML = "";

    obterTodasCategoriasConfig().forEach(categoria => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "config-linha categoria-config";
        botao.dataset.categoria = categoria;
        botao.innerHTML = `
            <span>${obterIconeCategoria(categoria)} ${categoria}</span>
            <small>Trocar emoji ›</small>
        `;
        listaCategoriasConfig.appendChild(botao);
    });
}

function trocarEmojiCategoria(categoria) {
    abrirModalOpcoes(`Emoji para ${categoria}`, EMOJIS_DISPONIVEIS, emojiSelecionado => {
        categoriasConfig[categoria] = emojiSelecionado;
        salvarCategoriasConfig();
        renderizarCategoriasConfig();
        renderizarDashboardCache();
        renderizarHistoricoFiltrado();
        mostrarToast("Emoji atualizado.", "sucesso");
    }, categoriasConfig[categoria] || obterIconeCategoria(categoria));
}

function criarCategoriaConfiguracao() {
    const nome = prompt("Nome da nova categoria:");

    if (nome === null) return;

    const categoria = capitalizar(nome.trim());

    if (!categoria) {
        mostrarToast("Categoria inválida.", "erro");
        return;
    }

    if (!categoriasPersonalizadas.includes(categoria) && !CATEGORIAS_BASE.includes(categoria)) {
        categoriasPersonalizadas.push(categoria);
    }

    abrirModalOpcoes(`Emoji para ${categoria}`, EMOJIS_DISPONIVEIS, emojiSelecionado => {
        categoriasConfig[categoria] = emojiSelecionado;
        salvarCategoriasConfig();
        renderizarCategoriasConfig();
        mostrarToast("Categoria criada.", "sucesso");
    }, "🏷");
}

function renderizarDashboardCache() {
    // Re-render leve apenas para atualizar ícones quando possível.
    if (itensHistoricoAtuais && itensHistoricoAtuais.length) {
        renderizarHistoricoFiltrado();
    }
}


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
    mostrarLoading("Interpretando lançamento...");

    const resposta = await backendInterpretar(texto, usuarioAtual);

    ocultarLoading();
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
    if (confirmTipoEditavel) {
        confirmTipoEditavel.textContent = ehReceita ? "Receita" : "Despesa";
    }
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
        prepararDadosContaFixa(dados);

        confirmDetalhesExtras.classList.remove("oculto");
        confirmDetalhesExtras.innerHTML += `
            <div class="detalhe-conta-titulo"><strong>🔁 Conta fixa mensal</strong></div>
            <button class="detalhe-acao" type="button" data-extra-edit="diaVencimento">
                <span>📅 Vencimento</span>
                <strong>Dia ${dados.diaVencimento}</strong>
            </button>
            <button class="detalhe-acao" type="button" data-extra-edit="tipoValor">
                <span>💰 Tipo do valor</span>
                <strong>${dados.tipoValor || "Fixo"}</strong>
            </button>
            <button class="detalhe-acao" type="button" data-extra-edit="primeiroVencimento">
                <span>🗓 Primeiro vencimento</span>
                <strong>${formatarMesAno(dados.primeiroMes, dados.primeiroAno)}</strong>
            </button>
        `;
    }
}

function prepararDadosContaFixa(dados) {
    if (!dados.diaVencimento) {
        dados.diaVencimento = dataHoje.getDate();
    }

    dados.diaVencimento = Math.min(Math.max(Number(dados.diaVencimento || 1), 1), 31);

    if (!dados.tipoValor) {
        dados.tipoValor = Number(dados.valor || 0) > 0 ? "Fixo" : "Variável";
    }

    if (typeof dados.primeiroMes !== "number") {
        dados.primeiroMes = mesSelecionado;
    }

    if (typeof dados.primeiroAno !== "number") {
        dados.primeiroAno = anoSelecionado;
    }
}

function editarDetalheContaFixa(campo) {
    if (!dadosInterpretados || !dadosInterpretados.recorrente) return;

    prepararDadosContaFixa(dadosInterpretados);

    if (campo === "diaVencimento") {
        abrirModalOpcoes("Dia do vencimento", DIAS_VENCIMENTO, diaSelecionado => {
            dadosInterpretados.diaVencimento = Number(diaSelecionado);
            mostrarConfirmacao(dadosInterpretados);
        }, String(dadosInterpretados.diaVencimento));

        return;
    }

    if (campo === "tipoValor") {
        abrirModalOpcoes("Tipo do valor", TIPOS_VALOR_CONTA, tipoSelecionado => {
            dadosInterpretados.tipoValor = tipoSelecionado;
            mostrarConfirmacao(dadosInterpretados);
        }, dadosInterpretados.tipoValor || "Fixo");

        return;
    }

    if (campo === "primeiroVencimento") {
        const atual = formatarMesAno(dadosInterpretados.primeiroMes, dadosInterpretados.primeiroAno);
        const valor = prompt("Primeiro vencimento (MM/AAAA):", atual);

        if (valor === null) return;

        const parsed = interpretarMesAno(valor);

        if (!parsed) {
            mostrarToast("Mês inválido. Use MM/AAAA.", "erro");
            return;
        }

        dadosInterpretados.primeiroMes = parsed.mes;
        dadosInterpretados.primeiroAno = parsed.ano;
        mostrarConfirmacao(dadosInterpretados);
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
    mostrarLoading("Salvando lançamento...");
    btnEditar.disabled = true;

    const resposta = await backendSalvar({
        pessoa: usuarioAtual,
        ...dadosInterpretados
    });

    btnEditar.disabled = false;

    if (!resposta || !resposta.ok) {
        ocultarLoading();
        restaurarBotao(btnConfirmar, "Salvar");
        mostrarToast("Não consegui salvar o lançamento.", "erro");
        return;
    }

    const aprendeuCategoria = await aprenderCategoriaSeNecessario();
    ocultarLoading();
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
    if (dados.recorrente) return "Conta fixa cadastrada como pendente.";
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

    if (campo === "tipo") {
        abrirModalOpcoes("Tipo de lançamento", TIPOS_LANCAMENTO, tipoSelecionado => {
            const tipoNormalizado = normalizarTipo(tipoSelecionado);

            if (!tipoNormalizado) {
                mostrarToast("Tipo inválido.", "erro");
                return;
            }

            dadosInterpretados.tipo = tipoNormalizado;

            if (tipoNormalizado === "Receita" && (!dadosInterpretados.categoria || dadosInterpretados.categoria === "Outros")) {
                dadosInterpretados.categoria = "Recebimento";
            }

            if (tipoNormalizado === "Despesa" && dadosInterpretados.categoria === "Recebimento") {
                dadosInterpretados.categoria = "Outros";
            }

            mostrarConfirmacao(dadosInterpretados);
        }, atual);

        return;
    }

    if (campo === "pagamento") {
        abrirModalOpcoes("Forma de pagamento", PAGAMENTOS_BASE, pagamentoSelecionado => {
            dadosInterpretados.pagamento = normalizarPagamento(pagamentoSelecionado);
            mostrarConfirmacao(dadosInterpretados);
        }, atual);

        return;
    }

    if (campo === "categoria") {
        abrirModalOpcoes("Categoria", obterCategoriasDisponiveis(), categoriaSelecionada => {
            if (categoriaSelecionada === "__nova__") {
                criarNovaCategoria();
                return;
            }

            dadosInterpretados.categoria = capitalizar(categoriaSelecionada.trim() || "Outros");
            mostrarConfirmacao(dadosInterpretados);
        }, atual, true);

        return;
    }

    if (campo === "valor") {
        const valorBase = dadosInterpretados.valor || dadosInterpretados.valorParcela || dadosInterpretados.valorTotal || 0;
        const novoValor = prompt("Novo valor:", String(valorBase).replace(".", ","));

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

        mostrarConfirmacao(dadosInterpretados);
        return;
    }

    if (campo === "descricao") {
        const novoValor = prompt("Descrição:", atual);

        if (novoValor === null) return;

        dadosInterpretados.descricao = novoValor.trim() || "Sem descrição";
        mostrarConfirmacao(dadosInterpretados);
    }
}


function escolherPagamentoPagamentoConta() {
    return new Promise(resolve => {
        abrirModalOpcoes("Forma de pagamento", PAGAMENTOS_BASE.filter(item => item !== "Não informado"), pagamentoSelecionado => {
            resolve(normalizarPagamento(pagamentoSelecionado));
        }, "", false, () => resolve(null));
    });
}

async function carregarDashboard(mostrarMensagem = false) {
    atualizarSeletorMes();
    mostrarLoading("Atualizando resumo...");

    listaCategorias.textContent = "Carregando...";
    listaCategorias.classList.add("vazio");

    if (listaContasPendentes) {
        listaContasPendentes.textContent = "Carregando...";
        listaContasPendentes.classList.add("vazio");
    }

    if (listaBeneficios) {
        listaBeneficios.textContent = "Carregando...";
        listaBeneficios.classList.add("vazio");
    }

    if (listaCartaoCredito) {
        listaCartaoCredito.textContent = "Carregando...";
        listaCartaoCredito.classList.add("vazio");
    }

    if (listaParcelas) {
        listaParcelas.textContent = "Carregando...";
        listaParcelas.classList.add("vazio");
    }

    if (listaUltimos) {
        listaUltimos.textContent = "Carregando...";
        listaUltimos.classList.add("vazio");
    }

    const resposta = await backendDashboard(mesSelecionado, anoSelecionado);

    if (!resposta || !resposta.ok) {
        ocultarLoading();
        listaCategorias.textContent = "Não consegui carregar o resumo.";

        if (listaParcelas) {
            listaParcelas.textContent = "Não consegui carregar as parcelas.";
        }

        if (listaUltimos) {
            listaUltimos.textContent = "Não consegui carregar os últimos lançamentos.";
        }

        if (mostrarMensagem) mostrarToast("Erro ao carregar resumo.", "erro");
        return;
    }

    renderizarDashboard(resposta.dados);
    atualizarSeletorMes();
    ocultarLoading();

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
    totalDespesas.textContent = formatarMoeda(dados.despesasPagas ?? dados.despesas ?? 0);

    if (totalPendentes) {
        totalPendentes.textContent = formatarMoeda(dados.pendentes || 0);
    }

    saldoMes.textContent = formatarMoeda(dados.saldo || 0);

    if (saldoAposPendentes) {
        saldoAposPendentes.textContent = formatarMoeda(dados.saldoAposPendentes ?? dados.saldo ?? 0);
        saldoAposPendentes.parentElement.classList.toggle("positivo", Number(dados.saldoAposPendentes ?? dados.saldo) >= 0);
        saldoAposPendentes.parentElement.classList.toggle("negativo", Number(dados.saldoAposPendentes ?? dados.saldo) < 0);
    }

    saldoMes.parentElement.classList.toggle("positivo", Number(dados.saldo) >= 0);
    saldoMes.parentElement.classList.toggle("negativo", Number(dados.saldo) < 0);

    renderizarContasPendentes(dados.contasPendentes || []);
    renderizarBeneficios(dados.beneficios || []);
    renderizarCartaoCredito(dados.cartaoCredito || null);
    renderizarCategorias(dados.categorias || []);
    renderizarParcelas(dados.parcelas || []);

    if (listaUltimos) {
        renderizarUltimos(dados.ultimos || []);
    }
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

function renderizarContasPendentes(contas) {
    if (!cardContasPendentes || !listaContasPendentes) return;

    listaContasPendentes.innerHTML = "";

    if (!contas.length) {
        cardContasPendentes.classList.add("oculto");
        listaContasPendentes.textContent = "Nenhuma conta fixa neste mês.";
        listaContasPendentes.classList.add("vazio");
        return;
    }

    cardContasPendentes.classList.remove("oculto");
    listaContasPendentes.classList.remove("vazio");

    contas.forEach(conta => {
        const statusNormalizado = normalizarTextoComparacao(conta.status);
        const pago = statusNormalizado === "pago";
        const atrasada = statusNormalizado === "atrasado";

        const div = document.createElement("div");
        div.className = `item-dashboard item-conta-pendente ${atrasada ? "atrasada" : ""} ${pago ? "paga" : ""}`;

        const ehVariavel = normalizarTextoComparacao(conta.tipoValor).includes("variavel");
        const valorLabel = ehVariavel
            ? (Number(conta.ultimoValorPago || 0) > 0 ? `Último: ${formatarMoeda(conta.ultimoValorPago)}` : "Valor variável")
            : formatarMoeda(conta.valorPrevisto || conta.valorPadrao || 0);

        const statusIcone = pago ? "🟢" : (atrasada ? "🔴" : "🟡");
        const statusTexto = pago ? "Pago" : (atrasada ? "Em atraso" : "Pendente");
        const iconeConta = obterIconeConta(conta.descricao, conta.categoria);
        const textoVencimento = textoVencimentoConta(conta.dia);

        div.innerHTML = `
            <div>
                <span class="principal">${statusIcone} ${iconeConta} ${capitalizar(conta.descricao)}</span>
                <span class="secundario">${statusTexto} • ${textoVencimento} • ${valorLabel}</span>
            </div>
            ${pago ? `<span class="badge-pago">Pago</span>` : `<button class="btn-pagar-conta" type="button" data-id-conta="${conta.id}" data-tipo-valor="${conta.tipoValor}" data-valor="${conta.valorPrevisto || conta.valorPadrao || 0}" data-ultimo-valor="${conta.ultimoValorPago || 0}" data-descricao="${capitalizar(conta.descricao)}">Pagar</button>`}
        `;

        listaContasPendentes.appendChild(div);
    });
}

async function pagarContaPendente(botaoPagar) {
    const idConta = botaoPagar.dataset.idConta || "";
    const descricao = botaoPagar.dataset.descricao || "esta conta";
    const tipoValor = botaoPagar.dataset.tipoValor || "Fixo";
    const ehVariavel = normalizarTextoComparacao(tipoValor).includes("variavel");
    let valor = Number(botaoPagar.dataset.valor || 0);

    if (ehVariavel) {
        const ultimoValor = Number(botaoPagar.dataset.ultimoValor || 0);
        const texto = ultimoValor > 0 ? `Valor pago para ${descricao}:\n\nÚltimo pagamento: ${formatarMoeda(ultimoValor)}` : `Valor pago para ${descricao}:`;
        const valorDigitado = prompt(texto, ultimoValor > 0 ? String(ultimoValor).replace(".", ",") : "");

        if (valorDigitado === null) return;

        valor = normalizarNumero(valorDigitado);

        if (!valor || valor <= 0) {
            mostrarToast("Valor inválido.", "erro");
            return;
        }
    }

    const pagamento = await escolherPagamentoPagamentoConta();

    if (!pagamento) {
        return;
    }

    const confirmar = confirm(`Marcar "${descricao}" como paga por ${formatarMoeda(valor)} via ${pagamento}?`);

    if (!confirmar) return;

    botaoPagar.disabled = true;
    mostrarLoading("Registrando pagamento...");

    const resposta = await backendPagarContaFixa({
        idConta,
        valor,
        pagamento,
        pessoa: usuarioAtual,
        mes: mesSelecionado,
        ano: anoSelecionado
    });

    ocultarLoading();
    botaoPagar.disabled = false;

    if (!resposta || !resposta.ok) {
        mostrarToast("Não consegui marcar a conta como paga.", "erro");
        return;
    }

    mostrarToast("Conta marcada como paga.", "sucesso");
    carregarDashboard(false);
    carregarHistorico(false);
}

function renderizarBeneficios(beneficios) {
    if (!cardBeneficios || !listaBeneficios) return;

    listaBeneficios.innerHTML = "";

    if (!beneficios.length) {
        cardBeneficios.classList.add("oculto");
        listaBeneficios.textContent = "Nenhum benefício recebido neste mês.";
        listaBeneficios.classList.add("vazio");
        return;
    }

    cardBeneficios.classList.remove("oculto");
    listaBeneficios.classList.remove("vazio");

    beneficios.forEach(item => {
        const div = document.createElement("div");
        div.className = "item-dashboard";
        div.innerHTML = `
            <div>
                <span class="principal">${obterIconeBeneficio(item.nome)} ${item.nome}</span>
                <span class="secundario">${item.quantidade || 1} lançamento(s) de saldo</span>
            </div>
            <span class="valor positivo">${formatarMoeda(item.total)}</span>
        `;
        listaBeneficios.appendChild(div);
    });
}

function renderizarCartaoCredito(cartao) {
    if (!cardCartaoCredito || !listaCartaoCredito || !totalCartaoCredito) return;

    const itens = cartao && Array.isArray(cartao.itens) ? cartao.itens : [];
    const total = cartao ? Number(cartao.total || 0) : 0;

    detalhesCartaoCredito = itens;
    listaCartaoCredito.innerHTML = "";
    totalCartaoCredito.textContent = formatarMoeda(total);

    if (!itens.length) {
        cardCartaoCredito.classList.add("oculto");
        listaCartaoCredito.textContent = "Nenhum gasto no cartão de crédito neste mês.";
        listaCartaoCredito.classList.add("vazio");
        return;
    }

    cardCartaoCredito.classList.remove("oculto");
    listaCartaoCredito.classList.remove("vazio");
    listaCartaoCredito.innerHTML = `
        <div class="resumo-card-linha">
            <span>${itens.length} lançamento(s) no cartão</span>
            <strong>${formatarMoeda(total)}</strong>
        </div>
    `;
}

function renderizarParcelas(parcelas) {
    if (!listaParcelas) return;

    detalhesParcelas = parcelas || [];
    listaParcelas.innerHTML = "";

    if (!detalhesParcelas.length) {
        if (totalParcelasMes) totalParcelasMes.textContent = formatarMoeda(0);
        if (parcelasResumoTitulo) parcelasResumoTitulo.textContent = "Total do mês";
        listaParcelas.textContent = "Nenhuma compra parcelada neste mês.";
        listaParcelas.classList.add("vazio");
        return;
    }

    const totalMes = detalhesParcelas.reduce((total, item) => total + Number(item.valor || 0), 0);
    const totalRestante = detalhesParcelas.reduce((total, item) => total + valorRestanteParcela(item), 0);

    if (totalParcelasMes) totalParcelasMes.textContent = formatarMoeda(totalMes);
    if (parcelasResumoTitulo) parcelasResumoTitulo.textContent = `${detalhesParcelas.length} parcela(s) neste mês`;

    listaParcelas.classList.remove("vazio");
    listaParcelas.innerHTML = `
        <div class="resumo-card-linha">
            <span>Restante a pagar</span>
            <strong>${formatarMoeda(totalRestante)}</strong>
        </div>
    `;
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

    mostrarLoading("Carregando histórico...");

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
        ocultarLoading();
        listaHistorico.textContent = "Não consegui carregar o histórico.";
        if (mostrarMensagem) mostrarToast("Erro ao carregar histórico.", "erro");
        return;
    }

    renderizarHistorico(resposta.dados);
    ocultarLoading();

    if (mostrarMensagem) mostrarToast("Histórico atualizado.", "sucesso");
}

function renderizarHistorico(dados) {
    if (!listaHistorico) return;

    paginaHistorico = Number(dados.pagina || 1);
    totalPaginasHistorico = Number(dados.totalPaginas || 1);

    atualizarCabecalhoHistorico();
    itensHistoricoAtuais = dados.itens || [];
    renderizarHistoricoFiltrado();
    atualizarPaginacaoHistorico();
}

function renderizarHistoricoFiltrado() {
    if (!listaHistorico) return;

    listaHistorico.innerHTML = "";

    let itens = [...(itensHistoricoAtuais || [])];

    if (filtroHistoricoAtual !== "todos") {
        itens = itens.filter(item => {
            const tipo = normalizarTextoComparacao(item.tipo);
            const pagamento = normalizarTextoComparacao(item.pagamento);
            const tipoRegistro = normalizarTextoComparacao(item.tipoRegistro);

            if (filtroHistoricoAtual === "receitas") return tipo.includes("receita") || normalizarTextoComparacao(item.categoria).includes("recebimento");
            if (filtroHistoricoAtual === "despesas") return tipo.includes("despesa");
            if (filtroHistoricoAtual === "cartao") return pagamento.includes("credito");
            if (filtroHistoricoAtual === "parcelas") return tipoRegistro === "parcela";
            if (filtroHistoricoAtual === "contas") return tipoRegistro.includes("conta fixa");
            return true;
        });
    }

    if (buscaHistoricoAtual) {
        const busca = normalizarTextoComparacao(buscaHistoricoAtual);
        itens = itens.filter(item => normalizarTextoComparacao([
            item.descricao,
            item.categoria,
            item.pagamento,
            item.pessoa,
            item.tipoRegistro
        ].join(" ")).includes(busca));
    }

    itens.sort((a, b) => {
        const dataA = new Date(a.data).getTime() || 0;
        const dataB = new Date(b.data).getTime() || 0;
        if (dataB !== dataA) return dataB - dataA;
        return Number(b.rowIndex || 0) - Number(a.rowIndex || 0);
    });

    if (!itens.length) {
        listaHistorico.textContent = "Nenhum lançamento encontrado.";
        listaHistorico.classList.add("vazio");
        return;
    }

    listaHistorico.classList.remove("vazio");

    const grupos = agruparHistoricoPorDia(itens);

    grupos.forEach(grupo => {
        const header = document.createElement("div");
        header.className = "historico-dia-header";
        header.innerHTML = `
            <div>
                <strong>${grupo.titulo}</strong>
                <span>${grupo.itens.length} lançamento(s)</span>
            </div>
            <small>Despesas ${formatarMoeda(grupo.despesas)}${grupo.receitas ? ` • Receitas ${formatarMoeda(grupo.receitas)}` : ""}</small>
        `;
        listaHistorico.appendChild(header);

        grupo.itens.forEach(item => {
            const ehReceita = item.tipo === "Receita";
            const div = document.createElement("div");
            div.className = "item-dashboard item-historico";

            const detalheParcela = item.parcela ? ` • ${formatarParcela(item.parcela, item.totalParcelas)}` : "";
            const detalhePagamento = item.pagamento || "Não informado";

            div.innerHTML = `
                <div>
                    <span class="principal">${obterIconeCategoria(item.categoria, item.tipo)} ${capitalizar(item.descricao)}</span>
                    <span class="secundario">${formatarDataCurta(item.data)} • ${detalhePagamento} • ${item.categoria || "Outros"}${detalheParcela}</span>
                </div>

                <div class="historico-acoes">
                    <span class="valor ${ehReceita ? "positivo" : "negativo"}">${ehReceita ? "+" : "-"}${formatarMoeda(item.valor)}</span>
                    <button
                        class="btn-duplicar-lancamento"
                        type="button"
                        aria-label="Duplicar lançamento"
                        data-item='${encodeURIComponent(JSON.stringify(item))}'>
                        ⧉
                    </button>
                    <button
                        class="btn-editar-lancamento"
                        type="button"
                        aria-label="Editar lançamento"
                        data-row-index="${item.rowIndex || ""}"
                        data-item='${encodeURIComponent(JSON.stringify(item))}'>
                        ✏️
                    </button>
                    <button
                        class="btn-excluir-lancamento"
                        type="button"
                        aria-label="Excluir lançamento"
                        data-row-index="${item.rowIndex || ""}"
                        data-id-grupo="${item.idGrupo || ""}"
                        data-tipo-registro="${item.tipoRegistro || ""}"
                        data-descricao="${capitalizar(item.descricao)}">
                        🗑
                    </button>
                </div>
            `;

            listaHistorico.appendChild(div);
        });
    });
}

async function duplicarLancamentoHistorico(botaoDuplicar) {
    let item = null;

    try {
        item = JSON.parse(decodeURIComponent(botaoDuplicar.dataset.item || ""));
    } catch (erro) {
        item = null;
    }

    if (!item) {
        mostrarToast("Não consegui duplicar o lançamento.", "erro");
        return;
    }

    const confirmar = confirm(`Duplicar "${capitalizar(item.descricao)}" com a data de hoje?`);
    if (!confirmar) return;

    mostrarLoading("Duplicando lançamento...");

    const resposta = await backendSalvar({
        pessoa: item.pessoa || usuarioAtual,
        tipo: item.tipo || "Despesa",
        valor: Number(item.valor || 0),
        categoria: item.categoria || "Outros",
        descricao: item.descricao || "Sem descrição",
        pagamento: item.pagamento || "Não informado",
        tipoRegistro: "Único",
        valorTotal: Number(item.valor || 0)
    });

    ocultarLoading();

    if (!resposta || !resposta.ok) {
        mostrarToast("Não consegui duplicar o lançamento.", "erro");
        return;
    }

    mostrarToast("Lançamento duplicado.", "sucesso");
    carregarDashboard(false);
    carregarHistorico(false);
}

async function editarLancamentoHistorico(botaoEditar) {
    const rowIndex = Number(botaoEditar.dataset.rowIndex || 0);
    let item = null;

    try {
        item = JSON.parse(decodeURIComponent(botaoEditar.dataset.item || ""));
    } catch (erro) {
        item = null;
    }

    if (!rowIndex || !item) {
        mostrarToast("Não consegui carregar o lançamento.", "erro");
        return;
    }

    const descricao = prompt("Descrição:", item.descricao || "");
    if (descricao === null) return;

    const valorTexto = prompt("Valor:", String(item.valor || 0).replace(".", ","));
    if (valorTexto === null) return;

    const valor = normalizarNumero(valorTexto);
    if (!valor || valor <= 0) {
        mostrarToast("Valor inválido.", "erro");
        return;
    }

    const dataTexto = prompt("Data (AAAA-MM-DD):", formatarDataInput(item.data));
    if (dataTexto === null) return;

    const tipo = await escolherOpcaoAsync("Tipo", TIPOS_LANCAMENTO, item.tipo || "Despesa");
    if (!tipo) return;

    const categoria = await escolherCategoriaAsync(item.categoria || "Outros");
    if (!categoria) return;

    const pagamento = await escolherOpcaoAsync("Pagamento", PAGAMENTOS_BASE, item.pagamento || "Não informado");
    if (!pagamento) return;

    mostrarLoading("Editando lançamento...");

    const resposta = await backendEditarLancamento({
        rowIndex,
        descricao: descricao.trim() || "Sem descrição",
        valor,
        data: dataTexto,
        tipo: normalizarTipo(tipo),
        categoria: capitalizar(categoria),
        pagamento: normalizarPagamento(pagamento),
        pessoa: item.pessoa || usuarioAtual
    });

    ocultarLoading();

    if (!resposta || !resposta.ok) {
        mostrarToast("Não consegui editar o lançamento.", "erro");
        return;
    }

    mostrarToast("Lançamento editado.", "sucesso");
    carregarDashboard(false);
    carregarHistorico(false);
}

function escolherOpcaoAsync(titulo, opcoes, valorAtual = "") {
    return new Promise(resolve => {
        abrirModalOpcoes(titulo, opcoes, opcao => resolve(opcao), valorAtual, false, () => resolve(null));
    });
}

function escolherCategoriaAsync(valorAtual = "Outros") {
    return new Promise(resolve => {
        abrirModalOpcoes("Categoria", obterCategoriasDisponiveis(), categoriaSelecionada => {
            if (categoriaSelecionada === "__nova__") {
                const nova = prompt("Nova categoria:");
                resolve(nova ? capitalizar(nova.trim()) : null);
                return;
            }

            resolve(categoriaSelecionada);
        }, valorAtual, true, () => resolve(null));
    });
}

async function excluirLancamentoHistorico(botaoExcluir) {
    const rowIndex = Number(botaoExcluir.dataset.rowIndex || 0);
    const idGrupo = botaoExcluir.dataset.idGrupo || "";
    const tipoRegistro = botaoExcluir.dataset.tipoRegistro || "";
    const descricao = botaoExcluir.dataset.descricao || "este lançamento";

    if (!rowIndex && !idGrupo) {
        mostrarToast("Não consegui identificar o lançamento.", "erro");
        return;
    }

    let modo = "linha";

    if (tipoRegistro === "Parcela" && idGrupo) {
        const excluirTudo = confirm(
            `Excluir "${descricao}"?\n\nOK = excluir toda a compra parcelada.\nCancelar = excluir somente esta parcela.`
        );

        modo = excluirTudo ? "grupo" : "linha";
    } else {
        const confirmar = confirm(`Excluir "${descricao}"?`);

        if (!confirmar) {
            return;
        }
    }

    botaoExcluir.disabled = true;
    mostrarLoading("Excluindo lançamento...");

    const resposta = await backendExcluirLancamento({
        modo,
        rowIndex,
        idGrupo
    });

    if (!resposta || !resposta.ok) {
        ocultarLoading();
        botaoExcluir.disabled = false;
        mostrarToast("Não consegui excluir o lançamento.", "erro");
        return;
    }

    ocultarLoading();
    mostrarToast("Lançamento excluído.", "sucesso");

    carregarDashboard(false);
    carregarHistorico(false);
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

function formatarMesAno(mes, ano) {
    const mesSeguro = typeof mes === "number" ? mes : dataHoje.getMonth();
    const anoSeguro = typeof ano === "number" ? ano : dataHoje.getFullYear();
    return `${String(mesSeguro + 1).padStart(2, "0")}/${anoSeguro}`;
}

function interpretarMesAno(valor) {
    const match = String(valor || "").trim().match(/^(\d{1,2})\/(\d{4})$/);

    if (!match) {
        return null;
    }

    const mes = Number(match[1]) - 1;
    const ano = Number(match[2]);

    if (mes < 0 || mes > 11 || ano < 2000) {
        return null;
    }

    return { mes, ano };
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
    const configuracoesAtivo = tela === "configuracoes";
    const registroAtivo = tela === "registro";

    telaRegistro.classList.toggle("ativa", registroAtivo);
    telaDashboard.classList.toggle("ativa", dashboardAtivo);

    if (telaHistorico) {
        telaHistorico.classList.toggle("ativa", historicoAtivo);
    }

    if (telaConfiguracoes) {
        telaConfiguracoes.classList.toggle("ativa", configuracoesAtivo);
    }

    navRegistro.classList.toggle("ativo", registroAtivo);
    navDashboard.classList.toggle("ativo", dashboardAtivo);

    if (navHistorico) {
        navHistorico.classList.toggle("ativo", historicoAtivo);
    }

    if (navConfiguracoes) {
        navConfiguracoes.classList.toggle("ativo", configuracoesAtivo);
    }

    if (dashboardAtivo) {
        carregarDashboard();
    } else if (historicoAtivo) {
        carregarHistorico();
    } else if (configuracoesAtivo) {
        renderizarConfiguracoes();
    } else {
        setTimeout(() => input.focus(), 80);
    }
}

function abrirModalOpcoes(titulo, opcoes, aoSelecionar, valorAtual = "", incluirNovaCategoria = false, aoCancelar = null) {
    if (!modalOpcoes || !modalOpcoesLista || !modalOpcoesTitulo) return;

    modalOpcoesCancelamento = typeof aoCancelar === "function" ? aoCancelar : null;
    modalOpcoesTitulo.textContent = titulo;
    modalOpcoesLista.innerHTML = "";

    const opcoesUnicas = [...new Set(opcoes.filter(Boolean))];

    opcoesUnicas.forEach(opcao => {
        const botaoOpcao = document.createElement("button");
        botaoOpcao.type = "button";
        botaoOpcao.className = "btn-opcao-lista";
        botaoOpcao.innerHTML = `
            <span>${obterIconeOpcao(titulo, opcao)} ${opcao}</span>
            ${normalizarTextoComparacao(opcao) === normalizarTextoComparacao(valorAtual) ? "<strong>✓</strong>" : ""}
        `;

        botaoOpcao.addEventListener("click", () => {
            modalOpcoesCancelamento = null;
            fecharModalOpcoes();
            aoSelecionar(opcao);
        });

        modalOpcoesLista.appendChild(botaoOpcao);
    });

    if (incluirNovaCategoria) {
        const botaoNova = document.createElement("button");
        botaoNova.type = "button";
        botaoNova.className = "btn-opcao-lista nova";
        botaoNova.innerHTML = "<span>➕ Nova categoria</span>";

        botaoNova.addEventListener("click", () => {
            modalOpcoesCancelamento = null;
            fecharModalOpcoes();
            aoSelecionar("__nova__");
        });

        modalOpcoesLista.appendChild(botaoNova);
    }

    modalOpcoes.classList.remove("oculto");
}

function fecharModalOpcoes() {
    if (modalOpcoes) {
        modalOpcoes.classList.add("oculto");
    }

    if (modalOpcoesCancelamento) {
        const callback = modalOpcoesCancelamento;
        modalOpcoesCancelamento = null;
        callback();
    }
}

function criarNovaCategoria() {
    const novaCategoria = prompt("Nome da nova categoria:");

    if (novaCategoria === null) return;

    const categoria = capitalizar(novaCategoria.trim());

    if (!categoria) {
        mostrarToast("Categoria inválida.", "erro");
        return;
    }

    if (!categoriasPersonalizadas.includes(categoria) && !CATEGORIAS_BASE.includes(categoria)) {
        categoriasPersonalizadas.push(categoria);
    }

    dadosInterpretados.categoria = categoria;
    mostrarConfirmacao(dadosInterpretados);
    mostrarToast("Categoria adicionada.", "sucesso");
}

function obterCategoriasDisponiveis() {
    const categoriaAtual = dadosInterpretados && dadosInterpretados.categoria ? dadosInterpretados.categoria : "";
    return [...new Set([...obterTodasCategoriasConfig(), categoriaAtual].filter(Boolean))];
}

function obterIconeOpcao(titulo, opcao) {
    const tituloNormalizado = normalizarTextoComparacao(titulo);

    if (tituloNormalizado.includes("tipo")) {
        return opcao === "Receita" ? "💵" : "🔴";
    }

    if (tituloNormalizado.includes("pagamento")) {
        return obterIconePagamento(opcao);
    }

    return obterIconeCategoria(opcao);
}

function obterIconePagamento(pagamento = "") {
    const raw = normalizarTextoComparacao(pagamento);

    if (raw.includes("pix")) return "⚡";
    if (raw.includes("credito")) return "💳";
    if (raw.includes("debito")) return "💳";
    if (raw.includes("dinheiro")) return "💵";
    if (raw.includes("alimentacao")) return "🥗";
    if (raw.includes("combustivel")) return "⛽";
    if (raw.includes("transporte")) return "🚌";

    return "💳";
}

function mostrarLoading(mensagem = "Carregando...") {
    if (!loadingOverlay || !loadingMensagem) return;

    loadingMensagem.textContent = mensagem;
    loadingOverlay.classList.remove("oculto");
}

function ocultarLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.add("oculto");
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

function normalizarTipo(valor) {
    const raw = removerAcentos(String(valor || "").toLowerCase()).trim();

    if (["receita", "recebimento", "entrada", "ganho"].includes(raw)) {
        return "Receita";
    }

    if (["despesa", "gasto", "saida", "saída", "compra"].includes(raw)) {
        return "Despesa";
    }

    return "";
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

    const nomeCategoria = capitalizar(String(categoria || "").trim());

    if (categoriasConfig && categoriasConfig[nomeCategoria]) {
        return categoriasConfig[nomeCategoria];
    }

    const raw = removerAcentos(String(categoria || "").toLowerCase());

    const categoriaPadrao = Object.keys(categoriasConfig || {}).find(nome => {
        return removerAcentos(nome.toLowerCase()) === raw;
    });

    if (categoriaPadrao) {
        return categoriasConfig[categoriaPadrao];
    }

    if (raw.includes("mercado")) return categoriasConfig["Mercado"] || "🛒";
    if (raw.includes("alimentacao") || raw.includes("restaurante")) return categoriasConfig["Alimentação"] || "🍔";
    if (raw.includes("carro") || raw.includes("veiculo")) return categoriasConfig["Carro"] || "🚗";
    if (raw.includes("combustivel")) return categoriasConfig["Combustível"] || "⛽";
    if (raw.includes("saude")) return categoriasConfig["Saúde"] || "💊";
    if (raw.includes("casa")) return categoriasConfig["Casa"] || "🏠";
    if (raw.includes("lazer")) return categoriasConfig["Lazer"] || "🎮";
    if (raw.includes("eletronico")) return categoriasConfig["Eletrônicos"] || "💻";
    if (raw.includes("beneficio")) return categoriasConfig["Benefícios"] || "🎁";
    if (raw.includes("recebimento")) return categoriasConfig["Recebimento"] || "💵";

    return categoriasConfig["Outros"] || "🏷";
}

function obterIconeConta(descricao = "", categoria = "") {
    const raw = normalizarTextoComparacao(`${descricao} ${categoria}`);

    if (raw.includes("internet")) return "🌐";
    if (raw.includes("carro") || raw.includes("seguro")) return "🚗";
    if (raw.includes("luz") || raw.includes("energia")) return "⚡";
    if (raw.includes("agua")) return "💧";
    if (raw.includes("condominio")) return "🏢";
    if (raw.includes("celular") || raw.includes("telefone")) return "📱";
    if (raw.includes("netflix") || raw.includes("streaming")) return "🎬";
    if (raw.includes("academia")) return "🏋️";
    if (raw.includes("casa")) return "🏠";

    return obterIconeCategoria(categoria);
}

function textoVencimentoConta(dia) {
    const diaConta = Number(dia || 0);

    if (!diaConta) return "Vencimento não informado";

    if (mesSelecionado === dataHoje.getMonth() && anoSelecionado === dataHoje.getFullYear()) {
        if (diaConta === dataHoje.getDate()) return "Vence hoje";
        if (diaConta === dataHoje.getDate() + 1) return "Vence amanhã";
    }

    return `Vence dia ${diaConta}`;
}

function obterIconeBeneficio(nome = "") {
    const raw = normalizarTextoComparacao(nome);

    if (raw.includes("alimentacao")) return "🥗";
    if (raw.includes("combustivel")) return "⛽";
    if (raw.includes("transporte")) return "🚌";

    return "🎁";
}


function formatarParcela(parcela, totalParcelas) {
    const texto = String(parcela || "").trim();

    if (texto.includes("/")) {
        return texto.replace("/", "/");
    }

    if (parcela && totalParcelas) {
        return `${parcela}/${totalParcelas}`;
    }

    return "Parcela";
}

function calcularRestanteParcela(item) {
    const match = String(item.parcela || "").match(/(\d+)\s*\/\s*(\d+)/);
    const valor = Number(item.valor || 0);

    if (!match || !valor) return "";

    const atual = Number(match[1]);
    const total = Number(match[2]);
    const restantes = Math.max(total - atual + 1, 0);

    if (!restantes) return "";

    return formatarMoeda(restantes * valor);
}

function formatarMesAno(data) {
    const d = new Date(data);

    if (isNaN(d.getTime())) {
        return "";
    }

    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${meses[d.getMonth()]}/${String(d.getFullYear()).slice(-2)}`;
}


function valorRestanteParcela(item) {
    const match = String(item.parcela || "").match(/(\d+)\s*\/\s*(\d+)/);
    const valor = Number(item.valor || 0);

    if (!match || !valor) return valor;

    const atual = Number(match[1]);
    const total = Number(match[2]);
    return Math.max(total - atual + 1, 0) * valor;
}

function formatarDataLonga(data) {
    const d = new Date(data);

    if (isNaN(d.getTime())) return "Sem data";

    return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long"
    });
}

function obterChaveDia(data) {
    const d = new Date(data);

    if (isNaN(d.getTime())) return "sem-data";

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function agruparHistoricoPorDia(itens) {
    const mapa = new Map();

    itens.forEach(item => {
        const chave = obterChaveDia(item.data);

        if (!mapa.has(chave)) {
            mapa.set(chave, {
                chave,
                titulo: chave === "sem-data" ? "Sem data" : formatarDataLonga(item.data),
                receitas: 0,
                despesas: 0,
                itens: []
            });
        }

        const grupo = mapa.get(chave);
        const valor = Number(item.valor || 0);

        if (item.tipo === "Receita") grupo.receitas += valor;
        else grupo.despesas += valor;

        grupo.itens.push(item);
    });

    return Array.from(mapa.values()).sort((a, b) => b.chave.localeCompare(a.chave));
}

function abrirModalDetalhes(titulo, subtitulo, itens, tipo) {
    if (!modalDetalhes || !modalDetalhesConteudo || !modalDetalhesTitulo) return;

    modalDetalhesTitulo.textContent = titulo;
    modalDetalhesSubtitulo.textContent = subtitulo || "";
    modalDetalhesConteudo.innerHTML = "";

    if (!itens || !itens.length) {
        modalDetalhesConteudo.textContent = "Nenhum item encontrado.";
        modalDetalhesConteudo.classList.add("vazio");
    } else {
        modalDetalhesConteudo.classList.remove("vazio");
        itens.forEach(item => {
            const div = document.createElement("div");
            div.className = "item-dashboard";

            const parcela = item.parcela ? `${formatarParcela(item.parcela, item.totalParcelas)} • ` : "";
            const restante = tipo === "parcelas" ? valorRestanteParcela(item) : 0;
            const detalheRestante = restante ? ` • Restante: ${formatarMoeda(restante)}` : "";

            div.innerHTML = `
                <div>
                    <span class="principal">${tipo === "cartao" ? "💳" : "💳"} ${capitalizar(item.descricao)}</span>
                    <span class="secundario">${parcela}${formatarDataCurta(item.data) || formatarMesAno(item.data)} • ${item.categoria || "Outros"}${detalheRestante}</span>
                </div>
                <span class="valor negativo">${formatarMoeda(item.valor)}</span>
            `;

            modalDetalhesConteudo.appendChild(div);
        });
    }

    modalDetalhes.classList.remove("oculto");
}

function fecharModalDetalhes() {
    if (modalDetalhes) modalDetalhes.classList.add("oculto");
}

function formatarDataInput(data) {
    const d = new Date(data);

    if (isNaN(d.getTime())) {
        return "";
    }

    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
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


if (navConfiguracoes) {
    navConfiguracoes.addEventListener("click", () => trocarTela("configuracoes"));
}

if (listaCategoriasConfig) {
    listaCategoriasConfig.addEventListener("click", event => {
        const botao = event.target.closest(".categoria-config");
        if (!botao) return;
        trocarEmojiCategoria(botao.dataset.categoria);
    });
}

if (btnNovaCategoriaConfig) {
    btnNovaCategoriaConfig.addEventListener("click", criarCategoriaConfiguracao);
}


if (btnFecharOpcoes) {
    btnFecharOpcoes.addEventListener("click", fecharModalOpcoes);
}

if (listaHistorico) {
    listaHistorico.addEventListener("click", event => {
        const botaoDuplicar = event.target.closest(".btn-duplicar-lancamento");
        const botaoEditar = event.target.closest(".btn-editar-lancamento");
        const botaoExcluir = event.target.closest(".btn-excluir-lancamento");

        if (botaoDuplicar) {
            duplicarLancamentoHistorico(botaoDuplicar);
            return;
        }

        if (botaoEditar) {
            editarLancamentoHistorico(botaoEditar);
            return;
        }

        if (botaoExcluir) {
            excluirLancamentoHistorico(botaoExcluir);
        }
    });
}

if (listaContasPendentes) {
    listaContasPendentes.addEventListener("click", event => {
        const botaoPagar = event.target.closest(".btn-pagar-conta");

        if (botaoPagar) {
            pagarContaPendente(botaoPagar);
        }
    });
}

modalUsuario.querySelectorAll(".btn-opcao-usuario").forEach(botaoUsuario => {
    botaoUsuario.addEventListener("click", () => selecionarUsuario(botaoUsuario.dataset.usuario));
});

modal.querySelectorAll(".recibo-linha").forEach(linha => {
    linha.addEventListener("click", () => editarCampo(linha.dataset.edit));
});

modal.addEventListener("click", event => {
    const botaoDetalhe = event.target.closest(".detalhe-acao");

    if (botaoDetalhe) {
        editarDetalheContaFixa(botaoDetalhe.dataset.extraEdit);
    }
});


if (btnDetalhesCartao) {
    btnDetalhesCartao.addEventListener("click", () => {
        const total = detalhesCartaoCredito.reduce((soma, item) => soma + Number(item.valor || 0), 0);
        abrirModalDetalhes("Cartão de crédito", `Fatura estimada: ${formatarMoeda(total)}`, detalhesCartaoCredito, "cartao");
    });
}

if (btnDetalhesParcelas) {
    btnDetalhesParcelas.addEventListener("click", () => {
        const totalMes = detalhesParcelas.reduce((soma, item) => soma + Number(item.valor || 0), 0);
        abrirModalDetalhes("Compras parceladas", `Total do mês: ${formatarMoeda(totalMes)}`, detalhesParcelas, "parcelas");
    });
}

if (btnFecharDetalhes) {
    btnFecharDetalhes.addEventListener("click", fecharModalDetalhes);
}

if (buscaHistorico) {
    buscaHistorico.addEventListener("input", event => {
        buscaHistoricoAtual = event.target.value || "";
        renderizarHistoricoFiltrado();
    });
}

botoesFiltroHistorico.forEach(botaoFiltro => {
    botaoFiltro.addEventListener("click", () => {
        botoesFiltroHistorico.forEach(btn => btn.classList.remove("ativo"));
        botaoFiltro.classList.add("ativo");
        filtroHistoricoAtual = botaoFiltro.dataset.filtro || "todos";
        renderizarHistoricoFiltrado();
    });
});

iniciarApp();
