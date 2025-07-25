// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title RWA NFT Contract
 * @dev An ERC721 NFT contract for Real World Assets (RWA) with role-based minting
 * @notice This contract represents tokenized real-world assets as NFTs for auction purposes
 * @notice Uses AccessControl for permission management with MINTER_ROLE for controlled minting
 */
contract RwaNft is ERC721, AccessControl {
    
    // ============ Constants and State Variables ============
    
    /// @dev Role identifier for accounts authorized to mint NFTs
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    /// @dev Counter for generating unique token IDs, incremented for each mint
    uint256 private _nextTokenId;
    
    /// @dev Mapping from token ID to its metadata URI
    mapping(uint256 => string) private _tokenURIs;

    // ============ Constructor ============
    
    /**
     * @dev Initializes the RWA NFT contract with name "Deluct RWA" and symbol "DRWA"
     * @notice Grants DEFAULT_ADMIN_ROLE and MINTER_ROLE to the contract deployer
     * @notice The deployer becomes the initial admin and can mint NFTs or grant permissions to others
     */
    constructor() ERC721("Deluct RWA", "DRWA") {
        // Grant admin role to the contract deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // Grant minter role to the contract deployer
        _grantRole(MINTER_ROLE, msg.sender);
    }

    // ============ Minting Functions ============
    
    /**
     * @dev Safely mints a new NFT with metadata to a specified address
     * @param to The address that will receive the newly minted NFT
     * @param _tokenURI The URI pointing to the NFT's metadata (JSON containing asset details)
     * @return The token ID of the newly minted NFT
     * @notice Only accounts with MINTER_ROLE can call this function
     * @notice Uses _safeMint which includes recipient contract validation
     * @notice Automatically assigns incremental token IDs starting from 0
     */
    function safeMint(address to, string memory _tokenURI) public onlyRole(MINTER_ROLE) returns (uint256) {
        // Get the next available token ID and increment counter
        uint256 tokenId = _nextTokenId++;
        // Safely mint the NFT to the specified address
        _safeMint(to, tokenId);
        // Set the metadata URI for this token
        _setTokenURI(tokenId, _tokenURI);
        return tokenId;
    }

    /**
     * @dev Mints a new NFT specifically for the auction factory system
     * @param to The address that will receive the newly minted NFT (typically the factory)
     * @param _tokenURI The URI pointing to the NFT's metadata
     * @return The token ID of the newly minted NFT
     * @notice Only accounts with MINTER_ROLE can call this function
     * @notice Uses _mint instead of _safeMint for gas efficiency in factory operations
     * @notice Designed for use by trusted factory contracts that handle NFT transfers
     */
    function mintForFactory(address to, string memory _tokenURI) public onlyRole(MINTER_ROLE) returns (uint256) {
        // Get the next available token ID and increment counter
        uint256 tokenId = _nextTokenId++;
        // Mint the NFT to the specified address (more gas efficient than _safeMint)
        _mint(to, tokenId); 
        // Set the metadata URI for this token
        _setTokenURI(tokenId, _tokenURI);
        return tokenId;
    }

    // ============ Internal Functions ============
    
    /**
     * @dev Internal function to set the metadata URI for a specific token
     * @param tokenId The ID of the token to set URI for
     * @param _tokenURI The URI string pointing to the token's metadata
     * @notice This function stores the URI in the contract's mapping for later retrieval
     * @notice The URI typically points to JSON metadata containing asset information
     */
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        _tokenURIs[tokenId] = _tokenURI;
    }

    // ============ View Functions ============
    
    /**
     * @dev Returns the metadata URI for a given token ID
     * @param tokenId The ID of the token to query
     * @return The URI string containing the token's metadata
     * @notice Overrides the default ERC721 tokenURI function to use custom URI storage
     * @notice Reverts if the token doesn't exist or has no URI set
     * @notice The URI typically points to JSON metadata with asset details, images, etc.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // Ensure the token exists
        _requireOwned(tokenId);
        // Get the stored URI for this token
        string memory uri = _tokenURIs[tokenId];
        // Ensure the URI is not empty
        require(bytes(uri).length > 0, "ERC721: URI query for nonexistent token");
        return uri;
    }

    // ============ Role Management Functions ============
    
    /**
     * @dev Grants minter role to a specified address
     * @param minter The address to be granted minting privileges
     * @notice Only accounts with DEFAULT_ADMIN_ROLE can call this function
     * @notice Allows the specified address to mint new NFTs using safeMint or mintForFactory
     * @notice Typically used to grant minting permissions to factory contracts
     */
    function grantMinterRole(address minter) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MINTER_ROLE, minter);
    }

    /**
     * @dev Revokes minter role from a specified address
     * @param minter The address to have minting privileges removed
     * @notice Only accounts with DEFAULT_ADMIN_ROLE can call this function
     * @notice Removes the ability to mint new NFTs from the specified address
     * @notice Used for security or when minting permissions are no longer needed
     */
    function revokeMinterRole(address minter) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(MINTER_ROLE, minter);
    }

    /**
     * @dev Checks if the contract supports a given interface
     * @param interfaceId The interface identifier to check
     * @return True if the interface is supported, false otherwise
     * @notice Required override due to multiple inheritance (ERC721 and AccessControl)
     * @notice Ensures proper interface detection for both NFT and access control functionality
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}