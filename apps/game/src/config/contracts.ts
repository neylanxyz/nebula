import type { Address } from "viem";

/** Factory contract — deploy TournamentGameFactory.sol and set here */
export const GAME_FACTORY_ADDRESS: Address =
  "0x457a153E3B49515CE39E4743D905Be1C70FE2AFb";

/** Legacy single-game address (kept for backwards compatibility) */
export const GAME_CONTRACT_ADDRESS: Address =
  "0x8e14F2620532F8908514283311a7742194192A69";

export const NEBULA_NOTE_STORAGE_KEY = "nebula-game-note";
