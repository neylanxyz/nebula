// SPDX-License-Identifier: MIT
pragma solidity 0.8.31;

interface INebulaPrivatePool {
    function deposit(bytes32 commitment) external payable;
}

// ─────────────────────────────────────────────────────────────────────────────
//  TournamentGame
//  Updated: constructor now accepts _owner so factories can set the owner.
// ─────────────────────────────────────────────────────────────────────────────
contract TournamentGame {
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    error GameFull();
    error GameAlreadyResolved();
    error NotOwner();
    error WrongEntryFee();
    error WrongNebulaFee();

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    event PlayerEntered(address indexed player);
    event PrizeDeposited(bytes32 commitment);

    /*//////////////////////////////////////////////////////////////
                              CONSTANTS
    //////////////////////////////////////////////////////////////*/
    uint256 public constant ENTRY_FEE    = 0.5 ether;
    uint256 public constant NEBULA_DENOM = 1 ether;
    uint256 public constant NEBULA_FEE   = 0.1 ether;
    uint256 public constant NEBULA_TOTAL = NEBULA_DENOM + NEBULA_FEE;

    /*//////////////////////////////////////////////////////////////
                                STATE
    //////////////////////////////////////////////////////////////*/
    address public immutable owner;
    INebulaPrivatePool public immutable nebula;

    address[] public players;
    uint256 public currentBalance;
    bool public gameResolved;

    /*//////////////////////////////////////////////////////////////
                             CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @param _nebula  Address of the Nebula PrivatePool contract
    /// @param _owner   Address that will own this game (set by factory)
    constructor(address _nebula, address _owner) {
        owner  = _owner;
        nebula = INebulaPrivatePool(_nebula);
    }

    /*//////////////////////////////////////////////////////////////
                              MODIFIERS
    //////////////////////////////////////////////////////////////*/
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                               ENTER
    //////////////////////////////////////////////////////////////*/

    /// @notice Player enters the tournament by sending exactly 0.5 AVAX
    function enter() external payable {
        if (gameResolved) revert GameAlreadyResolved();
        if ((currentBalance + msg.value) > NEBULA_DENOM) revert GameFull();
        if (msg.value != ENTRY_FEE) revert WrongEntryFee();

        currentBalance += msg.value;
        players.push(msg.sender);
        emit PlayerEntered(msg.sender);
    }

    /// @notice Resolves game and deposits prize into Nebula Private Pool
    function resolveGameAndDeposit(bytes32 _commitment) external payable onlyOwner {
        if (msg.value != NEBULA_FEE) revert WrongNebulaFee();

        gameResolved = true;
        nebula.deposit{value: NEBULA_TOTAL}(_commitment);
        emit PrizeDeposited(_commitment);
    }

    /// @notice Emergency withdraw — only owner
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = payable(owner).call{value: address(this).balance}("");
        require(success, "emergency withdraw failed");
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  TournamentGameFactory
//  Deploys TournamentGame instances and keeps a registry of all games.
// ─────────────────────────────────────────────────────────────────────────────
contract TournamentGameFactory {
    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    event GameCreated(address indexed game, address indexed creator);

    /*//////////////////////////////////////////////////////////////
                                STATE
    //////////////////////////////////////////////////////////////*/
    address public immutable nebula;
    address[] public allGames;

    /*//////////////////////////////////////////////////////////////
                             CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    constructor(address _nebula) {
        nebula = _nebula;
    }

    /*//////////////////////////////////////////////////////////////
                              FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Deploys a new TournamentGame. Caller becomes its owner.
    function createGame() external returns (address game) {
        TournamentGame newGame = new TournamentGame(nebula, msg.sender);
        game = address(newGame);
        allGames.push(game);
        emit GameCreated(game, msg.sender);
    }

    /// @notice Returns all deployed game addresses
    function getGames() external view returns (address[] memory) {
        return allGames;
    }

    /// @notice Total number of games created
    function gamesCount() external view returns (uint256) {
        return allGames.length;
    }
}
