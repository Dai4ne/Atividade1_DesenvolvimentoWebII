//variáveis globais
var ordens = []
var tipoProduto = {'1': 'Padrão', '2': 'Premium', '3': 'Sob encomenda'}

//VERIFICA CÓDIGO REPETIDO
function codigoOrdemJaExiste(codigo) {
    var i = 0
    while (i < ordens.length) {
        if (ordens[i].codigoOrdem === codigo) return true;
        i++
    }
    return false
}

//VERIFICA TIPO ESCOLHIDO (com o while q foi pedido)
function tipoEhValido(tipo) {
    var tiposValidos = ["1", "2", "3"]
    var i = 0
    while (i < tiposValidos.length) {
        if (tiposValidos[i] === tipo) return true;
        i++
    }
    return false
}

//AJUSTE DO CUSTO UNITÁRIO CONFORME O TIPO
function ajustePorTipo(tipo) {
    switch (tipo) {
        case "1": return 1  
        case "2": return 1.10
        case "3": return 1.20
        default: return null
    }
}

//PROCURA UM PRODUTO QUE JÁ FOI MENCIONADO ANTES
function encontrarIndiceProduto(lista, codigoProduto) {
    var i = 0
    while (i < lista.length) {
        if (lista[i].codigoProduto === codigoProduto) return i
        i++
    }
    return -1
}

//ADICIONA ORDEM SE ESTIVER TUDO CERTO
function adicionarOrdem() {
    var codigoOrdem = document.getElementById('codOrdem').value.trim()
    var codigoProduto = document.getElementById('codProduto').value.trim()
    var tipo = document.getElementById('tipoProduto').value;
    var quantidade = parseInt(document.getElementById('quantidade').value)
    var custoUnitario = parseFloat(document.getElementById('custoUnitario').value)
    var estoqueInicial = parseInt(document.getElementById('estoqueInicial').value)

    var msg = document.getElementById('msgOrdem')

    if (!codigoOrdem || codigoOrdemJaExiste(codigoOrdem) || !codigoProduto || !tipoEhValido(tipo) || isNaN(quantidade) || quantidade <= 0 || isNaN(custoUnitario) || custoUnitario <= 0 || isNaN(estoqueInicial) || estoqueInicial < 0){
        msg.textContent = "Preencha tudo corretamente (códigos únicos, tipo válido, quantidade e custo unitário maiores que zero, estoque inicial zero ou mais).";
        return;
    }

    //regras de negócio
    var ajuste = ajustePorTipo(tipo)
    var custoUnitarioAjustado = custoUnitario * ajuste
    var custoTotal = quantidade * custoUnitarioAjustado
    var estoqueFinal = estoqueInicial + quantidade

    var alertaAlto = estoqueFinal > 5000
    var alertaCritico = estoqueFinal < 500

    ordens.push({
        codigoOrdem: codigoOrdem,
        codigoProduto: codigoProduto,
        tipo: tipo,
        quantidade: quantidade,
        estoqueInicial: estoqueInicial,
        estoqueFinal: estoqueFinal,
        custoUnitarioAjustado: custoUnitarioAjustado,
        custoTotal: custoTotal,
        alertaAlto: alertaAlto,
        alertaCritico: alertaCritico
    });

    mostrarTabela()

    document.getElementById("codOrdem").value = ""
    document.getElementById("codProduto").value = ""
    document.getElementById("tipoProduto").value = ""
    document.getElementById("quantidade").value = ""
    document.getElementById("custoUnitario").value = ""
    document.getElementById("estoqueInicial").value = ""
    msg.textContent = ""
}

// redesenha a tabela de ordens
function mostrarTabela() {
    document.getElementById("secLista").classList.remove("hidden")
    document.getElementById("contadorOrdens").textContent = ordens.length

    var html = "";
    for (var i = 0; i < ordens.length; i++) {
        var o = ordens[i]

        var textoAlerta = "-";
        if (o.alertaAlto) textoAlerta = "Estoque alto"
        if (o.alertaCritico) textoAlerta = "Estoque crítico"

        html += "<tr class='border-b border-gray-100'>" +
            "<td class='py-2 pr-4'>" + o.codigoOrdem + "</td>" +
            "<td class='py-2 pr-4'>" + o.codigoProduto + "</td>" +
            "<td class='py-2 pr-4'>" + tipoProduto[o.tipo] + "</td>" +
            "<td class='py-2 pr-4'>" + o.estoqueFinal + "</td>" +
            "<td class='py-2 pr-4'>" + textoAlerta + "</td>" +
            "<td class='py-2 pr-4 font-semibold'>R$ " + o.custoTotal.toFixed(2) + "</td>" + "</tr>"
    }
    document.getElementById("tabelaOrdens").innerHTML = html
}

// gera o relatório final
function gerarRelatorio() {
    if (ordens.length === 0) return

    var somaCustoTotal = 0
    var estoqueTipo1 = 0, estoqueTipo2 = 0, estoqueTipo3 = 0
    var qtdAlertaAlto = 0, qtdAlertaCritico = 0
    var maiorCusto = ordens[0]
    var menorCusto = ordens[0]
    var produtosConsolidados = []

    for (var i = 0; i < ordens.length; i++) {
        var o = ordens[i]

        somaCustoTotal += o.custoTotal

        if (o.tipo === "1") estoqueTipo1 += o.estoqueFinal
        if (o.tipo === "2") estoqueTipo2 += o.estoqueFinal
        if (o.tipo === "3") estoqueTipo3 += o.estoqueFinal

        if (o.alertaAlto) qtdAlertaAlto++
        if (o.alertaCritico) qtdAlertaCritico++

        if (o.custoTotal > maiorCusto.custoTotal) maiorCusto = o
        if (o.custoTotal < menorCusto.custoTotal) menorCusto = o

        // agrupa por código de produto
        var idx = encontrarIndiceProduto(produtosConsolidados, o.codigoProduto);
        if (idx === -1) {
            produtosConsolidados.push({
                codigoProduto: o.codigoProduto,
                estoqueFinal: o.estoqueFinal,
                valorInvestido: o.custoTotal
            });
        } else {
            produtosConsolidados[idx].estoqueFinal += o.estoqueFinal;
            produtosConsolidados[idx].valorInvestido += o.custoTotal;
        }
    }

    var mediaCustoTotal = somaCustoTotal / ordens.length;

    document.getElementById("relatorioConteudo").innerHTML =
        "<div class='bg-gray-50 rounded-xl p-4'><p class='text-gray-500 font-medium '>Total de ordens</p><p class='text-xl font-bold'>" + ordens.length + "</p></div>" +

        "<div class='bg-gray-50 rounded-xl p-4'><p class='text-gray-500 font-medium '>Média de custo total por ordem</p><p class='text-xl font-bold'>R$ " + mediaCustoTotal.toFixed(2) + "</p></div>" +

        "<div class='bg-gray-50 rounded-xl p-4 sm:col-span-2'><p class='text-gray-500 mb-1 font-medium '>Estoque total final por tipo</p>" +
        "<p>Padrão: " + estoqueTipo1 + "</p>" +
        "<p>Premium: " + estoqueTipo2 + "</p>" +
        "<p>Sob encomenda: " + estoqueTipo3 + "</p></div>" +

        "<div class='bg-emerald-50 rounded-xl p-4'><p class='text-gray-500 font-medium'>Ordem com maior custo total</p>" +
        "<p class='text-lg font-bold'>" + maiorCusto.codigoOrdem + "</p>" +
        "<p>R$ " + maiorCusto.custoTotal.toFixed(2) + "</p></div>" +

        "<div class='bg-amber-50 rounded-xl p-4'><p class='text-gray-500 font-medium '>Ordem com menor custo total</p>" +
        "<p class='text-lg font-bold'>" + menorCusto.codigoOrdem + "</p>" +
        "<p>R$ " + menorCusto.custoTotal.toFixed(2) + "</p></div>" +

        "<div class='bg-gray-50 rounded-xl p-4 sm:col-span-2'><p class='text-gray-500 mb-1 font-medium '>Alertas de estoque</p>" +
        "<p>Estoque alto (> 5000): " + qtdAlertaAlto + " ordem(ns)</p>" +
        "<p>Estoque crítico (< 500): " + qtdAlertaCritico + " ordem(ns)</p></div>";

    var htmlProdutos = "";
    for (var j = 0; j < produtosConsolidados.length; j++) {
        var p = produtosConsolidados[j];
        htmlProdutos += "<tr class='border-b border-gray-100'>" +
            "<td class='py-2 pr-4'>" + p.codigoProduto + "</td>" +
            "<td class='py-2 pr-4'>" + p.estoqueFinal + "</td>" +
            "<td class='py-2 pr-4'>R$ " + p.valorInvestido.toFixed(2) + "</td></tr>";
    }
    document.getElementById("tabelaProdutos").innerHTML = htmlProdutos;

    document.getElementById("secRelatorio").classList.remove("hidden");
    document.getElementById("secRelatorio").scrollIntoView({ behavior: "smooth" });
}

document.getElementById("btnAdicionarOrdem").addEventListener("click", adicionarOrdem)
document.getElementById("btnGerarRelatorio").addEventListener("click", gerarRelatorio)