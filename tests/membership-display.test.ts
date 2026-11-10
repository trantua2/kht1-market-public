import {describe,expect,it} from "vitest";
import {hasMarketAccess,planLabel,statusLabel} from "../lib/membership-display";

describe("membership display",()=>{
  it("uses customer-friendly Vietnamese plan labels",()=>{
    expect(planLabel("market")).toBe("Gói tra cứu");
    expect(planLabel("full")).toBe("Gói hội viên");
    expect(planLabel(null)).toBe("Chưa đăng ký");
  });

  it("uses customer-friendly Vietnamese status labels",()=>{
    expect(statusLabel("active")).toBe("Đang sử dụng");
    expect(statusLabel("paused")).toBe("Tạm dừng");
    expect(statusLabel("expired")).toBe("Đã hết hạn");
    expect(statusLabel("revoked")).toBe("Đã thu hồi");
    expect(statusLabel("none")).toBe("Chưa đăng ký");
  });

  it("recognizes current market access from evaluated features",()=>{
    expect(hasMarketAccess(["market.read"])).toBe(true);
    expect(hasMarketAccess([])).toBe(false);
  });
});
