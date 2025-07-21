// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Auction is Ownable {
    IERC721 public immutable nft;
    uint256 public immutable nftTokenId;
    IERC20 public immutable idrxToken;
    address public immutable seller;
    address public immutable platformFeeWallet;
    uint256 public immutable startingBid;
    uint256 public immutable endTime;
    uint256 public immutable platformFeePercent;

    address public highestBidder;
    uint256 public highestBid;
    bool public ended;
    mapping(address => uint256) public bids;

    event Bid(address indexed bidder, uint256 amount);
    event AuctionEnded(address winner, uint256 amount);
    event Withdrawal(address indexed bidder, uint256 amount);

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
        nft = IERC721(_nftAddress);
        nftTokenId = _nftTokenId;
        idrxToken = IERC20(_idrxTokenAddress);
        startingBid = _startingBid;
        endTime = block.timestamp + _durationInSeconds;
        platformFeePercent = _feePercent;
        seller = _seller;
        platformFeeWallet = _platformWallet;
    }

    function bid(uint256 _bidAmount) external {
        require(block.timestamp < endTime, "Auction is not active");
        require(!ended, "Auction has ended");
        require(_bidAmount > highestBid, "Bid must be higher");
        if (highestBid == 0) {
            require(_bidAmount >= startingBid, "Bid must meet starting bid");
        }

        if (highestBidder != address(0)) {
            bids[highestBidder] = highestBid;
        }

        highestBidder = msg.sender;
        highestBid = _bidAmount;
        
        bool sent = idrxToken.transferFrom(msg.sender, address(this), _bidAmount);
        require(sent, "IDRX transfer failed");

        emit Bid(msg.sender, _bidAmount);
    }

    function endAuction() external onlyOwner {
        require(block.timestamp >= endTime, "Auction has not yet ended");
        require(!ended, "Auction has already ended");
        ended = true;

        if (highestBidder != address(0)) {
            uint256 platformFee = (highestBid * platformFeePercent) / 10000;
            uint256 sellerProceeds = highestBid - platformFee;
            
            idrxToken.transfer(platformFeeWallet, platformFee);
            idrxToken.transfer(seller, sellerProceeds);
            nft.transferFrom(address(this), highestBidder, nftTokenId);
            
            emit AuctionEnded(highestBidder, highestBid);
        } else {
            nft.transferFrom(address(this), seller, nftTokenId);
            emit AuctionEnded(address(0), 0);
        }
    }
    
    function withdraw() external {
        uint256 amount = bids[msg.sender];
        require(amount > 0, "No funds to withdraw");
        bids[msg.sender] = 0;

        bool sent = idrxToken.transfer(msg.sender, amount);
        require(sent, "Withdrawal failed");

        emit Withdrawal(msg.sender, amount);
    }
}