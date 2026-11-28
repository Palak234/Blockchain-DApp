// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    Candidate[] private candidates;
    mapping(address => bool) public hasVoted;

    event VoteCast(address indexed voter, uint256 indexed candidateId, string candidateName);

    constructor(string[] memory candidateNames) {
        require(candidateNames.length >= 3, "At least 3 candidates required");
        for (uint256 i = 0; i < candidateNames.length; i++) {
            candidates.push(Candidate({
                id: i,
                name: candidateNames[i],
                voteCount: 0
            }));
        }
    }

    function getCandidateCount() public view returns (uint256) {
        return candidates.length;
    }

    function getCandidate(uint256 candidateId)
        public
        view
        returns (uint256 id, string memory name, uint256 voteCount)
    {
        require(candidateId < candidates.length, "Invalid candidate ID");
        Candidate storage c = candidates[candidateId];
        return (c.id, c.name, c.voteCount);
    }

    function vote(uint256 candidateId) public {
        require(!hasVoted[msg.sender], "Address has already voted");
        require(candidateId < candidates.length, "Invalid candidate ID");

        hasVoted[msg.sender] = true;
        candidates[candidateId].voteCount += 1;

        emit VoteCast(msg.sender, candidateId, candidates[candidateId].name);
    }
}
