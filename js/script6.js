var metaMensal = null
var percentualBase = null
var vendas = []
var nomesRegiao = { "1": "Norte", "2": "Nordeste", "3": "Sudeste", "4": "Sul" }
var nomesTipoCliente = { "PF": "Pessoa Física", "PJ": "Pessoa Jurídica" }

// CONFIGURAÇÃO INICIAL
function definirConfig() {
    var meta = parseFloat(document.getElementById('metaMensal').value);
    var percentual = parseFloat(document.getElementById('percentualBase').value);
    var msg = document.getElementById('msgConfig');

    if (isNaN(meta) || meta <= 0 ||isNaN(percentual) || percentual <= 0) {
        msg.textContent = "Informe valores válidos (sem campos em branco e valores maior que 0).";
        return
    }

    metaMensal = meta
    percentualBase = percentual / 100

    msg.textContent = "Meta: R$ " + meta.toFixed(2) + " | Comissão base: " + percentual.toFixed(2) + "%"
    document.getElementById('secVenda').classList.remove("opacity-40", "pointer-events-none")
}

// VERIFICA SE HÁ CÓDIGO REPETIDO
function codigoVendaJaExiste(codigo) {
    var i = 0
    while (i < vendas.length) {
        if (vendas[i].codigoVenda === codigo) return true
        i++
    }
    return false
}

// BONUS POR TIPO DE CLIENTE
function bonusPorTipoCliente(tipo, valorVenda) {
    switch (tipo) {
        case "PF": return valorVenda * 0.02
        case "PJ": return valorVenda * 0.03
        default: return null
    }
}

// BONUS POR REGIÃO 
function bonusPorRegiao(regiao, valorVenda) {
    switch (regiao) {
        case "1": return valorVenda * 0.01
        case "2": return valorVenda * 0.01
        case "3": return 0
        case "4": return valorVenda * 0.005
        default: return null
    }
}

// CONFERE SE UM CLIENTE JÁ APARECEU
function encontrarIndiceVendedor(lista, codigoVendedor) {
    var i = 0
    while (i < lista.length) {
        if (lista[i].codigoVendedor === codigoVendedor) return i
        i++
    }
    return -1
}

//ADICIONA NOVA VENDA SE ESTIVER TUDO CERTO
function adicionarVenda() {
    var codigoVenda = document.getElementById('codigoVenda').value.trim()
    var codigoVendedor = document.getElementById('codigoVendedor').value.trim()
    var regiao = document.getElementById('regiaoLoja').value
    var tipoCliente = document.getElementById('tipoCliente').value
    var valorVenda = parseFloat(document.getElementById('valorVenda').value)

    var msg = document.getElementById('msgVenda');
    var bonusTipo = bonusPorTipoCliente(tipoCliente, valorVenda)
    var bonusRegiao = bonusPorRegiao(regiao, valorVenda)

    if (!codigoVenda || codigoVendaJaExiste(codigoVenda) || !codigoVendedor || isNaN(valorVenda) || valorVenda <= 0 || bonusTipo === null || bonusRegiao === null) {
        msg.textContent = "Informe dados válidos (sem campos nulo e valores maior que zero)."
        return
    }

    // regras de comissão 
    var comissaoBase = valorVenda * percentualBase
    var comissaoTotal = comissaoBase + bonusTipo + bonusRegiao

    vendas.push({
        codigoVenda: codigoVenda,
        codigoVendedor: codigoVendedor,
        regiao: regiao,
        tipoCliente: tipoCliente,
        valorVenda: valorVenda,
        comissaoTotal: comissaoTotal
    });

    mostrarTabela();

    document.getElementById("codigoVenda").value = ""
    document.getElementById("codigoVendedor").value = ""
    document.getElementById("regiaoLoja").value = ""
    document.getElementById("tipoCliente").value = ""
    document.getElementById("valorVenda").value = ""
    msg.textContent = ""
}

// TABELA DE VENDAS 
function mostrarTabela() {
    document.getElementById("secLista").classList.remove("hidden")
    document.getElementById("contadorVendas").textContent = vendas.length

    var html = "";
    for (var i = 0; i < vendas.length; i++) {
        var v = vendas[i]
        html += "<tr class='border-b border-gray-100'>" +
            "<td class='py-2 pr-4'>" + v.codigoVenda + "</td>" +
            "<td class='py-2 pr-4'>" + v.codigoVendedor + "</td>" +
            "<td class='py-2 pr-4'>" + nomesRegiao[v.regiao] + "</td>" +
            "<td class='py-2 pr-4'>" + nomesTipoCliente[v.tipoCliente] + "</td>" +
            "<td class='py-2 pr-4'>R$ " + v.valorVenda.toFixed(2) + "</td>" +
            "<td class='py-2 pr-4 font-semibold'>R$ " + v.comissaoTotal.toFixed(2) + "</td>" + "</tr>"
    }
    document.getElementById("tabelaVendas").innerHTML = html
}

// RELATÓRIO
function gerarRelatorio() {
    if (vendas.length === 0) return

    var totalPorRegiao = { "1": 0, "2": 0, "3": 0, "4": 0 }
    var totalPorTipoCliente = { "PF": 0, "PJ": 0 }
    var qtdVendasPorRegiao = { "1": 0, "2": 0, "3": 0, "4": 0 }
    var vendedores = []

    //para média
    var somaComissaoGeral = 0
    var somaComissaoPorRegiao = { "1": 0, "2": 0, "3": 0, "4": 0 }

    for (var i = 0; i < vendas.length; i++) {
        var v = vendas[i]

        totalPorRegiao[v.regiao] += v.valorVenda
        totalPorTipoCliente[v.tipoCliente] += v.valorVenda

        somaComissaoGeral += v.comissaoTotal
        somaComissaoPorRegiao[v.regiao] += v.comissaoTotal
        qtdVendasPorRegiao[v.regiao]++

        // agrupa por vendedor
        var idx = encontrarIndiceVendedor(vendedores, v.codigoVendedor)
        if (idx === -1) {
            vendedores.push({
                codigoVendedor: v.codigoVendedor,
                valorTotalVendido: v.valorVenda,
                comissaoTotalAcumulada: v.comissaoTotal
            });
        } else {
            vendedores[idx].valorTotalVendido += v.valorVenda
            vendedores[idx].comissaoTotalAcumulada += v.comissaoTotal
        }
    }

    // vendedor com maior valor total de vendas e Maior comissão total
    var maiorValorVendido = vendedores[0]
    var maiorComissao = vendedores[0]
    var qtdBateramMeta = 0

    for (var j = 0; j < vendedores.length; j++) {
        var vd = vendedores[j]
        if (vd.valorTotalVendido > maiorValorVendido.valorTotalVendido) maiorValorVendido = vd
        if (vd.comissaoTotalAcumulada > maiorComissao.comissaoTotalAcumulada) maiorComissao = vd
        if (vd.valorTotalVendido >= metaMensal) qtdBateramMeta++
    }

    var comissaoMediaGeral = somaComissaoGeral / vendas.length

    document.getElementById("relatorioConteudo").innerHTML =
        "<div class='bg-gray-50 rounded-xl p-4'><p class='text-gray-500 font-medium'>Total de vendas</p><p class='text-xl font-bold'>" + vendas.length + "</p></div>" +

        "<div class='bg-gray-50 rounded-xl p-4'><p class='text-gray-500 font-medium'>Comissão média geral</p><p class='text-xl font-bold'>R$ " + comissaoMediaGeral.toFixed(2) + "</p></div>" +

        "<div class='bg-gray-50 rounded-xl p-4 sm:col-span-2'><p class='text-gray-500 mb-1 font-medium'>Valor total vendido por região</p>" +
        "<p>Norte: R$ " + totalPorRegiao["1"].toFixed(2) + "</p>" +
        "<p>Nordeste: R$ " + totalPorRegiao["2"].toFixed(2) + "</p>" +
        "<p>Sudeste: R$ " + totalPorRegiao["3"].toFixed(2) + "</p>" +
        "<p>Sul: R$ " + totalPorRegiao["4"].toFixed(2) + "</p></div>" +

        "<div class='bg-gray-50 rounded-xl p-4 sm:col-span-2'><p class='text-gray-500 mb-1 font-medium'>Valor total vendido por tipo de cliente</p>" +
        "<p>Pessoa Física: R$ " + totalPorTipoCliente["PF"].toFixed(2) + "</p>" +
        "<p>Pessoa Jurídica: R$ " + totalPorTipoCliente["PJ"].toFixed(2) + "</p></div>" +

        "<div class='bg-emerald-50 rounded-xl p-4'><p class='text-gray-500 font-medium'>Maior valor total vendido</p>" +
        "<p class='text-lg font-bold'>" + maiorValorVendido.codigoVendedor + "</p>" +
        "<p>R$ " + maiorValorVendido.valorTotalVendido.toFixed(2) + "</p></div>" +

        "<div class='bg-emerald-50 rounded-xl p-4'><p class='text-gray-500 font-medium'>Maior comissão total</p>" +
        "<p class='text-lg font-bold'>" + maiorComissao.codigoVendedor + "</p>" +
        "<p>R$ " + maiorComissao.comissaoTotalAcumulada.toFixed(2) + "</p></div>" +

        "<div class='bg-gray-50 rounded-xl p-4'><p class='text-gray-500 font-medium'>Vendedores que bateram a meta</p><p class='text-xl font-bold'>" + qtdBateramMeta + " de " + vendedores.length + "</p></div>" +

        "<div class='bg-gray-50 rounded-xl p-4 sm:col-span-2'><p class='text-gray-500 mb-1 font-medium'>Comissão média por região</p>" +
        "<p>Norte: R$ " + (qtdVendasPorRegiao["1"] > 0 ? (somaComissaoPorRegiao["1"] / qtdVendasPorRegiao["1"]).toFixed(2) : "0.00") + "</p>" +
        "<p>Nordeste: R$ " + (qtdVendasPorRegiao["2"] > 0 ? (somaComissaoPorRegiao["2"] / qtdVendasPorRegiao["2"]).toFixed(2) : "0.00") + "</p>" +
        "<p>Sudeste: R$ " + (qtdVendasPorRegiao["3"] > 0 ? (somaComissaoPorRegiao["3"] / qtdVendasPorRegiao["3"]).toFixed(2) : "0.00") + "</p>" +
        "<p>Sul: R$ " + (qtdVendasPorRegiao["4"] > 0 ? (somaComissaoPorRegiao["4"] / qtdVendasPorRegiao["4"]).toFixed(2) : "0.00") + "</p></div>"

    var htmlVendedores = "";
    for (var k = 0; k < vendedores.length; k++) {
        var vend = vendedores[k];
        var bateuMeta = vend.valorTotalVendido >= metaMensal;
        htmlVendedores += "<tr class='border-b border-gray-100'>" +
            "<td class='py-2 pr-4'>" + vend.codigoVendedor + "</td>" +
            "<td class='py-2 pr-4'>R$ " + vend.valorTotalVendido.toFixed(2) + "</td>" +
            "<td class='py-2 pr-4'>R$ " + vend.comissaoTotalAcumulada.toFixed(2) + "</td>" +
            "<td class='py-2 pr-4'>" + (bateuMeta ? "Sim" : "Não") + "</td></tr>";
    }
    document.getElementById("tabelaVendedores").innerHTML = htmlVendedores;

    document.getElementById("secRelatorio").classList.remove("hidden");
    document.getElementById("secRelatorio").scrollIntoView({ behavior: "smooth" });
}

document.getElementById("btnDefinirConfig").addEventListener("click", definirConfig);
document.getElementById("btnAdicionarVenda").addEventListener("click", adicionarVenda);
document.getElementById("btnGerarRelatorio").addEventListener("click", gerarRelatorio);