# Blockchain-DApp

## Overview
This repository contains the Solidity smart contracts (`SimpleStorage.sol` and `Voting.sol`) and frontend DApp files (`index.html`, `app.js`, and styles) developed and tested on the **Ethereum Sepolia Testnet** (Chain ID: `11155111`).

## Project Structure
- `SimpleStorage.sol` — Smart contract for storing, reading, and updating a `uint256` .
- `Voting.sol` — Decentralized voting smart contract with candidate tracking, one-vote-per-address validation, invalid candidate checks, and `VoteCast` events.
- `index.html` — Frontend user interface for wallet connection, candidate display, and voting.
- `app.js` — Frontend logic using `ethers.js` and MetaMask to interact with the deployed smart contract.

## Deployment Details
- **Network:** Ethereum Sepolia Testnet (`Chain ID: 11155111`)
- **SimpleStorage Contract Address:** `0x9D7f74d0C41E726EC95884E0e97Fa6129e3b5E99`
- **Voting Contract Address:** `0x6e6d69e39c707F4D37c9d4e2f5102BB8A4Ea7b33`
> **Note:** Smart contract addresses change whenever a contract is newly deployed. Update the addresses above and in your frontend configuration if you deploy a fresh instance.

## Running the DApp
1. Open the project folder in **VS Code** and serve `index.html` using **Live Server** (or a local HTTP server).
2. Open the page in a browser with **MetaMask** installed and set to the **Sepolia** network.
3. Connect your MetaMask account, view the candidates and vote counts loaded from the contract, and submit transactions as needed.
