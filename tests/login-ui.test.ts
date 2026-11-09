import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("login UI", () => {
  it("uses a stable dedicated auth layout", () => {
    const page = readFileSync("app/login/page.tsx", "utf8");
    const form = readFileSync("components/password-auth-form.tsx", "utf8");
    const css = readFileSync("app/globals.css", "utf8");
    expect(page).toContain('className="auth-page"');
    expect(form).toContain('className="auth-card"');
    expect(form).toContain("auth-message");
    expect(css).toContain("min-height:100vh");
    expect(css).toContain("min-height:44px");
  });
});
