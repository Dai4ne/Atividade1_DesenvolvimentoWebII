var valorDiaria = null
var valorCafe = null
var reservas = []
var nomesTipoQuarto = { "S": "Standard", "L": "Luxo", "P": "Premium" }
var nomesTemporada = { "B": "Baixa", "A": "Alta", "F": "Feriado" }

// CONFIG INICIAL
function definirConfig() {
    var diaria = parseFloat(document.getElementById('valorDia').value);
    var cafe = parseFloat(document.getElementById('valorCafeDia').value);
    var msg = document.getElementById('msgConfig')

    if (isNaN(diaria) || diaria <= 0 || isNaN(cafe) || cafe <= 0) {
        msg.textContent = "Informe valores válidos."
        return
    }

    valorDiaria = diaria
    valorCafe = cafe
    msg.textContent = "Diária: R$" + diaria.toFixed(2) + " | Café: R$" + cafe.toFixed(2) + " por hóspede/dia."
    
    document.getElementById('secReserva').classList.remove("opacity-40", "pointer-events-none")
}

//VERIFICA SE HÁ CÓDIGO REPETIDO
function codigoReservaJaExiste(codigo) {
    var i = 0
    while (i < reservas.length) {
        if (reservas[i].codigo === codigo) return true;
        i++
    }
    return false
}

//MULTIPLICADOR CONFORME O TIPO DE QUARTO
function multiplicadorTipoQuarto(tipo) {
    switch (tipo) {
        case "S": return 1
        case "L": return 1.5
        case "P": return 2 
        default: return null
    }
}

//AJUSTE DE VALOR DE TEMPORADA
function ajusteTemporada(temporada) {
    switch (temporada) {
        case "B": return 1
        case "A": return 1.25
        case "F": return 1.40
        default: return null
    }
}

//ADICIONA RESERVA SE ESTIVER TUDO CERTO
function adicionarReserva() {
    var codigo = document.getElementById('codigoReserva').value.trim()
    var tipo = document.getElementById('tipoQuarto').value
    var temporada = document.getElementById('temporada').value
    var diarias = parseInt(document.getElementById('quantDiaria').value, 10)
    var hospedes = parseInt(document.getElementById('numHospede').value, 10)
    var cafeIncluso = document.querySelector('input[name="cafeIncluso"][value="sim"]').checked

    var msg = document.getElementById('msgReserva')

    var multiplicador = multiplicadorTipoQuarto(tipo)
    var ajuste = ajusteTemporada(temporada)


    if (!codigo || codigoReservaJaExiste(codigo) || multiplicador === null || ajuste === null || isNaN(diarias) || diarias <= 0 || isNaN(hospedes) || hospedes <= 0) {
        msg.textContent = "Preencha todos os campos corretamente, sem deixar espaços em branco e respeitando o tipo de dado pedido."
        return
    }

    //regras de preço
    var valorDiariaFinal = valorDiaria * multiplicador * ajuste
    var cafeTotal = cafeIncluso ? (valorCafe * hospedes * diarias) : 0
    var valorTotal = (valorDiariaFinal * diarias) + cafeTotal

    reservas.push({
        codigo: codigo,
        tipo: tipo,
        temporada: temporada,
        diarias: diarias,
        hospedes: hospedes,
        cafeIncluso: cafeIncluso,
        valorDiariaFinal: valorDiariaFinal,
        cafeTotal: cafeTotal,
        valorTotal: valorTotal
    })

    mostrarTabela();

    document.getElementById("codigoReserva").value = ""
    document.getElementById("tipoQuarto").value = ""
    document.getElementById("temporada").value = ""
    document.getElementById("quantDiaria").value = ""
    document.getElementById("numHospede").value = ""
    document.querySelector('input[name="cafeIncluso"][value="nao"]').checked = true
    msg.textContent = ""
}

//TABELA DE RESERVAS ADICIONADAS
function mostrarTabela() {
    document.getElementById("secLista").classList.remove("hidden")
    document.getElementById("contadorReservas").textContent = reservas.length

    var html = "";
    for (var i = 0; i < reservas.length; i++) {
        var r = reservas[i]
        html += "<tr class='border-b border-gray-100'>" +
            "<td class='py-2 pr-4'>" + r.codigo + "</td>" +
            "<td class='py-2 pr-4'>" + nomesTipoQuarto[r.tipo] + "</td>" +
            "<td class='py-2 pr-4'>" + nomesTemporada[r.temporada] + "</td>" +
            "<td class='py-2 pr-4'>" + r.diarias + "</td>" +
            "<td class='py-2 pr-4'>" + r.hospedes + "</td>" +
            "<td class='py-2 pr-4'>" + (r.cafeIncluso ? "Sim" : "Não") + "</td>" +
            "<td class='py-2 pr-4 font-semibold'>R$ " + r.valorTotal.toFixed(2) + "</td>" + "</tr>"
    }
    document.getElementById("tabelaReservas").innerHTML = html
}

// RELATÓRIO FINAL
function gerarRelatorio() {
    if (reservas.length === 0) return

    var somaGeral = 0
    var totalPorTipo = { "S": 0, "L": 0, "P": 0 }
    var totalPorTemporada = { "B": 0, "A": 0, "F": 0 }
    var qtdComCafe = 0, qtdSemCafe = 0
    var ocupacaoTotal = 0
    var somaHospedes = 0
    var maisCara = reservas[0]
    var maisBarata = reservas[0]

    for (var i = 0; i < reservas.length; i++) {
        var r = reservas[i]

        somaGeral += r.valorTotal
        totalPorTipo[r.tipo] += r.valorTotal
        totalPorTemporada[r.temporada] += r.valorTotal

        if (r.cafeIncluso) qtdComCafe++
        else qtdSemCafe++

        ocupacaoTotal += r.diarias * r.hospedes
        somaHospedes += r.hospedes

        if (r.valorTotal > maisCara.valorTotal) maisCara = r
        if (r.valorTotal < maisBarata.valorTotal) maisBarata = r
    }

    var mediaPorReserva = somaGeral / reservas.length
    var valorMedioPorHospede = somaHospedes > 0 ? (somaGeral / somaHospedes) : 0

    document.getElementById("relatorioConteudo").innerHTML =
        "<div class='bg-gray-50 rounded-xl p-4'><p class='text-gray-500 font-medium'>Total de reservas</p><p class='text-xl font-bold'>" + reservas.length + "</p></div>" +

        "<div class='bg-gray-50 rounded-xl p-4'><p class='text-gray-500 font-medium'>Valor médio por reserva</p><p class='text-xl font-bold'>R$ " + mediaPorReserva.toFixed(2) + "</p></div>" +

        "<div class='bg-gray-50 rounded-xl p-4 sm:col-span-2'><p class='text-gray-500 mb-1 font-medium'>Valor total por tipo de quarto</p>" +
        "<p>Standard: R$ " + totalPorTipo["S"].toFixed(2) + "</p>" +
        "<p>Luxo: R$ " + totalPorTipo["L"].toFixed(2) + "</p>" +
        "<p>Premium: R$ " + totalPorTipo["P"].toFixed(2) + "</p></div>" +

        "<div class='bg-gray-50 rounded-xl p-4 sm:col-span-2'><p class='text-gray-500 mb-1 font-medium'>Valor total por temporada</p>" +
        "<p>Baixa: R$ " + totalPorTemporada["B"].toFixed(2) + "</p>" +
        "<p>Alta: R$ " + totalPorTemporada["A"].toFixed(2) + "</p>" +
        "<p>Feriado: R$ " + totalPorTemporada["F"].toFixed(2) + "</p></div>" +

        "<div class='bg-emerald-50 rounded-xl p-4'><p class='text-gray-500 font-medium'>Reserva mais cara</p>" +
        "<p class='text-lg font-bold'>" + maisCara.codigo + "</p>" +
        "<p>" + nomesTipoQuarto[maisCara.tipo] + " — " + nomesTemporada[maisCara.temporada] + "</p>" +
        "<p>" + maisCara.hospedes + " hóspede(s)</p>" +
        "<p>R$ " + maisCara.valorTotal.toFixed(2) + "</p></div>" +

        "<div class='bg-amber-50 rounded-xl p-4'><p class='text-gray-500 font-medium'>Reserva mais barata</p>" +
        "<p class='text-lg font-bold'>" + maisBarata.codigo + "</p>" +
        "<p>" + nomesTipoQuarto[maisBarata.tipo] + " — " + nomesTemporada[maisBarata.temporada] + "</p>" +
        "<p>" + maisBarata.hospedes + " hóspede(s)</p>" +
        "<p>R$ " + maisBarata.valorTotal.toFixed(2) + "</p></div>" +

        "<div class='bg-gray-50 rounded-xl p-4'><p class='text-gray-500 font-medium'>Reservas com café / sem café</p>" +
        "<p>Com café: " + qtdComCafe + "</p><p>Sem café: " + qtdSemCafe + "</p></div>" +

        "<div class='bg-gray-50 rounded-xl p-4'><p class='text-gray-500 font-medium'>Ocupação total (diárias × hóspedes)</p>" +
        "<p class='text-xl font-bold'>" + ocupacaoTotal + "</p>" +
        "<p class='mt-1'>Valor médio por hóspede: R$ " + valorMedioPorHospede.toFixed(2) + "</p></div>";

    document.getElementById("secRelatorio").classList.remove("hidden");
    document.getElementById("secRelatorio").scrollIntoView({ behavior: "smooth" });
}

document.getElementById("btnDefinirConfig").addEventListener("click", definirConfig);
document.getElementById("btnAdicionarReserva").addEventListener("click", adicionarReserva);
document.getElementById("btnGerarRelatorio").addEventListener("click", gerarRelatorio);