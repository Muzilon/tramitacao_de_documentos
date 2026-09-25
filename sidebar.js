/**
 * sidebar.js
 * Controla a sidebar flutuante colapsável do DocFlow: alterna entre os modos
 * expandido/colapsado (com preferência salva em localStorage) e posiciona
 * dinamicamente o "recorte" côncavo que funde o item de navegação ativo com
 * a cor de fundo da página, usando as coordenadas reais do link ativo.
 */

const CHAVE_ARMAZENAMENTO = 'docflow_sidebar_colapsada';

const ICONE_SETA_ESQUERDA = `
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
`;

const ICONE_SETA_DIREITA = `
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
`;

/**
 * Posiciona o recorte côncavo (corpo + duas "orelhas") exatamente sobre o
 * link ativo da navegação, usando as coordenadas reais renderizadas —
 * assim o efeito funciona corretamente independente de qual item está
 * ativo (Painel ou Novo Registro) ou do tamanho da fonte carregada.
 */
function posicionarRecorte(sidebar) {
  const notchBody = document.getElementById('sidebar-notch-body');
  const earTop = document.getElementById('sidebar-notch-ear-top');
  const earBottom = document.getElementById('sidebar-notch-ear-bottom');
  const linkAtivo = sidebar.querySelector('.sidebar-link.active');

  if (!notchBody || !earTop || !earBottom) return;

  if (sidebar.classList.contains('collapsed') || !linkAtivo) {
    sidebar.classList.remove('notch-ready');
    return;
  }

  const railRect = sidebar.getBoundingClientRect();
  const linkRect = linkAtivo.getBoundingClientRect();

  const topRelativo = linkRect.top - railRect.top;
  const altura = linkRect.height;

  const tamanhoOrelha = 20; // deve casar com o raio do radial-gradient das orelhas (CSS)
  const profundidade = 64; // quanto o recorte invade a rail a partir da borda direita
  const extensao = 10; // quanto o recorte ultrapassa a borda direita da rail

  const larguraRail = railRect.width;
  const esquerda = larguraRail - profundidade;

  notchBody.style.left = `${esquerda}px`;
  notchBody.style.top = `${topRelativo}px`;
  notchBody.style.width = `${profundidade + extensao}px`;
  notchBody.style.height = `${altura}px`;

  earTop.style.left = `${esquerda}px`;
  earTop.style.top = `${topRelativo - tamanhoOrelha}px`;
  earTop.style.width = `${tamanhoOrelha}px`;
  earTop.style.height = `${tamanhoOrelha}px`;

  earBottom.style.left = `${esquerda}px`;
  earBottom.style.top = `${topRelativo + altura}px`;
  earBottom.style.width = `${tamanhoOrelha}px`;
  earBottom.style.height = `${tamanhoOrelha}px`;

  sidebar.classList.add('notch-ready');
}

/**
 * Aplica o estado (colapsada ou expandida) na sidebar, no botão de alternância
 * e reposiciona o recorte em seguida (no próximo frame, para já refletir a
 * largura final após a transição de CSS iniciar).
 */
function aplicarEstadoSidebar(sidebar, botaoToggle, colapsada) {
  sidebar.classList.toggle('collapsed', colapsada);

  if (botaoToggle) {
    botaoToggle.setAttribute('aria-label', colapsada ? 'Expandir menu' : 'Colapsar menu');
    botaoToggle.setAttribute('title', colapsada ? 'Expandir menu' : 'Colapsar menu');
    botaoToggle.innerHTML = colapsada ? ICONE_SETA_DIREITA : ICONE_SETA_ESQUERDA;
  }

  requestAnimationFrame(() => posicionarRecorte(sidebar));
}

/**
 * Inicializa a sidebar da página atual: liga o botão de colapsar/expandir,
 * restaura a preferência salva e mantém o recorte alinhado ao redimensionar
 * a janela ou quando a fonte Inter terminar de carregar (evita descompasso
 * no primeiro paint, quando a largura do texto ainda pode mudar).
 */
export function inicializarSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  if (!sidebar) return;

  const botaoToggle = document.getElementById('sidebar-toggle-btn');

  let colapsadaSalva = false;
  try {
    colapsadaSalva = localStorage.getItem(CHAVE_ARMAZENAMENTO) === '1';
  } catch (e) {
    // Armazenamento indisponível (modo privado, etc.): segue com o padrão expandido.
  }

  aplicarEstadoSidebar(sidebar, botaoToggle, colapsadaSalva);

  if (botaoToggle) {
    botaoToggle.addEventListener('click', () => {
      const novoEstado = !sidebar.classList.contains('collapsed');
      try {
        localStorage.setItem(CHAVE_ARMAZENAMENTO, novoEstado ? '1' : '0');
      } catch (e) {
        // Ignora falha de armazenamento; a preferência só não persiste entre sessões.
      }
      aplicarEstadoSidebar(sidebar, botaoToggle, novoEstado);
    });
  }

  window.addEventListener('resize', () => posicionarRecorte(sidebar));

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => posicionarRecorte(sidebar));
  }
}
