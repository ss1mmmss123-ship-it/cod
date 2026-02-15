// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DurakBetEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum GameStatus {
        None,
        Open,
        Locked,
        Settled,
        Cancelled
    }

    struct Game {
        address creator;
        address token;
        uint256 buyIn;
        uint16 feeBps;
        GameStatus status;
        address[] players;
        mapping(address => bool) joined;
        bool withdrawn;
    }

    uint16 public constant MAX_FEE_BPS = 500;
    uint16 public defaultFeeBps = 300;
    address public treasury;

    mapping(bytes32 => Game) private games;

    event TableCreated(bytes32 indexed gameId, address indexed creator, address indexed token, uint256 buyIn, uint16 feeBps);
    event PlayerJoined(bytes32 indexed gameId, address indexed player, uint256 amount);
    event GameLocked(bytes32 indexed gameId, uint256 totalPot);
    event GameSettled(bytes32 indexed gameId, address indexed winner, uint256 winnerAmount, uint256 feeAmount);
    event GameCancelled(bytes32 indexed gameId);
    event DefaultFeeUpdated(uint16 feeBps);
    event TreasuryUpdated(address treasury);

    constructor(address _treasury) Ownable(msg.sender) {
        require(_treasury != address(0), "invalid treasury");
        treasury = _treasury;
    }

    function createTable(bytes32 gameId, address token, uint256 buyIn, uint16 customFeeBps) external {
        require(games[gameId].status == GameStatus.None, "game exists");
        require(token != address(0), "invalid token");
        require(buyIn > 0, "invalid buyin");

        uint16 fee = customFeeBps == 0 ? defaultFeeBps : customFeeBps;
        require(fee <= MAX_FEE_BPS, "fee too high");

        Game storage g = games[gameId];
        g.creator = msg.sender;
        g.token = token;
        g.buyIn = buyIn;
        g.feeBps = fee;
        g.status = GameStatus.Open;

        emit TableCreated(gameId, msg.sender, token, buyIn, fee);
    }

    function joinTable(bytes32 gameId) external nonReentrant {
        Game storage g = games[gameId];
        require(g.status == GameStatus.Open, "not open");
        require(!g.joined[msg.sender], "already joined");

        g.joined[msg.sender] = true;
        g.players.push(msg.sender);

        IERC20(g.token).safeTransferFrom(msg.sender, address(this), g.buyIn);
        emit PlayerJoined(gameId, msg.sender, g.buyIn);
    }

    function lockGame(bytes32 gameId) external {
        Game storage g = games[gameId];
        require(g.status == GameStatus.Open, "invalid status");
        require(msg.sender == g.creator || msg.sender == owner(), "unauthorized");
        require(g.players.length >= 2 && g.players.length <= 6, "invalid player count");

        g.status = GameStatus.Locked;
        emit GameLocked(gameId, g.buyIn * g.players.length);
    }

    function settleGame(bytes32 gameId, address winner) external nonReentrant onlyOwner {
        Game storage g = games[gameId];
        require(g.status == GameStatus.Locked, "not locked");
        require(g.joined[winner], "winner not participant");
        require(!g.withdrawn, "already withdrawn");

        uint256 pot = g.buyIn * g.players.length;
        uint256 fee = (pot * g.feeBps) / 10000;
        uint256 payout = pot - fee;

        g.status = GameStatus.Settled;
        g.withdrawn = true;

        IERC20(g.token).safeTransfer(winner, payout);
        IERC20(g.token).safeTransfer(treasury, fee);

        emit GameSettled(gameId, winner, payout, fee);
    }

    function cancelGame(bytes32 gameId) external nonReentrant {
        Game storage g = games[gameId];
        require(g.status == GameStatus.Open, "cannot cancel");
        require(msg.sender == g.creator || msg.sender == owner(), "unauthorized");

        g.status = GameStatus.Cancelled;

        for (uint256 i = 0; i < g.players.length; i++) {
            IERC20(g.token).safeTransfer(g.players[i], g.buyIn);
        }

        emit GameCancelled(gameId);
    }

    function setDefaultFeeBps(uint16 feeBps) external onlyOwner {
        require(feeBps <= MAX_FEE_BPS, "fee too high");
        defaultFeeBps = feeBps;
        emit DefaultFeeUpdated(feeBps);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "invalid treasury");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function getGameMeta(bytes32 gameId)
        external
        view
        returns (address creator, address token, uint256 buyIn, uint16 feeBps, GameStatus status, uint256 playerCount, bool withdrawn)
    {
        Game storage g = games[gameId];
        return (g.creator, g.token, g.buyIn, g.feeBps, g.status, g.players.length, g.withdrawn);
    }

    function getGamePlayers(bytes32 gameId) external view returns (address[] memory) {
        return games[gameId].players;
    }
}
