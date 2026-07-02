/*
====================================
Finanças da Família
Versão: 0.9.0-beta
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

let categoriasPersonalizadas = [];

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
        listaContasPendentes.textContent = "Nenhuma conta fixa pendente neste mês.";
        listaContasPendentes.classList.add("vazio");
        return;
    }

    cardContasPendentes.classList.remove("oculto");
    listaContasPendentes.classList.remove("vazio");

    contas.forEach(conta => {
        const div = document.createElement("div");
        div.className = `item-dashboard item-conta-pendente ${normalizarTextoComparacao(conta.status) === "atrasado" ? "atrasada" : ""}`;

        const ehVariavel = normalizarTextoComparacao(conta.tipoValor).includes("variavel");
        const valorLabel = ehVariavel
            ? (Number(conta.ultimoValorPago || 0) > 0 ? `Último: ${formatarMoeda(conta.ultimoValorPago)}` : "Valor variável")
            : formatarMoeda(conta.valorPrevisto || conta.valorPadrao || 0);

        div.innerHTML = `
            <div>
                <span class="principal">${normalizarTextoComparacao(conta.status) === "atrasado" ? "🔴" : "🟡"} ${capitalizar(conta.descricao)}</span>
                <span class="secundario">Vence dia ${conta.dia || "--"} • ${valorLabel}</span>
            </div>
            <button class="btn-pagar-conta" type="button" data-id-conta="${conta.id}" data-tipo-valor="${conta.tipoValor}" data-valor="${conta.valorPrevisto || conta.valorPadrao || 0}" data-ultimo-valor="${conta.ultimoValorPago || 0}" data-descricao="${capitalizar(conta.descricao)}">Pagar</button>
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
        const texto = ultimoValor > 0 ? `Valor pago para ${descricao}:

Último pagamento: ${formatarMoeda(ultimoValor)}` : `Valor pago para ${descricao}:`;
        const valorDigitado = prompt(texto, ultimoValor > 0 ? String(ultimoValor).replace(".", ",") : "");

        if (valorDigitado === null) return;

        valor = normalizarNumero(valorDigitado);

        if (!valor || valor <= 0) {
            mostrarToast("Valor inválido.", "erro");
            return;
        }
    } else {
        const confirmar = confirm(`Marcar "${descricao}" como paga por ${formatarMoeda(valor)}?`);
        if (!confirmar) return;
    }

    botaoPagar.disabled = true;
    mostrarLoading("Registrando pagamento...");

    const resposta = await backendPagarContaFixa({
        idConta,
        valor,
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

    mostrarToast("Conta paga e lançada no histórico.", "sucesso");
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

            <div class="historico-acoes">
                <span class="valor ${ehReceita ? "positivo" : "negativo"}">${ehReceita ? "+" : "-"}${formatarMoeda(item.valor)}</span>
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

    atualizarPaginacaoHistorico();
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

function abrirModalOpcoes(titulo, opcoes, aoSelecionar, valorAtual = "", incluirNovaCategoria = false) {
    if (!modalOpcoes || !modalOpcoesLista || !modalOpcoesTitulo) return;

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
    return [...new Set([...CATEGORIAS_BASE, ...categoriasPersonalizadas, categoriaAtual].filter(Boolean))];
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

    const raw = removerAcentos(categoria.toLowerCase());

    if (raw.includes("mercado")) return "🛒";
    if (raw.includes("alimentacao") || raw.includes("restaurante")) return "🍔";
    if (raw.includes("carro") || raw.includes("veiculo") || raw.includes("veículo")) return "🚗";
    if (raw.includes("combustivel")) return "⛽";
    if (raw.includes("saude")) return "💊";
    if (raw.includes("casa")) return "🏠";
    if (raw.includes("lazer")) return "🎮";
    if (raw.includes("eletronico")) return "💻";
    if (raw.includes("beneficio")) return "🎁";
    if (raw.includes("recebimento")) return "💵";

    return "🏷";
}

function obterIconeBeneficio(nome = "") {
    const raw = normalizarTextoComparacao(nome);

    if (raw.includes("alimentacao")) return "🥗";
    if (raw.includes("combustivel")) return "⛽";
    if (raw.includes("transporte")) return "🚌";

    return "🎁";
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

if (btnFecharOpcoes) {
    btnFecharOpcoes.addEventListener("click", fecharModalOpcoes);
}

if (listaHistorico) {
    listaHistorico.addEventListener("click", event => {
        const botaoExcluir = event.target.closest(".btn-excluir-lancamento");

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

iniciarApp();
