import { createConfig } from "ponder";
import { NEBULA_POOL_ABI } from "./abis/NebulaPoolAbi";

export default createConfig({
  chains: {
    avalancheFuji: {
      id: 43113,
      rpc: process.env.AVALANCHE_RPC_URL ?? "https://api.avax-test.network/ext/bc/C/rpc",
      pollingInterval: 5_000,
      // Avalanche public RPC limits eth_getLogs to 2048 blocks per request
      ethGetLogsBlockRange: 2048,
    },
  },
  contracts: {
    NebulaPrivatePool: {
      chain: "avalancheFuji",
      abi: NEBULA_POOL_ABI,
      address: "0x254d1290a8f977dc2babbbf979cc86a7ac4a83ca",
      startBlock: 52499039,
    },
  },
});
