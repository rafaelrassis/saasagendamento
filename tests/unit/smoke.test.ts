import { describe, expect, it } from "vitest";

// Garante que a infraestrutura de teste está de pé desde o primeiro commit.
// O desenvolvimento é feito por celular, sem servidor local: sem CI verde não
// há como saber que algo quebrou antes do deploy.
describe("infraestrutura de teste", () => {
  it("executa", () => {
    expect(true).toBe(true);
  });
});
