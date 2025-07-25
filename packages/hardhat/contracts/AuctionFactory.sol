// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./RwaNft.sol";
import "./Auction.sol";

/**
 * @title AuctionFactory Contract
 * @dev A factory contract for managing auction proposals and deploying auction contracts
 * @notice This contract handles the entire lifecycle of auction proposals from submission to finalization
 * @notice Uses AccessControl for role-based permissions (Admin and Reviewer roles)
 */
contract AuctionFactory is AccessControl {
    
    // ============ Constants and Immutable Variables ============
    
    /// @dev Role identifier for users who can review and approve/reject proposals
    bytes32 public constant REVIEWER_ROLE = keccak256("REVIEWER_ROLE");
    
    /// @dev The RWA NFT contract instance used for minting NFTs for approved auctions
    RwaNft public immutable rwaNftContract;

    // ============ Enums and Structs ============
    
    /// @dev Represents the current status of a proposal in the auction lifecycle
    enum ProposalStatus { 
        Pending,    // Proposal submitted, awaiting review
        Rejected,   // Proposal rejected by reviewer
        Live,       // Proposal approved and auction is active
        Finished    // Auction has been finalized and completed
    }

    /**
     * @dev Structure containing all information about an auction proposal
     * @param proposer The address of the user who submitted the proposal
     * @param metadataURI The URI containing metadata for the NFT to be created
     * @param startingBid The minimum bid amount required to start the auction
     * @param durationSeconds The duration of the auction in seconds
     * @param status The current status of the proposal
     * @param deployedAuctionAddress The address of the deployed auction contract (if approved)
     */
    struct Proposal {
        address proposer;
        string metadataURI;
        uint256 startingBid;
        uint256 durationSeconds;
        ProposalStatus status;
        address deployedAuctionAddress;
    }

    // ============ State Variables ============
    
    /// @dev Array storing all submitted proposals
    Proposal[] public proposals;

    // ============ Events ============
    
    /// @dev Emitted when a new proposal is submitted
    /// @param proposalId The unique identifier of the submitted proposal
    /// @param proposer The address of the user who submitted the proposal
    event ProposalSubmitted(uint256 proposalId, address indexed proposer);
    
    /// @dev Emitted when a proposal is approved and auction is launched
    /// @param proposalId The unique identifier of the approved proposal
    /// @param auctionContract The address of the deployed auction contract
    /// @param tokenId The token ID of the minted NFT for the auction
    event AuctionLaunched(uint256 proposalId, address indexed auctionContract, uint256 tokenId);
    
    /// @dev Emitted when a proposal is rejected by a reviewer
    /// @param proposalId The unique identifier of the rejected proposal
    event ProposalRejected(uint256 proposalId);
    
    /// @dev Emitted when an auction is manually finalized by an admin
    /// @param proposalId The unique identifier of the proposal whose auction was finalized
    /// @param auctionContract The address of the finalized auction contract
    event AuctionFinalized(uint256 proposalId, address indexed auctionContract);

    // ============ Constructor ============
    
    /**
     * @dev Initializes the AuctionFactory with the RWA NFT contract
     * @param _rwaNftAddress The address of the RWA NFT contract to be used for minting
     * @notice Grants DEFAULT_ADMIN_ROLE and REVIEWER_ROLE to the deployer
     * @notice The deployer becomes the initial admin and reviewer
     */
    constructor(address _rwaNftAddress) {
        // Grant admin role to the contract deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // Grant reviewer role to the contract deployer (can be modified later)
        _grantRole(REVIEWER_ROLE, msg.sender);
        // Initialize the RWA NFT contract reference
        rwaNftContract = RwaNft(_rwaNftAddress);
    }

    // ============ Role Management Functions ============
    
    /**
     * @dev Adds a new reviewer to the system
     * @param _reviewerAddress The address to be granted reviewer privileges
     * @notice Only accounts with DEFAULT_ADMIN_ROLE can call this function
     * @notice Reviewers can approve/reject proposals and launch auctions
     */
    function addReviewer(address _reviewerAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(REVIEWER_ROLE, _reviewerAddress);
    }

    /**
     * @dev Removes reviewer privileges from an account
     * @param _reviewerAddress The address to have reviewer privileges revoked
     * @notice Only accounts with DEFAULT_ADMIN_ROLE can call this function
     */
    function revokeReviewer(address _reviewerAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(REVIEWER_ROLE, _reviewerAddress);
    }

    /**
     * @dev Sets up necessary permissions for the factory to mint NFTs
     * @notice Only accounts with DEFAULT_ADMIN_ROLE can call this function
     * @notice This function grants minter role to this factory contract on the RWA NFT contract
     * @notice Must be called after deployment to enable auction creation functionality
     */
    function setupPermissions() external onlyRole(DEFAULT_ADMIN_ROLE) {
        rwaNftContract.grantMinterRole(address(this));
    }

    // ============ Proposal Management Functions ============
    
    /**
     * @dev Allows users to submit a new auction proposal
     * @param _metadataURI The URI containing metadata for the NFT to be created
     * @param _startingBid The minimum bid amount required for the auction
     * @param _durationSeconds The duration of the auction in seconds
     * @notice Anyone can submit a proposal, but it requires reviewer approval to go live
     * @notice Emits ProposalSubmitted event with the new proposal ID
     */
    function submitProposal(string calldata _metadataURI, uint256 _startingBid, uint256 _durationSeconds) external {
        // Create new proposal with Pending status
        proposals.push(Proposal(
            msg.sender, 
            _metadataURI, 
            _startingBid, 
            _durationSeconds, 
            ProposalStatus.Pending, 
            address(0)
        ));
        
        // Emit event with the new proposal ID (array length - 1)
        emit ProposalSubmitted(proposals.length - 1, msg.sender);
    }
    
    /**
     * @dev Reviews and approves a proposal, launching the auction
     * @param _proposalId The ID of the proposal to approve and launch
     * @param _idrxTokenAddress The address of the IDRX token contract for bidding
     * @param _feePercent The platform fee percentage in basis points (e.g., 250 = 2.5%)
     * @notice Only accounts with REVIEWER_ROLE can call this function
     * @notice Mints an NFT, deploys auction contract, and transfers NFT to auction
     * @notice Changes proposal status from Pending to Live
     */
    function reviewAndLaunchAuction(uint256 _proposalId, address _idrxTokenAddress, uint256 _feePercent) external onlyRole(REVIEWER_ROLE) {
        // Get reference to the proposal
        Proposal storage p = proposals[_proposalId];
        require(p.status == ProposalStatus.Pending, "Proposal not pending");

        // Mint new NFT for the auction using the proposal's metadata
        uint256 newTokenId = rwaNftContract.mintForFactory(address(this), p.metadataURI);

        // Deploy new auction contract with the proposal parameters
        Auction newAuction = new Auction(
            address(rwaNftContract),    // NFT contract address
            newTokenId,                 // Token ID of the minted NFT
            _idrxTokenAddress,          // IDRX token for bidding
            p.startingBid,              // Starting bid amount
            p.durationSeconds,          // Auction duration
            _feePercent,                // Platform fee percentage
            p.proposer,                 // Original proposer (seller)
            _msgSender(),               // Reviewer as platform fee recipient
            address(this)               // This factory as auction owner
        );

        // Transfer the minted NFT from factory to the auction contract
        IERC721(address(rwaNftContract)).transferFrom(address(this), address(newAuction), newTokenId);

        // Update proposal status and store auction address
        p.status = ProposalStatus.Live;
        p.deployedAuctionAddress = address(newAuction);
        
        emit AuctionLaunched(_proposalId, address(newAuction), newTokenId);
    }

    /**
     * @dev Rejects a pending proposal
     * @param _proposalId The ID of the proposal to reject
     * @notice Only accounts with REVIEWER_ROLE can call this function
     * @notice Changes proposal status from Pending to Rejected
     * @notice Rejected proposals cannot be approved later and would need resubmission
     */
    function rejectProposal(uint256 _proposalId) external onlyRole(REVIEWER_ROLE) {
        // Get reference to the proposal
        Proposal storage p = proposals[_proposalId];
        require(p.status == ProposalStatus.Pending, "Proposal not pending");
        
        // Update status to rejected
        p.status = ProposalStatus.Rejected;
        emit ProposalRejected(_proposalId);
    }
    
    /**
     * @dev Manually finalizes a live auction
     * @param _proposalId The ID of the proposal whose auction should be finalized
     * @notice Only accounts with DEFAULT_ADMIN_ROLE can call this function
     * @notice Calls endAuction on the deployed auction contract and updates status to Finished
     * @notice Should only be called after the auction time has ended
     */
    function finalizeAuction(uint256 _proposalId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        // Get reference to the proposal
        Proposal storage p = proposals[_proposalId];
        require(p.status == ProposalStatus.Live, "Auction is not live");
        
        // Get the deployed auction contract address
        address auctionAddress = p.deployedAuctionAddress;
        require(auctionAddress != address(0), "Auction contract not found");
        
        // Call endAuction on the deployed auction contract
        Auction(auctionAddress).endAuction();
        
        // Update proposal status to finished
        p.status = ProposalStatus.Finished;
        emit AuctionFinalized(_proposalId, auctionAddress);
    }

    // ============ View Functions ============
    
    /**
     * @dev Returns the total number of proposals submitted
     * @return The count of all proposals in the system
     */
    function getProposalsCount() external view returns (uint) { 
        return proposals.length; 
    }
    
    /**
     * @dev Returns the details of a specific proposal
     * @param _proposalId The ID of the proposal to retrieve
     * @return The complete proposal struct containing all details
     */
    function getProposal(uint _proposalId) external view returns (Proposal memory) { 
        return proposals[_proposalId]; 
    }
    
    /**
     * @dev Checks if the contract supports a given interface
     * @param interfaceId The interface identifier to check
     * @return True if the interface is supported, false otherwise
     * @notice Required by AccessControl for proper interface detection
     */
    function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) { 
        return super.supportsInterface(interfaceId); 
    }
}