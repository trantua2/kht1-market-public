import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";

const source=readFileSync(new URL("../components/site-header.tsx",import.meta.url),"utf8");

describe("Telegram contact link",()=>{
  it("opens the configured Telegram account safely in a new tab",()=>{
    expect(source).toContain("Liên hệ");
    expect(source).toContain('href="https://t.me/cyantou"');
    expect(source).toContain('target="_blank"');
    expect(source).toContain('rel="noopener noreferrer"');
  });
});
