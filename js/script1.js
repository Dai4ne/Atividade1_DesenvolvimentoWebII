// dados salvos na memória da página
var precoCombustivel = null
var pedidos = []
var nomesRegiao = { "1": "Sudeste", "2": "Sul", "3": "Centro-Oeste" }

//PREÇO DO COMBUSTÍVEL
function definirCombustivel() {
    var valor = parseFloat(document.getElementById("precoCombustivel").value);

    //se for digitado algo NaN ou não for digitado nada 
    if (isNaN(valor) || valor <= 0) {
        document.getElementById("msgCombustivel").textContent = "Preço inválido."
        return;
    }
    precoCombustivel = valor;
    document.getElementById("msgCombustivel").textContent = "Combustível definido: R$" + valor.toFixed(2);

    document.getElementById("secPedido").classList.remove("opacity-40", "pointer-events-none");
}

//PREÇO DA PEÇA POR REGIÃO
function precoPorPeca(regiao) {
    switch (regiao) {
        case "1": return 1.20
        case "2": return 1.30
        case "3": return 1.50
        default: return null
    }
}

//VERIFICA SE HÁ CÓDIGO REPETIDO
function codigoJaExiste(codigo) {
    var i = 0
    while (i < pedidos.length) {
        if (pedidos[i].codigo === codigo) return true;
        i++;
    }
    return false;
}

//VALOR DAS PEÇAS, 12% de desconto quando >1000 unidades
function calcularValorPecas(qtd, preco) {
    if (qtd <= 1000) return qtd * preco;
    var excedente = qtd - 1000
    return (1000 * preco) + (excedente * preco * 0.88);
}


//ADICIONA UM PEDIDO A LISTA SE ESTIVER TUDO CERTO
function adicionarPedido() {
    var codigo = document.getElementById("codigoPedido").value.trim()
    var regiao = document.getElementById("regiao").value
    var distancia = parseFloat(document.getElementById("distancia").value)
    var qtd = parseInt(document.getElementById("quantidadePecas").value)
    var rastreio = document.querySelector('input[name="rastreamento"][value="sim"]').checked

    var preco = precoPorPeca(regiao);
    var msg = document.getElementById("msgPedido");

    //validação de informações
    if (!codigo || codigoJaExiste(codigo) || !preco || !distancia || !qtd) {
        msg.textContent = "Preencha tudo corretamente (código único, região, distância e peças > 0).";
        return;
    }

    var total = calcularValorPecas(qtd, preco) + (distancia * precoCombustivel) + (rastreio ? 200 : 0)

    pedidos.push({ codigo: codigo, regiao: regiao, distancia: distancia, qtd: qtd, rastreio: rastreio, total: total })

    mostrarTabela()
    //limpa os campos do formulário
    document.getElementById("codigoPedido").value = ""
    document.getElementById("regiao").value = ""
    document.getElementById("distancia").value = ""
    document.getElementById("quantidadePecas").value = ""
    msg.textContent = ""
}


//CONSTRÓI A TABELA COM OS PEDIDOS
function mostrarTabela() {
    document.getElementById("secLista").classList.remove("hidden")
    document.getElementById("contadorPedidos").textContent = pedidos.length

    var html = ""
    for (var i = 0; i < pedidos.length; i++) {
        var p = pedidos[i];
        html += "<tr class='border-b border-gray-100'>" +
            "<td class='py-2 pr-4'>" + p.codigo + "</td>" +
            "<td class='py-2 pr-4'>" + nomesRegiao[p.regiao] + "</td>" +
            "<td class='py-2 pr-4'>" + p.distancia + " km</td>" +
            "<td class='py-2 pr-4'>" + p.qtd + "</td>" +
            "<td class='py-2 pr-4'>" + (p.rastreio ? "Sim" : "Não") + "</td>" +
            "<td class='py-2 pr-4 font-semibold'>R$ " + p.total.toFixed(2) + "</td>";
    }
    document.getElementById("tabelaPedidos").innerHTML = html;
}


//RELATÓRIO FINAL
function gerarRelatorio() {
    if (pedidos.length === 0) return;
 
    var soma = 0, r1 = 0, r2 = 0, r3 = 0
    var maisCaro = pedidos[0], maisBarato = pedidos[0]

    //passa por todos os pedidos e suas regiões
    for (var i = 0; i < pedidos.length; i++) {
        var p = pedidos[i]
        soma += p.total
        if (p.regiao === "1") r1 += p.total
        if (p.regiao === "2") r2 += p.total
        if (p.regiao === "3") r3 += p.total
        if (p.total > maisCaro.total) maisCaro = p
        if (p.total < maisBarato.total) maisBarato = p
    }

    var media = soma / pedidos.length;

    document.getElementById("relatorioConteudo").innerHTML =
        "<div class='bg-gray-50 rounded-xl p-4'><p class='font-medium'>Total de pedidos</p><p class='text-xl font-bold'>" + pedidos.length + "</p></div>" +
        "<div class='bg-gray-50 rounded-xl p-4'><p class='font-medium'>Valor médio</p><p class='text-xl font-bold'>R$ " + media.toFixed(2) + "</p></div>" +
        "<div class='bg-gray-50 rounded-xl p-4 sm:col-span-2'><p class='font-medium mb-1'>Total por região</p>" +
        "<p>Sudeste: R$ " + r1.toFixed(2) + "</p><p>Sul: R$ " + r2.toFixed(2) + "</p><p>Centro-Oeste: R$ " + r3.toFixed(2) + "</p></div>" +
        "<div class='bg-emerald-50 rounded-xl p-4'><p class='font-medium'>Mais caro</p><p class='text-lg font-bold'>" + maisCaro.codigo + "</p><p>R$ " + maisCaro.total.toFixed(2) + "</p></div>" +
        "<div class='bg-amber-50 rounded-xl p-4'><p class='font-medium'>Mais barato</p><p class='text-lg font-bold'>" + maisBarato.codigo + "</p><p>R$ " + maisBarato.total.toFixed(2) + "</p></div>";

    document.getElementById("secRelatorio").classList.remove("hidden");
    document.getElementById("secRelatorio").scrollIntoView({ behavior: "smooth" });
}

document.getElementById("btnDefinirCombustivel").addEventListener("click", definirCombustivel);
document.getElementById("btnAdicionarPedido").addEventListener("click", adicionarPedido);
document.getElementById("btnGerarRelatorio").addEventListener("click", gerarRelatorio);