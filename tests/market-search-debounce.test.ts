import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";

const source=readFileSync(new URL("../components/market-client.tsx",import.meta.url),"utf8");

describe("market search responsiveness",()=>{
  it("uses a short debounce and cancels stale requests",()=>{
    expect(source).toContain("setTimeout(()=>load(undefined,false,controller.signal),180)");
    expect(source).toContain("controller.abort()");
  });
});
