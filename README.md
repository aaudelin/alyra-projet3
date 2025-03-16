# Project 3

## Rendus projet
1. Déploiement SC Sepolia : [0xce1dB80Cd70c630DCb96F287443e6e6585839805](https://sepolia.etherscan.io/address/0xce1dB80Cd70c630DCb96F287443e6e6585839805)
2. Déploiement Vercel Front: [Vercel](https://alyra-projet3-4ictil86p-aaudelins-projects.vercel.app/)
3. Vidéo fonctionnalités


## Setup
```bash
forge build
```

## Local

Run anvil
```bash
anvil
```

Deploy contract
```bash
forge script script/Voting.s.sol:VotingScript --rpc-url 127.0.0.1:8545 --private-key $PRIVATE_KEY --broadcast
```

Update the `front/.env` with the contract address
```yml
NEXT_PUBLIC_CONTRACT_ADDRESS= # From deployed contract address
NEXT_PUBLIC_PROJECT_ID= # Visit https://cloud.walletconnect.com/ and create a project. See https://www.rainbowkit.com/docs/installation
```

Run the frontend
```bash
cd front
npm run dev
```

Visit localhost:3000

## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
