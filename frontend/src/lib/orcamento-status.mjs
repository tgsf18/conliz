export const ORCAMENTO_STATUSES = ["NOVO", "EM_ANALISE", "ENVIADO", "APROVADO", "RECUSADO"];

export function isKnownOrcamentoStatus(status) {
  return ORCAMENTO_STATUSES.includes(String(status || "").toUpperCase());
}
