/**
 * DocFlow Auth Service
 * Centraliza o gerenciamento de usuários, autenticação, controle de sessão
 * e proteção de rotas integrado à base de dados do Excel / SharePoint.
 */

export const CHAVE_USUARIOS = 'docflow_usuarios';
export const CHAVE_SESSAO = 'docflow_sessao_usuario';

// Usuários corporativos padrão (Bootstrap alinhado ao Excel)
export const USUARIOS_PADRAO = [
  {
    id: "USR-001",
    nome: "Eric Machado",
    email: "eric.machado@monto.com.br",
    senha: "monto@123",
    perfil: "Administrador",
    area: "SGI",
    status: "Ativo"
  },
  {
    id: "USR-002",
    nome: "Polyana",
    email: "polyana@monto.com.br",
    senha: "monto@123",
    perfil: "Solicitante",
    area: "Custos",
    status: "Ativo"
  },
  {
    id: "USR-003",
    nome: "Claudia dos Santos",
    email: "claudia@monto.com.br",
    senha: "monto@123",
    perfil: "Qualidade",
    area: "SGI",
    status: "Ativo"
  },
  {
    id: "USR-004",
    nome: "Administrador",
    email: "admin@monto.com.br",
    senha: "admin@123",
    perfil: "Administrador",
    area: "Geral",
    status: "Ativo"
  }
];

/**
 * Obtém a lista de usuários cadastrados
 */
export function obterUsuarios() {
  try {
    if (typeof localStorage === 'undefined') return USUARIOS_PADRAO;
    const raw = localStorage.getItem(CHAVE_USUARIOS);
    if (!raw) {
      salvarUsuarios(USUARIOS_PADRAO);
      return USUARIOS_PADRAO;
    }
    const lista = JSON.parse(raw);
    return Array.isArray(lista) && lista.length > 0 ? lista : USUARIOS_PADRAO;
  } catch (e) {
    console.error("Erro ao obter usuários:", e);
    return USUARIOS_PADRAO;
  }
}

/**
 * Salva a lista de usuários no cache local
 */
export function salvarUsuarios(lista) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(Array.isArray(lista) ? lista : []));
    }
  } catch (e) {
    console.error("Erro ao salvar usuários:", e);
  }
}

/**
 * Normaliza um objeto de linha vindo da aba 'Usuarios' do Excel
 */
export function normalizarItemUsuario(linha) {
  if (!linha || typeof linha !== 'object') return null;

  function getCampo(...nomesPossiveis) {
    const chavesObjeto = Object.keys(linha);
    for (const nome of nomesPossiveis) {
      const nomeLimpo = nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const chaveEncontrada = chavesObjeto.find(k => {
        const kLimpo = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        return kLimpo === nomeLimpo;
      });
      if (chaveEncontrada && linha[chaveEncontrada] !== undefined && linha[chaveEncontrada] !== null) {
        return linha[chaveEncontrada];
      }
    }
    return '';
  }

  const id = getCampo('ID', 'Id', 'Identificador', 'Código', 'Codigo');
  const nome = getCampo('Nome', 'Nome Completo', 'Usuario', 'Usuário');
  const email = getCampo('E-mail', 'Email', 'Login', 'E-mail de Acesso');
  const senha = getCampo('Senha', 'Password', 'PIN');
  const perfil = getCampo('Perfil', 'Cargo', 'Função', 'Funcao', 'Role') || 'Solicitante';
  const area = getCampo('Área', 'Area', 'Setor', 'Departamento') || 'Geral';
  const status = getCampo('Status', 'Situação', 'Situacao', 'Ativo') || 'Ativo';

  if (!email && !nome) return null;

  const emailFinal = String(email || '').trim().toLowerCase();
  const nomeFinal = String(nome || emailFinal.split('@')[0] || 'Usuário').trim();

  return {
    id: String(id || `USR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`).trim(),
    nome: nomeFinal,
    email: emailFinal,
    senha: String(senha || 'monto@123').trim(),
    perfil: String(perfil).trim(),
    area: String(area).trim(),
    status: String(status).trim()
  };
}

/**
 * Autentica o usuário com e-mail/nome e senha
 */
export function autenticar(emailOuUsuario, senha, lembrar = true) {
  const chave = String(emailOuUsuario || '').trim().toLowerCase();
  const pass = String(senha || '').trim();

  if (!chave || !pass) {
    return { sucesso: false, erro: "Preencha o e-mail e a senha para acessar." };
  }

  const usuarios = obterUsuarios();
  const usuario = usuarios.find(u => 
    (u.email && u.email.toLowerCase() === chave) || 
    (u.nome && u.nome.toLowerCase() === chave)
  );

  if (!usuario) {
    return { sucesso: false, erro: "Usuário não cadastrado na base de dados." };
  }

  if (usuario.status && usuario.status.toLowerCase() !== 'ativo') {
    return { sucesso: false, erro: "Este usuário está inativo. Consulte o administrador." };
  }

  if (usuario.senha !== pass) {
    return { sucesso: false, erro: "Senha incorreta. Verifique suas credenciais." };
  }

  // Gera dados da sessão autenticada (sem salvar a senha na sessão)
  const sessao = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    area: usuario.area,
    timestamp: Date.now()
  };

  const storage = lembrar ? localStorage : sessionStorage;
  storage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));

  // Se logou com sucesso, limpa resquício da outra storage
  if (lembrar && typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(CHAVE_SESSAO);
  } else if (!lembrar && typeof localStorage !== 'undefined') {
    localStorage.removeItem(CHAVE_SESSAO);
  }

  return { sucesso: true, usuario: sessao };
}

/**
 * Obtém a sessão do usuário logado atualmente
 */
export function obterUsuarioAtual() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const local = localStorage.getItem(CHAVE_SESSAO);
    if (local) return JSON.parse(local);

    const session = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(CHAVE_SESSAO) : null;
    if (session) return JSON.parse(session);

    return null;
  } catch (e) {
    console.error("Erro ao ler sessão do usuário:", e);
    return null;
  }
}

/**
 * Verifica se há sessão ativa válida
 */
export function estaAutenticado() {
  return obterUsuarioAtual() !== null;
}

/**
 * Encerra a sessão do usuário e redireciona para a tela de login
 */
export function fazerLogout() {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(CHAVE_SESSAO);
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(CHAVE_SESSAO);
  } catch (e) {
    console.error("Erro ao encerrar sessão:", e);
  }
  window.location.href = 'login.html';
}

/**
 * Protege a página atual contra acessos não autorizados.
 * Deve ser invocado no topo de index.html e formulario.html.
 */
export function protegerPagina() {
  if (typeof window === 'undefined') return;

  const paginaAtual = window.location.pathname.split('/').pop() || 'index.html';
  if (paginaAtual === 'login.html') return;

  if (!estaAutenticado()) {
    const destino = encodeURIComponent(paginaAtual);
    window.location.href = `login.html?redirect=${destino}`;
  }
}

/**
 * Configura o badge do usuário no cabeçalho e adiciona a ação de logout no menu
 */
export function configurarHeaderUsuario() {
  const usuario = obterUsuarioAtual();
  if (!usuario) return;

  // Atualiza ou cria o badge no cabeçalho
  const areaDireita = document.querySelector('.header-right-area');
  if (areaDireita) {
    let badge = document.getElementById('header-user-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'header-user-badge';
      badge.className = 'user-profile-badge';
      badge.title = `Conectado como ${usuario.nome} (${usuario.perfil} - ${usuario.area})`;

      // Insere antes do menu de configurações
      const wrapperSettings = document.getElementById('header-settings-wrapper');
      if (wrapperSettings) {
        areaDireita.insertBefore(badge, wrapperSettings);
      } else {
        areaDireita.appendChild(badge);
      }
    }

    const inicial = (usuario.nome || usuario.email || '?').trim().charAt(0).toUpperCase();
    badge.innerHTML = `
      <span class="user-avatar-pill">${inicial}</span>
      <div class="user-info-text">
        <strong class="user-name-text">${usuario.nome}</strong>
        <span class="user-role-text">${usuario.perfil || 'Usuário'}</span>
      </div>
    `;
  }
}

// Expõe globalmente para fácil acesso nos scripts e páginas
if (typeof window !== 'undefined') {
  window.DocFlowAuth = {
    obterUsuarios,
    salvarUsuarios,
    normalizarItemUsuario,
    autenticar,
    obterUsuarioAtual,
    estaAutenticado,
    fazerLogout,
    protegerPagina,
    configurarHeaderUsuario
  };
}

