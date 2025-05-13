// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MessageBoard {
    string private message;
    
    event MessageUpdated(string newMessage);
    
    constructor() {
        message = "Welcome to the Message Board!";
    }
    
    function getMessage() public view returns (string memory) {
        return message;
    }
    
    function updateMessage(string memory newMessage) public {
        message = newMessage;
        emit MessageUpdated(newMessage);
    }
} 