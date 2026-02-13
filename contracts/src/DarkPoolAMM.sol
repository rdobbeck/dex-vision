// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "./IERC20.sol";

/// @title DarkPoolAMM - Commit-Reveal Batch Auction AMM
/// @notice A dark pool DEX that uses commit-reveal to prevent MEV/front-running
/// @dev Orders are committed as hashes, revealed after deadline, and settled at uniform price
contract DarkPoolAMM {
    // ──────────────────── Types ────────────────────

    enum Phase {
        COMMIT,
        REVEAL,
        SETTLEMENT,
        CLOSED
    }

    struct Batch {
        uint256 commitDeadline;
        uint256 revealDeadline;
        uint256 totalCommitments;
        uint256 totalRevealed;
        uint256 totalBuyAmount;
        uint256 totalSellAmount;
        uint256 clearingPrice;
        bool settled;
        mapping(address => Commitment) commitments;
    }

    struct Commitment {
        bytes32 hash;
        uint256 bond;
        bool revealed;
        bool isBuy;
        uint256 amount;
        uint256 minPrice;
        bool claimed;
    }

    struct PoolPair {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLpShares;
        uint256 currentBatchId;
        mapping(uint256 => Batch) batches;
        mapping(address => uint256) lpShares;
    }

    // ──────────────────── State ────────────────────

    uint256 public constant COMMIT_DURATION = 5 minutes;
    uint256 public constant REVEAL_DURATION = 3 minutes;
    uint256 public constant BOND_AMOUNT = 0.001 ether;
    uint256 public constant FEE_BPS = 10; // 0.1%
    uint256 public constant PRICE_DECIMALS = 1e18;

    mapping(bytes32 => PoolPair) internal pools;
    address public owner;

    // ──────────────────── Events ────────────────────

    event PoolCreated(address indexed tokenA, address indexed tokenB);
    event LiquidityAdded(address indexed provider, address tokenA, address tokenB, uint256 amountA, uint256 amountB, uint256 shares);
    event LiquidityRemoved(address indexed provider, address tokenA, address tokenB, uint256 amountA, uint256 amountB);
    event OrderCommitted(address indexed trader, bytes32 indexed poolId, uint256 batchId, bytes32 commitment);
    event OrderRevealed(address indexed trader, bytes32 indexed poolId, uint256 batchId, bool isBuy, uint256 amount);
    event BatchSettled(bytes32 indexed poolId, uint256 batchId, uint256 clearingPrice, uint256 totalMatched);
    event OrderClaimed(address indexed trader, bytes32 indexed poolId, uint256 batchId, uint256 amountOut);
    event BondSlashed(address indexed trader, bytes32 indexed poolId, uint256 batchId);

    constructor() {
        owner = msg.sender;
    }

    // ──────────────────── Pool ID ────────────────────

    function getPoolId(address tokenA, address tokenB) public pure returns (bytes32) {
        (address t0, address t1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        return keccak256(abi.encodePacked(t0, t1));
    }

    // ──────────────────── Liquidity ────────────────────

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        PoolPair storage pool = pools[poolId];

        if (pool.tokenA == address(0)) {
            (pool.tokenA, pool.tokenB) = tokenA < tokenB
                ? (tokenA, tokenB)
                : (tokenB, tokenA);
            emit PoolCreated(pool.tokenA, pool.tokenB);
        }

        (uint256 a, uint256 b) = tokenA == pool.tokenA
            ? (amountA, amountB)
            : (amountB, amountA);

        IERC20(pool.tokenA).transferFrom(msg.sender, address(this), a);
        IERC20(pool.tokenB).transferFrom(msg.sender, address(this), b);

        uint256 shares;
        if (pool.totalLpShares == 0) {
            shares = sqrt(a * b);
        } else {
            uint256 shareA = (a * pool.totalLpShares) / pool.reserveA;
            uint256 shareB = (b * pool.totalLpShares) / pool.reserveB;
            shares = shareA < shareB ? shareA : shareB;
        }

        pool.reserveA += a;
        pool.reserveB += b;
        pool.totalLpShares += shares;
        pool.lpShares[msg.sender] += shares;

        emit LiquidityAdded(msg.sender, pool.tokenA, pool.tokenB, a, b, shares);
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 lpShares
    ) external {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        PoolPair storage pool = pools[poolId];
        require(pool.lpShares[msg.sender] >= lpShares, "Insufficient LP shares");

        uint256 amountA = (lpShares * pool.reserveA) / pool.totalLpShares;
        uint256 amountB = (lpShares * pool.reserveB) / pool.totalLpShares;

        pool.lpShares[msg.sender] -= lpShares;
        pool.totalLpShares -= lpShares;
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;

        IERC20(pool.tokenA).transfer(msg.sender, amountA);
        IERC20(pool.tokenB).transfer(msg.sender, amountB);

        emit LiquidityRemoved(msg.sender, pool.tokenA, pool.tokenB, amountA, amountB);
    }

    // ──────────────────── Commit Phase ────────────────────

    function commitOrder(
        address tokenA,
        address tokenB,
        bytes32 commitment
    ) external payable {
        require(msg.value >= BOND_AMOUNT, "Insufficient bond");

        bytes32 poolId = getPoolId(tokenA, tokenB);
        PoolPair storage pool = pools[poolId];
        require(pool.tokenA != address(0), "Pool does not exist");

        uint256 batchId = pool.currentBatchId;
        Batch storage batch = pool.batches[batchId];

        if (batch.commitDeadline == 0) {
            batch.commitDeadline = block.timestamp + COMMIT_DURATION;
            batch.revealDeadline = block.timestamp + COMMIT_DURATION + REVEAL_DURATION;
        }

        require(block.timestamp <= batch.commitDeadline, "Commit phase ended");
        require(batch.commitments[msg.sender].hash == bytes32(0), "Already committed");

        batch.commitments[msg.sender] = Commitment({
            hash: commitment,
            bond: msg.value,
            revealed: false,
            isBuy: false,
            amount: 0,
            minPrice: 0,
            claimed: false
        });
        batch.totalCommitments++;

        emit OrderCommitted(msg.sender, poolId, batchId, commitment);
    }

    // ──────────────────── Reveal Phase ────────────────────

    function revealOrder(
        address tokenA,
        address tokenB,
        bool isBuy,
        uint256 amount,
        uint256 minPrice,
        bytes32 salt
    ) external {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        PoolPair storage pool = pools[poolId];
        uint256 batchId = pool.currentBatchId;
        Batch storage batch = pool.batches[batchId];

        require(block.timestamp > batch.commitDeadline, "Commit phase not ended");
        require(block.timestamp <= batch.revealDeadline, "Reveal phase ended");

        Commitment storage c = batch.commitments[msg.sender];
        require(c.hash != bytes32(0), "No commitment found");
        require(!c.revealed, "Already revealed");

        bytes32 expectedHash = keccak256(abi.encodePacked(isBuy, amount, minPrice, salt));
        require(expectedHash == c.hash, "Hash mismatch");

        c.revealed = true;
        c.isBuy = isBuy;
        c.amount = amount;
        c.minPrice = minPrice;

        if (isBuy) {
            IERC20(pool.tokenA).transferFrom(msg.sender, address(this), amount);
            batch.totalBuyAmount += amount;
        } else {
            IERC20(pool.tokenB).transferFrom(msg.sender, address(this), amount);
            batch.totalSellAmount += amount;
        }

        batch.totalRevealed++;
        payable(msg.sender).transfer(c.bond);

        emit OrderRevealed(msg.sender, poolId, batchId, isBuy, amount);
    }

    // ──────────────────── Settlement ────────────────────

    function settleBatch(address tokenA, address tokenB) external {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        PoolPair storage pool = pools[poolId];
        uint256 batchId = pool.currentBatchId;
        Batch storage batch = pool.batches[batchId];

        require(block.timestamp > batch.revealDeadline, "Reveal phase not ended");
        require(!batch.settled, "Already settled");

        uint256 totalA = pool.reserveA + batch.totalBuyAmount;
        uint256 totalB = pool.reserveB + batch.totalSellAmount;

        uint256 clearingPrice;
        if (totalA > 0) {
            clearingPrice = (totalB * PRICE_DECIMALS) / totalA;
        }

        batch.clearingPrice = clearingPrice;
        batch.settled = true;

        uint256 fee = (batch.totalBuyAmount * FEE_BPS) / 10000;
        pool.reserveA += fee;

        pool.currentBatchId++;

        emit BatchSettled(poolId, batchId, clearingPrice, batch.totalRevealed);
    }

    function claimSettlement(
        address tokenA,
        address tokenB,
        uint256 batchId
    ) external {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        PoolPair storage pool = pools[poolId];
        Batch storage batch = pool.batches[batchId];

        require(batch.settled, "Batch not settled");

        Commitment storage c = batch.commitments[msg.sender];
        require(c.revealed, "Order not revealed");
        require(!c.claimed, "Already claimed");

        c.claimed = true;

        uint256 amountOut;
        if (c.isBuy) {
            if (batch.clearingPrice <= c.minPrice || c.minPrice == 0) {
                amountOut = (c.amount * batch.clearingPrice) / PRICE_DECIMALS;
                uint256 feeAmount = (amountOut * FEE_BPS) / 10000;
                amountOut -= feeAmount;
                IERC20(pool.tokenB).transfer(msg.sender, amountOut);
            } else {
                IERC20(pool.tokenA).transfer(msg.sender, c.amount);
            }
        } else {
            if (batch.clearingPrice >= c.minPrice || c.minPrice == 0) {
                amountOut = (c.amount * PRICE_DECIMALS) / batch.clearingPrice;
                uint256 feeAmount = (amountOut * FEE_BPS) / 10000;
                amountOut -= feeAmount;
                IERC20(pool.tokenA).transfer(msg.sender, amountOut);
            } else {
                IERC20(pool.tokenB).transfer(msg.sender, c.amount);
            }
        }

        emit OrderClaimed(msg.sender, poolId, batchId, amountOut);
    }

    // ──────────────────── Slash ────────────────────

    function slashUnrevealed(
        address tokenA,
        address tokenB,
        uint256 batchId,
        address trader
    ) external {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        PoolPair storage pool = pools[poolId];
        Batch storage batch = pool.batches[batchId];

        require(block.timestamp > batch.revealDeadline, "Reveal phase not ended");

        Commitment storage c = batch.commitments[trader];
        require(c.hash != bytes32(0), "No commitment");
        require(!c.revealed, "Was revealed");
        require(c.bond > 0, "Already slashed");

        uint256 bond = c.bond;
        c.bond = 0;
        payable(msg.sender).transfer(bond);

        emit BondSlashed(trader, poolId, batchId);
    }

    // ──────────────────── Views ────────────────────

    function getBatchPhase(address tokenA, address tokenB) external view returns (Phase) {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        PoolPair storage pool = pools[poolId];
        Batch storage batch = pool.batches[pool.currentBatchId];

        if (batch.settled) return Phase.CLOSED;
        if (batch.commitDeadline == 0) return Phase.COMMIT;
        if (block.timestamp <= batch.commitDeadline) return Phase.COMMIT;
        if (block.timestamp <= batch.revealDeadline) return Phase.REVEAL;
        return Phase.SETTLEMENT;
    }

    function getPoolReserves(address tokenA, address tokenB) external view returns (uint256, uint256) {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        PoolPair storage pool = pools[poolId];
        return (pool.reserveA, pool.reserveB);
    }

    function getLpShares(address tokenA, address tokenB, address provider) external view returns (uint256) {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        return pools[poolId].lpShares[provider];
    }

    // ──────────────────── Math ────────────────────

    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
}
