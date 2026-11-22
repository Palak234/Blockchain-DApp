const SIMPLE_STORAGE_ADDRESS = "0xADD73473A1C3FBd817cF628615E264414080b3bd";
const VOTING_ADDRESS = "0x78A395020f1117A6388D2C04a9111aC096F2d37C";


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
				"internalType": "string",
				"name": "candidate",
				"type": "string"
			}
		],
		"name": "voteForCandidate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "candidateList",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCandidates",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
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
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "candidate",
				"type": "string"
			}
		],
		"name": "isValidCandidate",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "candidate",
				"type": "string"
			}
		],
		"name": "totalVotesFor",
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
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "votesReceived",
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

let provider;
let signer;
let storageContract;
let votingContract;

const logEl = document.getElementById("statusLog");

function logMessage(msg) {
  const time = new Date().toLocaleTimeString();
  logEl.textContent = `[${time}] ${msg}\n` + logEl.textContent;
}

function getSelectedCandidate() {
  const typed = document.getElementById("candidateInput").value.trim();
  const picked = document.getElementById("candidateSelect").value.trim();
  return typed || picked;
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

    const address = await signer.getAddress();
    const network = await provider.getNetwork();

    document.getElementById("walletAddress").textContent = address;
    document.getElementById("networkName").textContent = `${network.name} (Chain ID: ${network.chainId})`;

    storageContract = new ethers.Contract(SIMPLE_STORAGE_ADDRESS, SIMPLE_STORAGE_ABI, signer);
    votingContract = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, signer);

    logMessage(`Connected account: ${address} on chain ${network.chainId}`);
    await refreshNumber();
    await loadCandidatesAndResults();
  } catch (err) {
    logMessage(`Wallet connection error: ${err.shortMessage || err.message}`);
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
    const candidates = await votingContract.getCandidates();
    const selectEl = document.getElementById("candidateSelect");
    const listEl = document.getElementById("resultsList");

    selectEl.innerHTML = '<option value="">Select a candidate</option>';
    listEl.innerHTML = "";

    for (const name of candidates) {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      selectEl.appendChild(opt);

      const votes = await votingContract.totalVotesFor(name);
      const li = document.createElement("li");
      li.textContent = `${name}: ${votes.toString()} vote(s)`;
      listEl.appendChild(li);
    }

    logMessage("Refreshed candidate list and vote totals.");
  } catch (err) {
    logMessage(`Could not load results: ${err.shortMessage || err.message}`);
  }
}

async function castVote() {
  if (!votingContract) return logMessage("Connect wallet first.");
  const candidate = getSelectedCandidate();
  if (!candidate) return logMessage("Select or enter a candidate name.");

  try {
    const tx = await votingContract.voteForCandidate(candidate);
    logMessage(`Vote tx sent for "${candidate}": ${tx.hash}`);
    const receipt = await tx.wait();
    logMessage(`Vote confirmed! Block ${receipt.blockNumber}, Tx hash: ${tx.hash}`);
    await loadCandidatesAndResults();
  } catch (err) {
    logMessage(`Vote rejected/failed: ${err.shortMessage || err.reason || err.message}`);
  }
}

document.getElementById("connectBtn").addEventListener("click", connectWallet);
document.getElementById("refreshNumberBtn").addEventListener("click", refreshNumber);
document.getElementById("setNumberBtn").addEventListener("click", setNumber);
document.getElementById("voteBtn").addEventListener("click", castVote);
document.getElementById("loadResultsBtn").addEventListener("click", loadCandidatesAndResults);