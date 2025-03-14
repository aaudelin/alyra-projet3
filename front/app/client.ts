
import { createPublicClient, http } from 'viem'
import { sepolia, foundry } from 'viem/chains'

export const publicClient = createPublicClient({ 
  chain: foundry,
  transport: http()
})