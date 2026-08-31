var cargaMaxima = null
var treinos = []
var nomesPosicao = { "G": "Goleiro", "Z": "Zagueiro", "M": "Meio-campo", "A": "Atacante" }
var nomesTipoTreino = { "F": "Físico", "T": "Técnico", "E": "Estratégico" }

// CONFIGURAÇÃO INICIAL
function definirConfig() {
    var valor = parseFloat(document.getElementById('cargaMaxima').value)
    var msg = document.getElementById('msgConfig')

    if (isNaN(valor) || valor <= 0) {
        msg.textContent = "Informe uma carga máxima válida (maior que zero e campo não vazio)."
        return
    }

    cargaMaxima = valor
    msg.textContent = "Carga máxima semanal definida: " + valor + " pontos.";
    document.getElementById('secTreino').classList.remove("opacity-40", "pointer-events-none")
}

// VERIFICA SE HÁ CÓDIGO REPETIDO
function codigoTreinoJaExiste(codigo) {
    var i = 0
    while (i < treinos.length) {
        if (treinos[i].codigo === codigo) return true
        i++
    }
    return false
}

// VALIDA A INTENSIDADE
function intensidadeEhValida(intensidade) {
    var valoresValidos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var i = 0
    while (i < valoresValidos.length) {
        if (valoresValidos[i] === intensidade) return true;
        i++
    }
    return false
}

// MULTIPLICADOR DA CARGA CONFORME O TIPO DO TREINO 
function multiplicadorTipoTreino(tipo) {
    switch (tipo) {
        case "F": return 1.5
        case "T": return 1.2
        case "E": return 1.0
        default: return null
    }
}

// CONFERE SE HÁ UM JOGADOR QUE JÁ APARECEU 
function encontrarIndiceJogador(lista, nome) {
    var i = 0
    while (i < lista.length) {
        if (lista[i].nome === nome) return i
        i++;
    }
    return -1
}

//ADICIONA O TREINO SE ESTIVER TUDO CERTO
function adicionarTreino() {
    var codigo = document.getElementById('codigoTreino').value.trim()
    var jogador = document.getElementById('nomeJogador').value.trim()
    var posicao = document.getElementById('posicaoJogador').value
    var tipo = document.getElementById('tipoTreino').value
    var duracao = parseFloat(document.getElementById('duracaoMin').value)
    var intensidade = parseInt(document.getElementById('intensidade').value, 10)

    var msg = document.getElementById('msgTreino')
    var multiplicador = multiplicadorTipoTreino(tipo)

    if (!codigo || codigoTreinoJaExiste(codigo) || !jogador || posicao !== "G" && posicao !== "Z" && posicao !== "M" && posicao !== "A" || multiplicador === null || isNaN(duracao) || duracao <= 0 || isNaN(intensidade) || !intensidadeEhValida(intensidade)) {
        msg.textContent = "Informe os dados corretamente (sem campos vazios e valores negativos)."
        return
    }

    //fórmula da carga
    var carga = (duracao / 10) * intensidade * multiplicador

    treinos.push({
        codigo: codigo,
        jogador: jogador,
        posicao: posicao,
        tipo: tipo,
        duracao: duracao,
        intensidade: intensidade,
        carga: carga
    })

    mostrarTabela()

    document.getElementById("codigoTreino").value = ""
    document.getElementById("nomeJogador").value = ""
    document.getElementById("posicaoJogador").value = ""
    document.getElementById("tipoTreino").value = ""
    document.getElementById("duracaoMin").value = ""
    document.getElementById("intensidade").value = ""
    msg.textContent = ""
}

//TABELA COM OS TREINOS CADASTRADOS 
function mostrarTabela() {
    document.getElementById("secLista").classList.remove("hidden")
    document.getElementById("contadorTreinos").textContent = treinos.length

    var html = ""
    for (var i = 0; i < treinos.length; i++) {
        var t = treinos[i]
        html += "<tr class='border-b border-gray-100'>" +
            "<td class='py-2 pr-4'>" + t.codigo + "</td>" +
            "<td class='py-2 pr-4'>" + t.jogador + "</td>" +
            "<td class='py-2 pr-4'>" + nomesPosicao[t.posicao] + "</td>" +
            "<td class='py-2 pr-4'>" + nomesTipoTreino[t.tipo] + "</td>" +
            "<td class='py-2 pr-4'>" + t.duracao + " min</td>" +
            "<td class='py-2 pr-4'>" + t.intensidade + "</td>" +
            "<td class='py-2 pr-4 font-semibold'>" + t.carga.toFixed(2) + "</td>" + "</tr>"
    }
    document.getElementById("tabelaTreinos").innerHTML = html
}

//RELATÓRIO FINAL
function gerarRelatorio() {
    if (treinos.length === 0) return

    var jogadores = []

    var somaCargaTipo = { "F": 0, "T": 0, "E": 0 }
    var qtdTreinoTipo = { "F": 0, "T": 0, "E": 0 }

    var somaCargaPosicao = { "G": 0, "Z": 0, "M": 0, "A": 0 }
    var qtdTreinoPosicao = { "G": 0, "Z": 0, "M": 0, "A": 0 }

    for (var i = 0; i < treinos.length; i++) {
        var t = treinos[i]

        // acumula por tipo de treino
        somaCargaTipo[t.tipo] += t.carga
        qtdTreinoTipo[t.tipo]++

        // acumula por posição
        somaCargaPosicao[t.posicao] += t.carga
        qtdTreinoPosicao[t.posicao]++

        // acumula treino por jogador 
        var idx = encontrarIndiceJogador(jogadores, t.jogador)
        if (idx === -1) {
            jogadores.push({
                nome: t.jogador,
                posicao: t.posicao,
                cargaTotal: t.carga,
                quantidadeTreinos: 1
            })
        } else {
            jogadores[idx].cargaTotal += t.carga
            jogadores[idx].quantidadeTreinos++
        }
    }

    // marca risco de lesão de cada jogador
    var qtdRisco = 0
    for (var j = 0; j < jogadores.length; j++) {
        jogadores[j].risco = jogadores[j].cargaTotal > cargaMaxima
        if (jogadores[j].risco) qtdRisco++
    }

    // jogador com maior e menor carga semanal
    var maiorCarga = jogadores[0]
    var menorCarga = jogadores[0]
    for (var k = 0; k < jogadores.length; k++) {
        if (jogadores[k].cargaTotal > maiorCarga.cargaTotal) maiorCarga = jogadores[k]
        if (jogadores[k].cargaTotal < menorCarga.cargaTotal) menorCarga = jogadores[k]
    }

    // carga média por tipo 
    var mediaF = qtdTreinoTipo["F"] > 0 ? (somaCargaTipo["F"] / qtdTreinoTipo["F"]) : 0
    var mediaT = qtdTreinoTipo["T"] > 0 ? (somaCargaTipo["T"] / qtdTreinoTipo["T"]) : 0
    var mediaE = qtdTreinoTipo["E"] > 0 ? (somaCargaTipo["E"] / qtdTreinoTipo["E"]) : 0

    document.getElementById("relatorioConteudo").innerHTML =
        "<div class='bg-gray-50 rounded-xl p-4'><p class='text-gray-500 font-medium'>Total de treinos</p><p class='text-xl font-bold'>" + treinos.length + "</p></div>" +

        "<div class='bg-gray-50 rounded-xl p-4'><p class='text-gray-500 font-medium'>Jogadores com risco de lesão</p><p class='text-xl font-bold'>" + qtdRisco + "</p></div>" +

        "<div class='bg-emerald-50 rounded-xl p-4'><p class='text-gray-500 font-medium'>Maior carga semanal</p>" +
        "<p class='text-lg font-bold'>" + maiorCarga.nome + "</p>" +
        "<p>" + nomesPosicao[maiorCarga.posicao] + " — " + maiorCarga.quantidadeTreinos + " treino(s)</p>" +
        "<p>" + maiorCarga.cargaTotal.toFixed(2) + " pontos</p></div>" +

        "<div class='bg-amber-50 rounded-xl p-4'><p class='text-gray-500 font-medium'>Menor carga semanal</p>" +
        "<p class='text-lg font-bold'>" + menorCarga.nome + "</p>" +
        "<p>" + nomesPosicao[menorCarga.posicao] + " — " + menorCarga.quantidadeTreinos + " treino(s)</p>" +
        "<p>" + menorCarga.cargaTotal.toFixed(2) + " pontos</p></div>" +

        "<div class='bg-gray-50 rounded-xl p-4 sm:col-span-2'><p class='text-gray-500 mb-1 font-medium'>Carga média por tipo de treino</p>" +
        "<p>Físico: " + mediaF.toFixed(2) + "</p>" +
        "<p>Técnico: " + mediaT.toFixed(2) + "</p>" +
        "<p>Estratégico: " + mediaE.toFixed(2) + "</p></div>" +

        "<div class='bg-gray-50 rounded-xl p-4 sm:col-span-2'><p class='text-gray-500 mb-1 font-medium'>Por posição (total de treinos / carga média)</p>" +
        "<p>Goleiro: " + qtdTreinoPosicao["G"] + " treino(s) / carga média " + (qtdTreinoPosicao["G"] > 0 ? (somaCargaPosicao["G"] / qtdTreinoPosicao["G"]).toFixed(2) : "0.00") + "</p>" +
        "<p>Zagueiro: " + qtdTreinoPosicao["Z"] + " treino(s) / carga média " + (qtdTreinoPosicao["Z"] > 0 ? (somaCargaPosicao["Z"] / qtdTreinoPosicao["Z"]).toFixed(2) : "0.00") + "</p>" +
        "<p>Meio-campo: " + qtdTreinoPosicao["M"] + " treino(s) / carga média " + (qtdTreinoPosicao["M"] > 0 ? (somaCargaPosicao["M"] / qtdTreinoPosicao["M"]).toFixed(2) : "0.00") + "</p>" +
        "<p>Atacante: " + qtdTreinoPosicao["A"] + " treino(s) / carga média " + (qtdTreinoPosicao["A"] > 0 ? (somaCargaPosicao["A"] / qtdTreinoPosicao["A"]).toFixed(2) : "0.00") + "</p></div>";

    var htmlJogadores = ""
    for (var m = 0; m < jogadores.length; m++) {
        var jg = jogadores[m]
        htmlJogadores += "<tr class='border-b border-gray-100'>" +
            "<td class='py-2 pr-4'>" + jg.nome + "</td>" +
            "<td class='py-2 pr-4'>" + nomesPosicao[jg.posicao] + "</td>" +
            "<td class='py-2 pr-4'>" + jg.quantidadeTreinos + "</td>" +
            "<td class='py-2 pr-4'>" + jg.cargaTotal.toFixed(2) + "</td>" +
            "<td class='py-2 pr-4'>" + (jg.risco ? "⚠️ Sim" : "Não") + "</td></tr>"
    }
    document.getElementById("tabelaJogadores").innerHTML = htmlJogadores

    document.getElementById("secRelatorio").classList.remove("hidden")
    document.getElementById("secRelatorio").scrollIntoView({ behavior: "smooth" })
}

document.getElementById("btnDefinirConfig").addEventListener("click", definirConfig)
document.getElementById("btnAdicionarTreino").addEventListener("click", adicionarTreino)
document.getElementById("btnGerarRelatorio").addEventListener("click", gerarRelatorio)