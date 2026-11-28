const SIMPLE_STORAGE_ADDRESS = "0x9D7f74d0C41E726EC95884E0e97Fa6129e3b5E99";
const VOTING_ADDRESS = "0x6e6d69e39c707F4D37c9d4e2f5102BB8A4Ea7b33";

const SIMPLE_STORAGE_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_number",
				"type": "uint256"
			}
		],
		"name": "setNumber",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "initialNumber",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "getNumber",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "storedNumber",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const VOTING_ABI = [
	{
		"inputs": [
			{
				"internalType": "string[]",
				"name": "candidateNames",
				"type": "string[]"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "candidateId",
				"type": "uint256"
			}
		],
		"name": "vote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "candidateId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "candidateName",
				"type": "string"
			}
		],
		"name": "VoteCast",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "candidateId",
				"type": "uint256"
			}
		],
		"name": "getCandidate",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "voteCount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCandidateCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "hasVoted",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	} 
];

const EXPECTED_CHAIN_ID = 11155111n; // Sepolia Testnet

let provider;
let signer;
let storageContract;
let votingContract;
let currentAddress;

const logEl = document.getElementById("statusLog");

function logMessage(msg) {
  const time = new Date().toLocaleTimeString();
  logEl.textContent = `[${time}] ${msg}\n` + logEl.textContent;
}

function getSelectedCandidateId() {
  const typed = document.getElementById("candidateInput").value.trim();
  const picked = document.getElementById("candidateSelect").value.trim();
  return typed !== "" ? typed : picked;
}

async function connectWallet() {
  if (!window.ethereum) {
    logMessage("MetaMask (window.ethereum) not detected. Install MetaMask or open in a wallet-enabled browser.");
    return;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();

    currentAddress = await signer.getAddress();
    const network = await provider.getNetwork();

    document.getElementById("walletAddress").textContent = currentAddress;
    document.getElementById("networkName").textContent = `${network.name} (Chain ID: ${network.chainId})`;

    if (network.chainId !== EXPECTED_CHAIN_ID) {
      logMessage(`Wrong network! Please switch MetaMask to Sepolia (Chain ID: ${EXPECTED_CHAIN_ID}).`);
      return;
    }

    storageContract = new ethers.Contract(SIMPLE_STORAGE_ADDRESS, SIMPLE_STORAGE_ABI, signer);
    votingContract = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, signer);

    logMessage(`Connected account: ${currentAddress} on Sepolia (${network.chainId})`);
    await refreshNumber();
    await loadCandidatesAndResults();
  } catch (err) {
    if (err.code === 4001 || err.code === "ACTION_REJECTED") {
      logMessage("Wallet connection rejected by user in MetaMask.");
    } else {
      logMessage(`Wallet connection error: ${err.shortMessage || err.message}`);
    }
  }
}

async function refreshNumber() {
  if (!storageContract) return;
  try {
    const val = await storageContract.getNumber();
    document.getElementById("storedNumber").textContent = val.toString();
    logMessage(`Read storedNumber: ${val.toString()}`);
  } catch (err) {
    logMessage(`Error reading number: ${err.shortMessage || err.message}`);
  }
}

async function setNumber() {
  if (!storageContract) return logMessage("Connect wallet first.");
  const raw = document.getElementById("numberInput").value;
  if (raw === "") return logMessage("Enter a number first.");

  try {
    const tx = await storageContract.setNumber(BigInt(raw));
    logMessage(`Sent setNumber tx: ${tx.hash} (waiting for confirmation...)`);
    const receipt = await tx.wait();
    logMessage(`setNumber confirmed in block ${receipt.blockNumber}. Tx hash: ${tx.hash}`);
    await refreshNumber();
  } catch (err) {
    logMessage(`setNumber failed: ${err.shortMessage || err.reason || err.message}`);
  }
}

async function loadCandidatesAndResults() {
  if (!votingContract) return;
  try {
    const count = Number(await votingContract.getCandidateCount());
    const alreadyVoted = await votingContract.hasVoted(currentAddress);

    const selectEl = document.getElementById("candidateSelect");
    const listEl = document.getElementById("resultsList");
    const voteBtn = document.getElementById("voteBtn");

    selectEl.innerHTML = '<option value="">Select a candidate</option>';
    listEl.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const [id, name, voteCount] = await votingContract.getCandidate(i);

      const opt = document.createElement("option");
      opt.value = id.toString();
      opt.textContent = `${id.toString()} - ${name}`;
      selectEl.appendChild(opt);

      const li = document.createElement("li");
      li.textContent = `#${id.toString()} ${name}: ${voteCount.toString()} vote(s)`;
      listEl.appendChild(li);
    }

    voteBtn.disabled = alreadyVoted;
    if (alreadyVoted) {
      logMessage("Notice: This address has already voted. Voting button disabled.");
    } else {
      logMessage("Refreshed candidate list and vote totals.");
    }
  } catch (err) {
    logMessage(`Could not load results: ${err.shortMessage || err.message}`);
  }
}

async function castVote() {
  if (!votingContract) return logMessage("Connect wallet first.");
  const candidateId = getSelectedCandidateId();
  if (candidateId === "" || isNaN(Number(candidateId))) {
    return logMessage("Select a candidate or enter a valid numeric candidate ID (0, 1, 2...).");
  }

  try {
    const tx = await votingContract.vote(BigInt(candidateId));
    logMessage(`Vote tx sent for candidate ID ${candidateId}: ${tx.hash}`);
    const receipt = await tx.wait();
    logMessage(`Vote confirmed! Block ${receipt.blockNumber}, Tx hash: ${tx.hash}`);
    await loadCandidatesAndResults();
  } catch (err) {
    if (err.code === 4001 || err.code === "ACTION_REJECTED") {
      logMessage("Vote transaction rejected by user in MetaMask.");
    } else {
      logMessage(`Vote rejected/failed: ${err.shortMessage || err.reason || err.message}`);
    }
  }
}

document.getElementById("connectBtn").addEventListener("click", connectWallet);
document.getElementById("refreshNumberBtn").addEventListener("click", refreshNumber);
document.getElementById("setNumberBtn").addEventListener("click", setNumber);
document.getElementById("voteBtn").addEventListener("click", castVote);
document.getElementById("loadResultsBtn").addEventListener("click", loadCandidatesAndResults);

if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => connectWallet());
  window.ethereum.on("chainChanged", () => connectWallet());
}
