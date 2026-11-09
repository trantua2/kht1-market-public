import {describe,expect,it} from "vitest";
import {isAdminRole} from "../lib/admin";
describe("admin role",()=>{it("accepts only admin",()=>{expect(isAdminRole("admin")).toBe(true);expect(isAdminRole("user")).toBe(false);expect(isAdminRole(undefined)).toBe(false)})});
