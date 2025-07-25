// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title Mock IDRX Token Contract
 * @dev A mock ERC20 token contract representing the Indonesian Rupiah Exchange (IDRX) token
 * @notice This is a test/development token used for auction bidding in the development environment
 * @notice In production, this would be replaced with the actual IDRX token contract
 */
contract IDRX is ERC20 {
    
    /**
     * @dev Initializes the IDRX mock token with a large initial supply
     * @notice Creates 1 trillion IDRX tokens and assigns them to the contract deployer
     * @notice The large supply is intended for testing purposes to ensure sufficient liquidity
     * @notice Token has standard 18 decimal places following ERC20 conventions
     */
    constructor() ERC20("IDRX", "IDRX") {
        // Mint 1 trillion IDRX tokens (1,000,000,000,000) to the deployer
        // This provides ample tokens for testing auction functionality
        _mint(msg.sender, 1_000_000_000_000 * 10 ** decimals());
    }
}