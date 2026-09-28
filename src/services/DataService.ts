import { DocumentoSGI, HistoricoAcao, FilaEnvio } from '../types';

export const CHAVE_HISTORICO = 'docflow_historico_alteracoes';
export const CHAVE_FILA_ENVIOS = 'docflow_fila_envios';
const CHAVE_STORAGE = 'tramitacoes';

// URLs
export const URL_WEBHOOK_POST = "https://defaultadd9956403f342bcb569ac9a4db4e9.f3.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/25/workflows/a2ea498f2b9040639632239654fabbd7/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=kUvzix-PgeMqipfYBcMV10Y9SYbshheJkRAZ516j5ds";
export const URL_WEBHOOK_GET = "https://defaultadd9956403f342bcb569ac9a4db4e9.f3.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/25/workflows/1b68cd300a364c899b8409a481147dc6/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=wg0iVgGwJvqUHQX_TbuZtRhk0FSt1XBeXMGx5t3nFpg";
export const URL_WEBHOOK_ADD_HISTORICO = "https://defaultadd9956403f342bcb569ac9a4db4e9.f3.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/14/workflows/5b486bddbd954aabbb746425c02d92a8/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=MKK1fXEsHh4j9968blH5vPFT1MVF8FT6e13cI0RTTZ0";

export class DataService {
  
  // --- Fila Envios ---
  static obterFilaEnvios(): FilaEnvio[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(CHAVE_FILA_ENVIOS);
      return raw ? JSON.parse(raw) : [];
    } catch (_) { 
      return []; 
    }
  }

  static salvarFilaEnvios(lista: FilaEnvio[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CHAVE_FILA_ENVIOS, JSON.stringify(lista));
    }
  }

  static enfileirarEnvio(tipo: 'CADASTRO' | 'ATUALIZACAO' | 'HISTORICO' | 'ANEXOS', idDocumento: string, payload: any): void {
    const fila = this.obterFilaEnvios();
    fila.push({
      idFila: `PEND-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      tipo,
      idDocumento,
      dados: payload,
      tentativas: 0,
      ultimaTentativa: null,
      ultimoErro: null,
      status: 'pendente'
    });
    this.salvarFilaEnvios(fila);
    this.processarFilaEnvios();
  }

  static async processarFilaEnvios(): Promise<void> {
    const fila = this.obterFilaEnvios();
    let alterado = false;

    for (let i = 0; i < fila.length; i++) {
      const item = fila[i];
      if (item.status !== 'pendente') continue;

      if (item.tentativas >= 5) {
        item.status = 'falhou';
        alterado = true;
        continue;
      }

      let url: string | null = null;
      if (item.tipo === 'CADASTRO') url = URL_WEBHOOK_POST;
      else if (item.tipo === 'HISTORICO') url = URL_WEBHOOK_ADD_HISTORICO;

      if (!url) {
        item.status = 'falhou';
        item.ultimoErro = 'URL não configurada';
        alterado = true;
        continue;
      }

      try {
        item.tentativas++;
        item.ultimaTentativa = new Date().toISOString();
        const resposta = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.dados)
        });
        
        if (resposta.ok) {
          fila.splice(i, 1);
          i--;
          alterado = true;
        } else {
          item.ultimoErro = `HTTP ${resposta.status}`;
          alterado = true;
          break;
        }
      } catch (e: any) {
        item.ultimoErro = e.message;
        alterado = true;
        break;
      }
    }

    if (alterado) {
      this.salvarFilaEnvios(fila);
    }
  }

  // --- Historico ---
  static obterTodoHistorico(): HistoricoAcao[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(CHAVE_HISTORICO);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  static salvarTodoHistorico(lista: HistoricoAcao[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(lista));
    }
  }

  static adicionarHistoricoAlteracao(novoRegistro: HistoricoAcao, enviarNuvem: boolean = false): void {
    const todoHistorico = this.obterTodoHistorico();
    todoHistorico.push(novoRegistro);
    this.salvarTodoHistorico(todoHistorico);

    if (enviarNuvem) {
      this.enfileirarEnvio('HISTORICO', novoRegistro.idDocumento, novoRegistro);
    }
  }

  // --- Mesclar Tramitacoes ---
  static mesclarTramitacoes(listaLocal: DocumentoSGI[], listaRemota: DocumentoSGI[]): DocumentoSGI[] {
    const mapaFinal = new Map<string, DocumentoSGI>();
    const filaEnvios = this.obterFilaEnvios();

    const pegarTimestamp = (dataStr?: string) => {
      if (!dataStr) return 0;
      const t = new Date(dataStr).getTime();
      return isNaN(t) ? 0 : t;
    };

    listaRemota.forEach(item => {
      if (!item.id) return;
      mapaFinal.set(item.id, { ...item });
    });

    listaLocal.forEach(itemLocal => {
      if (!itemLocal.id) return;

      if (mapaFinal.has(itemLocal.id)) {
        const itemRemoto = mapaFinal.get(itemLocal.id)!;
        const tempoLocal = pegarTimestamp(itemLocal.dataModificacao);
        const tempoRemoto = pegarTimestamp(itemRemoto.dataModificacao);
        
        if (tempoLocal > tempoRemoto) {
          mapaFinal.set(itemLocal.id, { ...itemLocal });
        }
      } else {
        const temCadastroPendente = filaEnvios.some(
          f => f.tipo === 'CADASTRO' && f.idDocumento === itemLocal.id
        );
        if (temCadastroPendente) {
          mapaFinal.set(itemLocal.id, { ...itemLocal });
        }
      }
    });

    return Array.from(mapaFinal.values());
  }

  // --- API Integrations ---
  static async buscarDadosDoPowerAutomate(): Promise<{ sucesso: boolean; aviso?: string; itens: DocumentoSGI[] }> {
    if (!URL_WEBHOOK_GET || URL_WEBHOOK_GET.trim() === '') {
      return { sucesso: false, aviso: "URL não configurada.", itens: [] };
    }
    try {
      let resposta = await fetch(URL_WEBHOOK_GET, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" }
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        // Normalmente precisaria converter/normalizar
        return { sucesso: true, itens: dados as DocumentoSGI[] };
      }
      return { sucesso: false, itens: [] };
    } catch (e: any) {
      console.error(e);
      return { sucesso: false, aviso: e.message, itens: [] };
    }
  }
}
