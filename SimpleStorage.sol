// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    // 1. Declare a state variable to store a number
    uint256 public storedNumber;

    // 2. Initialize the number using a constructor
    constructor(uint256 initialNumber) {
        storedNumber = initialNumber;
    }

    // 3. Function to update the stored number
    function setNumber(uint256 _number) public {
        storedNumber = _number;
    }

    // 4. Function to retrieve the stored number
    function getNumber() public view returns (uint256) {
        return storedNumber;
    }
}