// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./RwaNft.sol";
import "./Auction.sol";

contract AuctionFactory is AccessControl {
    
    bytes32 public constant REVIEWER_ROLE = keccak256("REVIEWER_ROLE");
    RwaNft public immutable rwaNftContract;

    enum ProposalStatus { Pending, Rejected, Live, Finished }

    struct Proposal {
        address proposer;
        string metadataURI;
        uint256 startingBid;
        uint256 durationSeconds;
        ProposalStatus status;
        address deployedAuctionAddress;
    }

    Proposal[] public proposals;

    event ProposalSubmitted(uint256 proposalId, address indexed proposer);
    event AuctionLaunched(uint256 proposalId, address indexed auctionContract, uint256 tokenId);
    event ProposalRejected(uint256 proposalId);
    event AuctionFinalized(uint256 proposalId, address indexed auctionContract);

    constructor(address _rwaNftAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REVIEWER_ROLE, msg.sender);
        rwaNftContract = RwaNft(_rwaNftAddress);
    }

    function addReviewer(address _reviewerAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(REVIEWER_ROLE, _reviewerAddress);
    }

    function revokeReviewer(address _reviewerAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(REVIEWER_ROLE, _reviewerAddress);
    }

    function setupPermissions() external onlyRole(DEFAULT_ADMIN_ROLE) {
        rwaNftContract.grantMinterRole(address(this));
    }

    function submitProposal(string calldata _metadataURI, uint256 _startingBid, uint256 _durationSeconds) external {
        proposals.push(Proposal(msg.sender, _metadataURI, _startingBid, _durationSeconds, ProposalStatus.Pending, address(0)));
        emit ProposalSubmitted(proposals.length - 1, msg.sender);
    }
    
    function reviewAndLaunchAuction(uint256 _proposalId, address _idrxTokenAddress, uint256 _feePercent) external onlyRole(REVIEWER_ROLE) {
        Proposal storage p = proposals[_proposalId];
        require(p.status == ProposalStatus.Pending, "Proposal not pending");

        uint256 newTokenId = rwaNftContract.mintForFactory(address(this), p.metadataURI);

        Auction newAuction = new Auction(
            address(rwaNftContract), 
            newTokenId, 
            _idrxTokenAddress,
            p.startingBid, p.durationSeconds, _feePercent, 
            p.proposer, _msgSender(), address(this)
        );

        IERC721(address(rwaNftContract)).transferFrom(address(this), address(newAuction), newTokenId);

        p.status = ProposalStatus.Live;
        p.deployedAuctionAddress = address(newAuction);
        emit AuctionLaunched(_proposalId, address(newAuction), newTokenId);
    }

    function rejectProposal(uint256 _proposalId) external onlyRole(REVIEWER_ROLE) {
        Proposal storage p = proposals[_proposalId];
        require(p.status == ProposalStatus.Pending, "Proposal not pending");
        p.status = ProposalStatus.Rejected;
        emit ProposalRejected(_proposalId);
    }
    
    function finalizeAuction(uint256 _proposalId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Proposal storage p = proposals[_proposalId];
        require(p.status == ProposalStatus.Live, "Auction is not live");
        address auctionAddress = p.deployedAuctionAddress;
        require(auctionAddress != address(0), "Auction contract not found");
        Auction(auctionAddress).endAuction();
        p.status = ProposalStatus.Finished;
        emit AuctionFinalized(_proposalId, auctionAddress);
    }

    function getProposalsCount() external view returns (uint) { return proposals.length; }
    function getProposal(uint _proposalId) external view returns (Proposal memory) { return proposals[_proposalId]; }
    function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) { return super.supportsInterface(interfaceId); }
}