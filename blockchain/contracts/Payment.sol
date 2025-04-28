// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Payment {
    address public owner;
    uint256 public orderCounter;

    struct Order {
        address customer;
        uint256 amount;
        bool isPaid;
        bool isCompleted;
    }

    mapping(uint256 => Order) public orders;

    event PaymentReceived(
        uint256 indexed orderId,
        address indexed from,
        uint256 amount
    );
    event OrderCompleted(uint256 indexed orderId);

    constructor() {
        owner = msg.sender;
    }

    function pay(uint256 orderId) external payable {
        require(msg.value > 0, "Must send ETH");
        orders[orderId] = Order(msg.sender, msg.value, true, false);
        emit PaymentReceived(orderId, msg.sender, msg.value);
    }

    function markOrderCompleted(uint256 orderId) external {
        require(msg.sender == owner, "Only owner");
        orders[orderId].isCompleted = true;
        emit OrderCompleted(orderId);
    }

    function withdraw() external {
        require(msg.sender == owner, "Only owner");
        payable(owner).transfer(address(this).balance);
    }
}
