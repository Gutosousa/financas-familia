/*
====================================

Finanças da Família

Versão: 0.2.2

Arquivo: services/api.js

Responsável pela comunicação
com o Apps Script.

====================================
*/

const API_URL =
    "https://script.google.com/macros/s/AKfycbxlWaAVRtC4pHzqV7hK3rfHNYwT9js9u0xSSDWaa6WQgkDD-DMm4sU-nq8GG-UW9B9GHQ/exec";


/*
====================================
Interpretar movimentação
====================================
*/

async function backendInterpretar(texto) {

    try {

        const resposta = await fetch(API_URL, {

            method: "POST",

           headers: {
    "Content-Type": "text/plain;charset=utf-8"
},

            body: JSON.stringify({

                acao: "interpretar",

                pessoa: "Augusto",

                text: texto

            })

        });

        if (!resposta.ok) {
            throw new Error("Erro HTTP " + resposta.status);
        }

        return await resposta.json();

    } catch (erro) {

        console.error("Erro ao interpretar:", erro);

        return null;

    }

}


/*
====================================
Salvar movimentação
====================================
*/

async function backendSalvar(dados) {

    try {

        const resposta = await fetch(API_URL, {

            method: "POST",

           headers: {
    "Content-Type": "text/plain;charset=utf-8"
},

            body: JSON.stringify({

                acao: "salvar",

                ...dados

            })

        });

        if (!resposta.ok) {
            throw new Error("Erro HTTP " + resposta.status);
        }

        return await resposta.json();

    } catch (erro) {

        console.error("Erro ao salvar:", erro);

        return null;

    }

}