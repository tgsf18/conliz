import assert from "node:assert/strict";
import test from "node:test";
import { isKnownOrcamentoStatus } from "./orcamento-status.mjs";

test("aceita os status do funil comercial", () => {
  assert.equal(isKnownOrcamentoStatus("em_analise"), true);
  assert.equal(isKnownOrcamentoStatus("APROVADO"), true);
});

test("rejeita status fora do funil", () => {
  assert.equal(isKnownOrcamentoStatus("RASCUNHO"), false);
  assert.equal(isKnownOrcamentoStatus(""), false);
});
