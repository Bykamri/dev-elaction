// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Auction Contract
 * @dev A smart contract for conducting auctions of NFTs using IDRX tokens
 * @notice This contract allows users to bid on NFTs using IDRX tokens with automatic bid management and fee distribution
 */
contract Auction is Ownable {
    // ============ Immutable State Variables ============
    
    /// @dev The NFT contract instance being auctioned
    IERC721 public immutable nft;
    
    /// @dev The specific token ID of the NFT being auctioned
    uint256 public immutable nftTokenId;
    
    /// @dev The IDRX token contract used for bidding
    IERC20 public immutable idrxToken;
    
    /// @dev The address of the NFT seller who will receive proceeds
    address public immutable seller;
    
    /// @dev The platform wallet address that receives platform fees
    address public immutable platformFeeWallet;
    
    /// @dev The minimum bid amount required to start the auction
    uint256 public immutable startingBid;
    
    /// @dev The timestamp when the auction ends
    uint256 public immutable endTime;
    
    /// @dev The platform fee percentage (in basis points, e.g., 250 = 2.5%)
    uint256 public immutable platformFeePercent;

    // ============ Mutable State Variables ============
    
    /// @dev The address of the current highest bidder
    address public highestBidder;
    
    /// @dev The current highest bid amount
    uint256 public highestBid;
    
    /// @dev Flag indicating whether the auction has been manually ended
    bool public ended;
    
    /// @dev Mapping of bidder addresses to their previous bid amounts (for withdrawals)
    mapping(address => uint256) public bids;

    // ============ Events ============
    
    /// @dev Emitted when a new bid is placed
    /// @param bidder The address of the bidder
    /// @param amount The bid amount in IDRX tokens
    event Bid(address indexed bidder, uint256 amount);
    
    /// @dev Emitted when the auction is ended
    /// @param winner The address of the winning bidder (address(0) if no bids)
    /// @param amount The winning bid amount (0 if no bids)
    event AuctionEnded(address winner, uint256 amount);
    
    /// @dev Emitted when a bidder withdraws their previous bid
    /// @param bidder The address of the bidder withdrawing funds
    /// @param amount The amount withdrawn in IDRX tokens
    event Withdrawal(address indexed bidder, uint256 amount);

    // ============ Constructor ============
    
    /**
     * @dev Initializes the auction with the specified parameters
     * @param _nftAddress The address of the NFT contract
     * @param _nftTokenId The token ID of the NFT to be auctioned
     * @param _idrxTokenAddress The address of the IDRX token contract
     * @param _startingBid The minimum bid amount required
     * @param _durationInSeconds The duration of the auction in seconds
     * @param _feePercent The platform fee percentage in basis points (e.g., 250 = 2.5%)
     * @param _seller The address of the NFT seller
     * @param _platformWallet The address that will receive platform fees
     * @param _owner The address that will own this auction contract
     * @notice The auction automatically starts upon deployment and ends after the specified duration
     */
    constructor(
        address _nftAddress,
        uint256 _nftTokenId,
        address _idrxTokenAddress,
        uint256 _startingBid,
        uint256 _durationInSeconds,
        uint256 _feePercent,
        address _seller,
        address _platformWallet,
        address _owner 
    ) Ownable(_owner) {
        // Initialize NFT contract and token ID
        nft = IERC721(_nftAddress);
        nftTokenId = _nftTokenId;
        
        // Initialize IDRX token contract for bidding
        idrxToken = IERC20(_idrxTokenAddress);
        
        // Set auction parameters
        startingBid = _startingBid;
        endTime = block.timestamp + _durationInSeconds; // Calculate end time
        platformFeePercent = _feePercent;
        
        // Set addresses for fund distribution
        seller = _seller;
        platformFeeWallet = _platformWallet;
    }

    // ============ Public Functions ============
    
    /**
     * @dev Allows users to place a bid on the NFT
     * @param _bidAmount The amount of IDRX tokens to bid
     * @notice The bid must be higher than the current highest bid and meet the starting bid if it's the first bid
     * @notice Previous highest bidder's funds are stored for withdrawal
     * @notice Bidder must have approved this contract to spend their IDRX tokens
     */
    function bid(uint256 _bidAmount) external {
        // Validate auction is still active
        require(block.timestamp < endTime, "Auction is not active");
        require(!ended, "Auction has ended");
        
        // Validate bid amount
        require(_bidAmount > highestBid, "Bid must be higher");
        if (highestBid == 0) {
            require(_bidAmount >= startingBid, "Bid must meet starting bid");
        }

        // Store previous highest bidder's amount for withdrawal
        if (highestBidder != address(0)) {
            bids[highestBidder] = highestBid;
        }

        // Update highest bid information
        highestBidder = msg.sender;
        highestBid = _bidAmount;
        
        // Transfer IDRX tokens from bidder to contract
        bool sent = idrxToken.transferFrom(msg.sender, address(this), _bidAmount);
        require(sent, "IDRX transfer failed");

        emit Bid(msg.sender, _bidAmount);
    }

    /**
     * @dev Ends the auction and distributes funds and NFT accordingly
     * @notice Can only be called by the contract owner after the auction end time
     * @notice If there's a winner: transfers NFT to highest bidder, pays seller and platform fee
     * @notice If no bids: returns NFT to seller
     */
    function endAuction() external onlyOwner {
        // Validate auction can be ended
        require(block.timestamp >= endTime, "Auction has not yet ended");
        require(!ended, "Auction has already ended");
        ended = true;

        if (highestBidder != address(0)) {
            // Calculate platform fee and seller proceeds
            uint256 platformFee = (highestBid * platformFeePercent) / 10000;
            uint256 sellerProceeds = highestBid - platformFee;
            
            // Distribute funds
            idrxToken.transfer(platformFeeWallet, platformFee);
            idrxToken.transfer(seller, sellerProceeds);
            
            // Transfer NFT to winner
            nft.transferFrom(address(this), highestBidder, nftTokenId);
            
            emit AuctionEnded(highestBidder, highestBid);
        } else {
            // No bids received, return NFT to seller
            nft.transferFrom(address(this), seller, nftTokenId);
            emit AuctionEnded(address(0), 0);
        }
    }
    
    /**
     * @dev Allows bidders to withdraw their previous bid amounts
     * @notice Only non-winning bidders can withdraw their funds
     * @notice The current highest bidder cannot withdraw as their bid is still active
     * @notice Uses the checks-effects-interactions pattern to prevent reentrancy
     */
    function withdraw() external {
        // Get the withdrawal amount for the caller
        uint256 amount = bids[msg.sender];
        require(amount > 0, "No funds to withdraw");
        
        // Update state before external call (checks-effects-interactions pattern)
        bids[msg.sender] = 0;

        // Transfer IDRX tokens back to the bidder
        bool sent = idrxToken.transfer(msg.sender, amount);
        require(sent, "Withdrawal failed");

        emit Withdrawal(msg.sender, amount);
    }
}