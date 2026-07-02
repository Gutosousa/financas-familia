/*
====================================
Finanças da Família
Versão: 0.9.0-beta
Arquivo: services/api.js
====================================
*/

const API_URL =
    "https://script.google.com/macros/s/AKfycbxlWaAVRtC4pHzqV7hK3rfHNYwT9js9u0xSSDWaa6WQgkDD-DMm4sU-nq8GG-UW9B9GHQ/exec";

async function backendInterpretar(texto, pessoa = "") {
    return backendRequest({
        acao: "interpretar",
        pessoa,
        text: texto
    });
}

async function backendSalvar(dados) {
    return backendRequest({
        acao: "salvar",
        ...dados
    });
}

async function backendDashboard(mes, ano) {
    return backendRequest({
        acao: "dashboard",
        mes,
        ano
    });
}

async function backendHistorico(mes, ano, pagina = 1, limite = 15) {
    return backendRequest({
        acao: "historico",
        mes,
        ano,
        pagina,
        limite
    });
}

async function backendAprenderCategoria(dados) {
    return backendRequest({
        acao: "aprenderCategoria",
        ...dados
    });
}

async function backendPagarContaFixa(dados) {
    return backendRequest({
        acao: "pagarContaFixa",
        ...dados
    });
}

async function backendExcluirLancamento(dados) {
    return backendRequest({
        acao: "excluirLancamento",
        ...dados
    });
}


async function backendRequest(payload) {
    try {
        const resposta = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(payload)
        });

        if (!resposta.ok) {
            throw new Error("Erro HTTP " + resposta.status);
        }

        return await resposta.json();
    } catch (erro) {
        console.error("Erro ao conectar com a API:", erro);
        return null;
    }
}
