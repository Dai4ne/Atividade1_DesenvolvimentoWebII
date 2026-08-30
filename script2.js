var salarioMinimo = null
var funcionarios = []
var turnos = { 'M': 'Matutino', 'V': 'Vespertino', 'N': 'Noturno' }
var categorias = { 'F': 'Funcionário Operacional', 'G': 'Gerente' }

//DEFINE O SALÁRIO MIN
function definirSalarioMinimo() {
    var valor = parseFloat(document.getElementById('salarioMinimoInput').value);
    var msg = document.getElementById('msgSalarioMinimo')

    if (isNaN(valor) || valor <= 0) {
        msg.textContent = "Informe um salário mínimo válido (maior que zero)."
        return
    }

    salarioMinimo = valor;
    msg.textContent = "Salário mínimo definido: R$" + valor.toFixed(2)
    document.getElementById('secFuncionario').classList.remove("opacity-40", "pointer-events-none")
}

//VERIFICAÇÃO DE CÓDIGO IGUAL
function codigoJaExiste(codigo) {
var i = 0
    while (i < funcionarios.length) {
        if (funcionarios[i].codigo === codigo) return true;
                i++
    }
    return false
}

//VALOR DAS HORAS TRABALHADAS
function valorHora(horas, categoria, turno) {
    var percentual

    if (categoria === 'F') {
        switch (turno) {
            case 'M': percentual = 0.10; break
            case 'V': percentual = 0.15; break
            case 'N': percentual = 0.20; break
            default: return null
        }
    } else if (categoria === 'G') {
        switch (turno) {
            case 'M': percentual = 0.30; break
            case 'V': percentual = 0.35; break
            case 'N': percentual = 0.40; break
            default: return null
        }
    } else {
        return null
    }

    var valorPorHora = salarioMinimo * percentual;
    return horas * valorPorHora;
}

//AUXÍLIO ALIMENTAÇÃO
function auxAlimentacao() {
    if (salarioMinimo <= 800) return salarioMinimo * 0.25;
    else if (salarioMinimo <= 1200) return salarioMinimo * 0.20;
     else return salarioMinimo * 0.15;
}

//BÔNUS DE DESEMPENHO
function calcularBonus(avaliacao) {
    if (avaliacao >= 9) return { valor: salarioMinimo * 0.10, percentual: 10 };
    if (avaliacao >= 7) return { valor: salarioMinimo * 0.05, percentual: 5 };
    if (avaliacao >= 5) return { valor: salarioMinimo * 0.02, percentual: 2 };
    return { valor: 0, percentual: 0 };
}

//SALÁRIO FINAL 
function calcularSalario(horas, categoria, turno, avaliacao) {
    var pagamentoHoras = valorHora(horas, categoria, turno);
    var auxilio = auxAlimentacao();
    var bonus = calcularBonus(avaliacao);

    var total = salarioMinimo + pagamentoHoras + auxilio + bonus.valor;

    return {
        pagamentoHoras: pagamentoHoras,
        auxilio: auxilio,
        bonusValor: bonus.valor,
        bonusPercentual: bonus.percentual,
        total: total
    };
}

//ADICIONA O FUNCIONÁRIO SE ESTIVER TUDO CERTO
 function adicionarFuncionario() {
    var codigo = document.getElementById('codigoFuncionario').value.trim();
    var horas = parseFloat(document.getElementById('horasMes').value);
    var turno = document.getElementById('turnoFunc').value;
    var categoria = document.getElementById('categoriaFuncionario').value;
    var avaliacao = parseFloat(document.getElementById('avalFuncionario').value);

    var msg = document.getElementById("msgFuncionario");

    if (!codigo || codigoJaExiste(codigo) || !horas || !turno || !categoria || avaliacao < 0){
        msg.textContent = "Preencha tudo corretamente (código único, horas, turno, categoria e avaliação).";
        return;
    }

    var resultado = calcularSalario(horas, categoria, turno, avaliacao);

    funcionarios.push({ codigo: codigo, 
        horas: horas, 
        turno: turno, 
        categoria: categoria, 
        avaliacao: avaliacao, 
        pagamentoHoras: resultado.pagamentoHoras, 
        auxilio: resultado.auxilio, 
        bonusValor: resultado.bonusValor, 
        bonusPercentual: resultado.bonusPercentual, 
        total: resultado.total
    });

    mostrarTabela();

    document.getElementById("codigoFuncionario").value = "";
    document.getElementById("horasMes").value = "";
    document.getElementById("turnoFunc").value = "";
    document.getElementById("categoriaFuncionario").value = "";
    document.getElementById("avalFuncionario").value = "";
    msg.textContent = "";
}

//DESENHA A TABELA DE FUNCIONÁRIOS-
function mostrarTabela() {
    document.getElementById("secLista").classList.remove("hidden");
    document.getElementById("contadorFuncionarios").textContent = funcionarios.length;

    var html = "";
    for (var i = 0; i < funcionarios.length; i++) {
        var f = funcionarios[i];
        html += "<tr class='border-b border-gray-100'>" +
            "<td class='py-2 pr-4'>" + f.codigo + "</td>" +
            "<td class='py-2 pr-4'>" + categorias[f.categoria] + "</td>" +
            "<td class='py-2 pr-4'>" + turnos[f.turno] + "</td>" +
            "<td class='py-2 pr-4'>" + f.avaliacao + "</td>" +
            "<td class='py-2 pr-4 font-semibold'>R$ " + f.total.toFixed(2) + "</td>" + "</tr>";
    }
    document.getElementById("tabelaFuncionarios").innerHTML = html;
}

//gera o relatório final
function gerarRelatorio() {
    if (funcionarios.length === 0) return

    var somaGeral = 0
    var somaF = 0, qtdF = 0
    var somaG = 0, qtdG = 0
    var qtdBonus10 = 0, qtdBonus5 = 0, qtdBonus2 = 0, qtdBonus0 = 0;
    var maiorSalario = funcionarios[0]
    var menorSalario = funcionarios[0]

    for (var i = 0; i < funcionarios.length; i++) {
        var f = funcionarios[i];

        somaGeral += f.total

        if (f.categoria === 'F') { somaF += f.total; qtdF++; }
        if (f.categoria === 'G') { somaG += f.total; qtdG++; }

        if (f.bonusPercentual === 10) qtdBonus10++
        else if (f.bonusPercentual === 5) qtdBonus5++
        else if (f.bonusPercentual === 2) qtdBonus2++
        else qtdBonus0++

        if (f.total > maiorSalario.total) maiorSalario = f
        if (f.total < menorSalario.total) menorSalario = f
    }

    var mediaGeral = somaGeral / funcionarios.length;
    var mediaF = qtdF > 0 ? (somaF / qtdF) : 0
    var mediaG = qtdG > 0 ? (somaG / qtdG) : 0

    document.getElementById("relatorioConteudo").innerHTML =
        "<div class='bg-gray-50 rounded-xl p-4'><p class='text-gray-500'>Total de funcionários</p><p class='text-xl font-bold'>" + funcionarios.length + "</p></div>" +

        "<div class='bg-gray-50 rounded-xl p-4'><p class='text-gray-500'>Média salarial geral</p><p class='text-xl font-bold'>R$ " + mediaGeral.toFixed(2) + "</p></div>" +

        "<div class='bg-gray-50 rounded-xl p-4 sm:col-span-2'><p class='text-gray-500 mb-1'>Média salarial por categoria</p>" +
        "<p>Funcionário Operacional: R$ " + mediaF.toFixed(2) + " (" + qtdF + " funcionário(s))</p>" +
        "<p>Gerente: R$ " + mediaG.toFixed(2) + " (" + qtdG + " funcionário(s))</p></div>" +

        "<div class='bg-emerald-50 rounded-xl p-4'><p class='text-gray-500'>Maior salário</p>" +
        "<p class='text-lg font-bold'>" + maiorSalario.codigo + "</p>" +
        "<p>" + categorias[maiorSalario.categoria] + " — " + turnos[maiorSalario.turno] + "</p>" +
        "<p>R$ " + maiorSalario.total.toFixed(2) + "</p></div>" +

        "<div class='bg-amber-50 rounded-xl p-4'><p class='text-gray-500'>Menor salário</p>" +
        "<p class='text-lg font-bold'>" + menorSalario.codigo + "</p>" +
        "<p>" + categorias[menorSalario.categoria] + " — " + turnos[menorSalario.turno] + "</p>" +
        "<p>R$ " + menorSalario.total.toFixed(2) + "</p></div>" +

        "<div class='bg-gray-50 rounded-xl p-4 sm:col-span-2'><p class='text-gray-500 mb-1'>Funcionários por faixa de bônus</p>" +
        "<p>10% (nota 9-10): " + qtdBonus10 + "</p>" +
        "<p>5% (nota 7-8.99): " + qtdBonus5 + "</p>" +
        "<p>2% (nota 5-6.99): " + qtdBonus2 + "</p>" +
        "<p>Sem bônus (nota abaixo de 5): " + qtdBonus0 + "</p></div>";

    document.getElementById("secRelatorio").classList.remove("hidden");
    document.getElementById("secRelatorio").scrollIntoView({ behavior: "smooth" });
}

document.getElementById("btnDefinirSalarioMinimo").addEventListener("click", definirSalarioMinimo);
document.getElementById("btnAdicionarFunc").addEventListener("click", adicionarFuncionario);
document.getElementById("btnGerarRelatorio").addEventListener("click", gerarRelatorio);