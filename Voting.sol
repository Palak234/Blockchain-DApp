// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    // Mapping to keep track of votes for each candidate
    mapping(string => uint256) public votesReceived;

    // Track addresses that have already cast a vote
    mapping(address => bool) public hasVoted;

    // List of candidate names
    string[] public candidateList;

    // Constructor to initialize candidates when the contract is deployed
    constructor(string[] memory candidateNames) {
        candidateList = candidateNames;
    }

    // Helper to verify candidate exists in candidateList
    function isValidCandidate(string memory candidate) public view returns (bool) {
        for (uint256 i = 0; i < candidateList.length; i++) {
            if (keccak256(bytes(candidateList[i])) == keccak256(bytes(candidate))) {
                return true;
            }
        }
        return false;
    }

    // Return all initialized candidate names
    function getCandidates() public view returns (string[] memory) {
        return candidateList;
    }

    // Function to view total votes for a specific candidate
    function totalVotesFor(string memory candidate) public view returns (uint256) {
        return votesReceived[candidate];
    }

    // Function to vote for a candidate once per address
    function voteForCandidate(string memory candidate) public {
        require(!hasVoted[msg.sender], "You have already voted");
        require(isValidCandidate(candidate), "Invalid candidate");

        hasVoted[msg.sender] = true;
        votesReceived[candidate] += 1;
    }
}