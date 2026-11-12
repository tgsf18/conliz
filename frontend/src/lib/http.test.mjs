import assert from "node:assert/strict";
import test from "node:test";
import { CSRF_HEADER, buildHeaders, readCookie } from "./http.mjs";

test("lê o valor de um cookie pelo nome", () => {
  const cookies = "conliz_access_token=abc; XSRF-TOKEN=tok%20123; outro=1";
  assert.equal(readCookie(cookies, "XSRF-TOKEN"), "tok 123");
  assert.equal(readCookie(cookies, "inexistente"), "");
  assert.equal(readCookie(undefined, "XSRF-TOKEN"), "");
});

test("não envia CSRF em métodos seguros", () => {
  const headers = buildHeaders("GET", undefined, "XSRF-TOKEN=abc");
  assert.equal(headers[CSRF_HEADER], undefined);
  assert.equal(headers["Content-Type"], undefined);
});

test("envia CSRF e JSON em métodos que alteram estado", () => {
  const headers = buildHeaders("PATCH", JSON.stringify({ status: "APROVADO" }), "XSRF-TOKEN=abc");
  assert.equal(headers[CSRF_HEADER], "abc");
  assert.equal(headers["Content-Type"], "application/json");
});
