// Valores reais, migrados de data-service.js durante a conversão para TypeScript.
// Este arquivo está no .gitignore e não deve ser commitado.
// Recomendação registrada em doc_projeto/README.md (achado C1): regenerar
// estas assinaturas no Power Automate assim que possível.
export const URL_WEBHOOK_POST = "https://defaultadd9956403f342bcb569ac9a4db4e9.f3.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/25/workflows/a2ea498f2b9040639632239654fabbd7/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=kUvzix-PgeMqipfYBcMV10Y9SYbshheJkRAZ516j5ds";
export const URL_WEBHOOK_GET = "https://defaultadd9956403f342bcb569ac9a4db4e9.f3.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/25/workflows/1b68cd300a364c899b8409a481147dc6/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=wg0iVgGwJvqUHQX_TbuZtRhk0FSt1XBeXMGx5t3nFpg";
export const URL_WEBHOOK_UPDATE_STATUS = "";
export const URL_WEBHOOK_ADD_HISTORICO = "https://defaultadd9956403f342bcb569ac9a4db4e9.f3.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/14/workflows/5b486bddbd954aabbb746425c02d92a8/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=MKK1fXEsHh4j9968blH5vPFT1MVF8FT6e13cI0RTTZ0";
// Senhas dos usuários padrão (bootstrap), migradas de auth-service.ts
// (achado C2 de doc_projeto/README.md). Chave: e-mail; valor: senha.
export const SENHAS_USUARIOS_PADRAO = {
    "eric.machado@monto.com.br": "monto@123",
    "polyana@monto.com.br": "monto@123",
    "claudia@monto.com.br": "monto@123",
    "admin@monto.com.br": "admin@123"
};
// Senha atribuída a usuários importados do Excel sem a coluna Senha preenchida.
export const SENHA_PADRAO_IMPORTACAO = "monto@123";
//# sourceMappingURL=config.local.js.map