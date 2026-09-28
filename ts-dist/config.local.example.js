// Copie este arquivo para "config.local.ts" (na mesma pasta) e preencha com os
// endereços reais dos fluxos do Power Automate. "config.local.ts" nunca é
// commitado (está no .gitignore) — é assim que os endereços deixam de ficar
// expostos no código-fonte versionado.
//
// Veja doc_projeto/01-projeto-e-objetivo.md e doc_projeto/02-estrutura-do-codigo.md
// para o que cada fluxo faz.
export const URL_WEBHOOK_POST = "";
export const URL_WEBHOOK_GET = "";
export const URL_WEBHOOK_UPDATE_STATUS = "";
export const URL_WEBHOOK_ADD_HISTORICO = "";
// Senhas dos usuários padrão (bootstrap, usados quando ainda não há usuários
// no cache local). Chave: e-mail; valor: senha. Preencha com as senhas de teste.
export const SENHAS_USUARIOS_PADRAO = {
    "eric.machado@monto.com.br": "defina-uma-senha-aqui",
    "polyana@monto.com.br": "defina-uma-senha-aqui",
    "claudia@monto.com.br": "defina-uma-senha-aqui",
    "admin@monto.com.br": "defina-uma-senha-aqui"
};
// Senha atribuída a usuários importados do Excel sem a coluna Senha preenchida.
export const SENHA_PADRAO_IMPORTACAO = "defina-uma-senha-aqui";
//# sourceMappingURL=config.local.example.js.map