"use client";

import { useAccount } from "wagmi";
import { useGameState } from "./useGameState";

export function useIsOwner() {
  const { address } = useAccount();
  const { owner, isLoading } = useGameState();

  console.log("address", address);
  console.log("owner", owner);

  const isOwner =
    !!address && !!owner && address.toLowerCase() === owner.toLowerCase();

  return { isOwner, isLoading };
}
