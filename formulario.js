export {}; // Faz o VS Code entender que este arquivo tem seu próprio escopo fechado

// 1. Recupera as tramitações existentes no LocalStorage ou inicia uma lista vazia
let tramitacoes = JSON.parse(localStorage.getItem('tramitacoes')) || [];

// 2. Seleciona o formulário pelo ID
const formulario = document.getElementById('form-tramitacao');

// 3. Intercepta o evento de envio (submit)
formulario.addEventListener('submit', function(evento) {
  // Evita o recarregamento da página
  evento.preventDefault();

  // Cria o objeto com os dados preenchidos
  const novaTramitacao = {
    titulo: document.getElementById('titulo').value,
    codigo: document.getElementById('codigo').value,
    tipoDocumento: document.getElementById('tipo-documento').value,
    dataRecebimento: document.getElementById('data-recebimento').value,
    dataRevisao: document.getElementById('data-revisao').value,
    revisao: document.getElementById('revisao').value,
    status: document.getElementById('status').value,
    remetente: document.getElementById('remetente').value,
    area: document.getElementById('area').value,
    disciplina: document.getElementById('disciplina').value,
    observacao: document.getElementById('observacao').value
  };

  // Adiciona a nova tramitação na lista
  tramitacoes.push(novaTramitacao);

  // Salva no LocalStorage em formato de texto JSON
  localStorage.setItem('tramitacoes', JSON.stringify(tramitacoes));

  console.log("Sucesso! Registro salvo no LocalStorage.");
  console.log("Total de documentos cadastrados:", tramitacoes.length);
  console.log("Dados do item salvo:", novaTramitacao);

  // Limpa o formulário na tela para o próximo cadastro
  formulario.reset();
});

let tramitacoes = JSON.parse(localStorage.getItem('tramitacoes')) || [];

const formulario = document.getElementById('form-tramitacao');
const tabelaCorpo = document.getElementById('tabela-corpo');

// Função responsável por desenhar as linhas na tabela
function renderizarTabela() {
  tabelaCorpo.innerHTML = ''; // Limpa a tabela antes de redesenhar

  tramitacoes.forEach(function(item) {
    const linha = document.createElement('tr');

    linha.innerHTML = `
      <td>${item.codigo || '-'}</td>
      <td><strong>${item.titulo}</strong></td>
      <td>${item.tipoDocumento}</td>
      <td>${item.revisao}</td>
      <td>${item.status}</td>
      <td>${item.remetente}</td>
      <td>${item.area || '-'}</td>
    `;

    tabelaCorpo.appendChild(linha);
  });
}

// Intercepta o envio do formulário
formulario.addEventListener('submit', function(evento) {
  evento.preventDefault();

  const novaTramitacao = {
    titulo: document.getElementById('titulo').value,
    codigo: document.getElementById('codigo').value,
    tipoDocumento: document.getElementById('tipo-documento').value,
    dataRecebimento: document.getElementById('data-recebimento').value,
    dataRevisao: document.getElementById('data-revisao').value,
    revisao: document.getElementById('revisao').value,
    status: document.getElementById('status').value,
    remetente: document.getElementById('remetente').value,
    area: document.getElementById('area').value,
    disciplina: document.getElementById('disciplina').value,
    observacao: document.getElementById('observacao').value
  };

  tramitacoes.push(novaTramitacao);
  localStorage.setItem('tramitacoes', JSON.stringify(tramitacoes));

  formulario.reset();
  renderizarTabela(); // Atualiza a tela imediatamente após cadastrar
});

// Renderiza os registros já existentes ao carregar a página
renderizarTabela();