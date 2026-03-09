import { describe, it, expect } from "vitest";
import {
  NebulaAvalanche,
  NEBULA_CONTRACT_ADDRESS,
  VERIFIER_CONTRACT_ADDRESS,
  AVALANCHE_FUJI_CHAIN_ID,
  TREE_DEPTH,
  NEBULA_START_BLOCK,
  NEBULA_POOL_ABI,
  VERIFIER_ABI,
  // Re-exported core functions
  createNote,
  encodeNote,
  decodeNote,
  getPoseidon,
  // Re-exported errors
  NebulaError,
  ContractError,
} from "../src/index.js";

describe("nebula-avalanche wiring", () => {
  it("exports correct Avalanche Fuji constants", () => {
    expect(NEBULA_CONTRACT_ADDRESS).toBe(
      "0x8e14F2620532F8908514283311a7742194192A69",
    );
    expect(VERIFIER_CONTRACT_ADDRESS).toBe(
      "0xEf4feB1ab6fcCF29ac1217A500Db187dE2758ac1",
    );
    expect(AVALANCHE_FUJI_CHAIN_ID).toBe(43113);
    expect(TREE_DEPTH).toBe(20);
    expect(NEBULA_START_BLOCK).toBe(52428383n);
  });

  it("exports NEBULA_POOL_ABI with expected functions", () => {
    const functionNames = NEBULA_POOL_ABI.filter(
      (item) => item.type === "function",
    )
      .map((item) => ("name" in item ? item.name : undefined))
      .filter(Boolean);

    expect(functionNames).toContain("deposit");
    expect(functionNames).toContain("withdraw");
    expect(functionNames).toContain("DENOMINATION");
    expect(functionNames).toContain("isSpent");
    expect(functionNames).toContain("isBlacklisted");
  });

  it("exports VERIFIER_ABI with verify function", () => {
    const verifyFn = VERIFIER_ABI.find(
      (item) =>
        item.type === "function" && "name" in item && item.name === "verify",
    );
    expect(verifyFn).toBeDefined();
  });

  it("re-exports core ZK functions from @neylanxyz/nebula", () => {
    expect(typeof createNote).toBe("function");
    expect(typeof encodeNote).toBe("function");
    expect(typeof decodeNote).toBe("function");
    expect(typeof getPoseidon).toBe("function");
  });

  it("re-exports error classes from @neylanxyz/nebula", () => {
    const error = new ContractError("test");
    expect(error).toBeInstanceOf(NebulaError);
    expect(error.message).toBe("test");
  });

  it("creates NebulaAvalanche instance with default addresses", () => {
    const nebula = new NebulaAvalanche({
      rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    });

    expect(nebula).toBeInstanceOf(NebulaAvalanche);
    expect(nebula.getReader()).toBeDefined();
    expect(nebula.getWriter()).toBeDefined();
  });
});
