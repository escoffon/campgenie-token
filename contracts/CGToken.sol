pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';

/**
 * @title CGToken
 * @dev ERC20 token for CampGenie.
 *  This contract is one of the following:
 *  - Ownable: the owner is the account that can make admin changes to the contract.
 *  - Pausable: the token can be paused; affects transfer, transferFrom, approve.
 */

contract CGToken is Ownable, Pausable {
    using SafeMath for uint256;

    string public name = "CampGenieToken";
    string public symbol = "CGT";
    uint8 public decimals = 18;

    // initialSupply is the initial allocation of tokens.
    uint256 public initialSupply;

    // totalSupply may have changed from initialSupply due to burning or inflation
    uint256 public totalSupply;

    // Balances
    mapping (address => uint256) public balanceOf;

    // Allowances: used by the `transferFrom` function.
    // Lists the maximum amounts that an account allows other accounts to transfer.
    mapping (address => mapping (address => uint256)) public allowance;

    // ERC20 events
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    // This notifies clients about the amount burnt
    event Burn(address indexed _from, uint256 _value);

    /**
     * Constructor function
     *
     * Initializes contract with initial supply tokens to the creator of the contract
     * @param initialSupplyValue The initial supply of tokens, in units of tokens.
     * @param tokenDecimals The number of decimals in the currency; controls how finely a token is split.
     * @param tokenName The token name (leave empty to use the default value).
     * @param tokenSymbol The token symbol (leave empty to use the default value).
     */
    function CGToken(
        uint256 initialSupplyValue,
        uint8 tokenDecimals,
        string tokenName,
        string tokenSymbol
    ) public {
        decimals = tokenDecimals;
        if (bytes(tokenName).length > 0) name = tokenName;
        if (bytes(tokenSymbol).length > 0) symbol = tokenSymbol;
        
        initialSupply = initialSupplyValue * 10**uint256(decimals);
        totalSupply = initialSupply;
        balanceOf[msg.sender] = totalSupply;
    }

    /**
     * Transfer tokens
     *
     * Send `_value` tokens to `_to` from your account
     *
     * @param _to The address of the recipient
     * @param _value the amount to send
     */
    function transfer(address _to, uint256 _value) whenNotPaused public {
        _transfer(msg.sender, _to, _value);
    }

    /**
     * Transfer tokens from other address
     *
     * Send `_value` tokens to `_to` on behalf of `_from`
     *
     * @param _from The address of the sender
     * @param _to The address of the recipient
     * @param _value the amount to send
     */
    function transferFrom(address _from, address _to, uint256 _value) whenNotPaused public returns (bool success)
    {
        require(_value <= allowance[_from][msg.sender]);
        allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
        _transfer(_from, _to, _value);
        return true;
    }

    /**
     * Set allowance for other address
     *
     * Allows `_spender` to spend no more than `_value` tokens on your behalf
     *
     * @param _spender The address authorized to spend
     * @param _value the max amount they can spend
     */
    function approve(address _spender, uint256 _value) whenNotPaused public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     * Destroy tokens
     *
     * Remove `_value` tokens from the system irreversibly
     *
     * @param _value the amount of money to burn
     */
    function burn(uint256 _value) whenNotPaused public returns (bool success) {
        require(_value > 0);
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
        totalSupply = totalSupply.sub(_value);
        Burn(msg.sender, _value);
        return true;
    }

    /**
     * Destroy tokens from other account
     *
     * Remove `_value` tokens from the system irreversibly on behalf of `_from`.
     *
     * @param _from the address of the sender
     * @param _value the amount of money to burn
     */
    function burnFrom(address _from, uint256 _value) whenNotPaused public returns (bool success) {
        require(_value > 0);
        require(balanceOf[_from] >= _value);
        require(_value <= allowance[_from][msg.sender]);
        balanceOf[_from] = balanceOf[_from].sub(_value);
        allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
        totalSupply = totalSupply.sub(_value);
        Burn(_from, _value);
        return true;
    }

    function _transfer(address _from, address _to, uint _value) internal {
        require(_to != 0x0);
        require(balanceOf[_from] >= _value);
        require((balanceOf[_to] + _value) > balanceOf[_to]);

        uint previousBalances = balanceOf[_from] + balanceOf[_to];
        balanceOf[_from] = balanceOf[_from].sub(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);
        Transfer(_from, _to, _value);

        assert((balanceOf[_from] + balanceOf[_to]) == previousBalances);
    }
}
