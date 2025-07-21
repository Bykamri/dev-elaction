// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract RwaNft is ERC721, AccessControl {
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 private _nextTokenId;
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721("Deluct RWA", "DRWA") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function safeMint(address to, string memory _tokenURI) public onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        return tokenId;
    }

    function mintForFactory(address to, string memory _tokenURI) public onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId); 
        _setTokenURI(tokenId, _tokenURI);
        return tokenId;
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        _tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        string memory uri = _tokenURIs[tokenId];
        require(bytes(uri).length > 0, "ERC721: URI query for nonexistent token");
        return uri;
    }

    function grantMinterRole(address minter) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MINTER_ROLE, minter);
    }

    function revokeMinterRole(address minter) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(MINTER_ROLE, minter);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}