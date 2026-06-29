/*
====================================
Finanças da Família
Versão: 0.5.0
Arquivo: services/api.js
Comunicação com o Apps Script.
====================================
*/

const API_URL =
    "https://script.google.com/macros/s/AKfycbxlWaAVRtC4pHzqV7hK3rfHNYwT9js9u0xSSDWaa6WQgkDD-DMm4sU-nq8GG-UW9B9GHQ/exec";

async function chamarBackend(payload) {
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
        console.error("Erro ao conectar com o backend:", erro);
        return null;
    }
}

async function backendInterpretar(texto, pessoa) {
    return chamarBackend({
        acao: "interpretar",
        pessoa,
        text: texto
    });
}

async function backendSalvar(dados) {
    return chamarBackend({
        acao: "salvar",
        ...dados
    });
}

async function backendDashboard() {
    return chamarBackend({
        acao: "dashboard"
    });
}
