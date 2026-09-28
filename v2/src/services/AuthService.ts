import { Usuario } from '../types';

export const CHAVE_SESSAO = 'docflow_sessao_usuario';

export class AuthService {
  static obterUsuarioLogado(): Usuario | null {
    if (typeof localStorage === 'undefined' && typeof sessionStorage === 'undefined') {
      return null;
    }

    try {
      const local = localStorage?.getItem(CHAVE_SESSAO);
      if (local) return JSON.parse(local) as Usuario;

      const session = sessionStorage?.getItem(CHAVE_SESSAO);
      if (session) return JSON.parse(session) as Usuario;
    } catch (e) {
      console.error("Erro ao ler sessão do usuário:", e);
    }
    return null;
  }

  static estaAutenticado(): boolean {
    return this.obterUsuarioLogado() !== null;
  }

  static fazerLogout(): void {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(CHAVE_SESSAO);
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(CHAVE_SESSAO);
    if (typeof window !== 'undefined') {
      window.location.href = 'login.html';
    }
  }
}
