import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, foundry } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID ?? "",
  chains: [sepolia, foundry],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
