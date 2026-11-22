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
- **SimpleStorage Contract Address:** `0xADD73473A1C3FBd817cF628615E264414080b3bd`
- **Voting Contract Address:** `0x78A395020f1117A6388D2C04a9111aC096F2d37C`

## Running the DApp
1. Open the project folder in **VS Code** and serve `index.html` using **Live Server** (or a local HTTP server).
2. Open the page in a browser with **MetaMask** installed and set to the **Sepolia** network.
3. Connect your MetaMask account, view the candidates and vote counts loaded from the contract, and submit transactions as needed.
