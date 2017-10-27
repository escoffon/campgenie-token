pragma solidity ^0.4.17;

import './CGToken.sol';

contract CGRewarder {
    address public owner;
    address public tokenizer;
    
    function CGRewarder(address _tokenizer) public {
        owner = msg.sender;
        tokenizer = _tokenizer;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    
    function reward(address _to, uint256 _value) public {
        CGToken(tokenizer).transfer(_to, _value);
    }

    function changeTokenizer(address _tokenizer) public onlyOwner {
        tokenizer = _tokenizer;
    }
}

