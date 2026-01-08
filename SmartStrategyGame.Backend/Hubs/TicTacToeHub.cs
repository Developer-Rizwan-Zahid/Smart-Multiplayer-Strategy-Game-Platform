using Microsoft.AspNetCore.SignalR;
using SmartStrategyGame.Backend.Models;

namespace SmartStrategyGame.Backend.Hubs
{
    public class TicTacToeHub : Hub
    {
        // Game state: gameId -> board state
        private static readonly Dictionary<string, TicTacToeState> _games = new();
        private static readonly Dictionary<string, List<string>> _gameConnections = new();

        public async Task JoinGame(string gameId)
        {
            gameId = gameId?.Trim() ?? "";
            if (string.IsNullOrEmpty(gameId))
            {
                await Clients.Caller.SendAsync("Error", "Invalid game ID");
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, gameId);

            // Track connections
            if (!_gameConnections.ContainsKey(gameId))
            {
                _gameConnections[gameId] = new List<string>();
            }

            var connections = _gameConnections[gameId];
            bool isFirstPlayer = !connections.Contains(Context.ConnectionId);

            if (isFirstPlayer)
            {
                connections.Add(Context.ConnectionId);
            }

            // Initialize game if first player
            if (!_games.ContainsKey(gameId))
            {
                _games[gameId] = new TicTacToeState
                {
                    Board = new string[3, 3], // 3x3 grid
                    CurrentPlayer = "X", // First player is X
                    PlayerXConnectionId = connections[0],
                    PlayerOConnectionId = connections.Count > 1 ? connections[1] : null
                };
            }
            else if (connections.Count == 2 && _games[gameId].PlayerOConnectionId == null)
            {
                // Second player joining
                _games[gameId].PlayerOConnectionId = Context.ConnectionId;
            }

            // Send current state - convert 2D array to nested array for JSON serialization
            if (_games.ContainsKey(gameId))
            {
                var state = _games[gameId];
                var boardArray = new string[3][];
                for (int i = 0; i < 3; i++)
                {
                    boardArray[i] = new string[3];
                    for (int j = 0; j < 3; j++)
                    {
                        boardArray[i][j] = state.Board[i, j] ?? "";
                    }
                }
                
                await Clients.Client(Context.ConnectionId).SendAsync("GameStateUpdated", new
                {
                    Board = boardArray,
                    CurrentPlayer = state.CurrentPlayer,
                    Winner = state.Winner,
                    GameOver = state.GameOver,
                    PlayerXConnectionId = state.PlayerXConnectionId,
                    PlayerOConnectionId = state.PlayerOConnectionId
                });
            }
        }

        public async Task MakeMove(string gameId, int row, int col)
        {
            gameId = gameId?.Trim() ?? "";
            if (string.IsNullOrEmpty(gameId) || !_games.ContainsKey(gameId))
            {
                return;
            }

            var state = _games[gameId];

            // Check if it's player's turn
            bool isPlayerX = Context.ConnectionId == state.PlayerXConnectionId;
            bool isPlayerO = Context.ConnectionId == state.PlayerOConnectionId;
            
            if (!isPlayerX && !isPlayerO) return; // Not a player in this game

            string playerSymbol = isPlayerX ? "X" : "O";
            if (state.CurrentPlayer != playerSymbol) return; // Not your turn

            // Validate move
            if (row < 0 || row >= 3 || col < 0 || col >= 3) return;
            if (!string.IsNullOrEmpty(state.Board[row, col])) return; // Cell already occupied

            // Make move
            state.Board[row, col] = playerSymbol;

            // Check for win
            string? winner = CheckWinner(state.Board);
            if (winner != null)
            {
                state.Winner = winner;
                state.GameOver = true;
                await Clients.Group(gameId).SendAsync("GameEnded", winner == "X" ? state.PlayerXConnectionId : state.PlayerOConnectionId);
                return;
            }

            // Check for draw
            if (IsBoardFull(state.Board))
            {
                state.GameOver = true;
                state.Winner = "Draw";
                await Clients.Group(gameId).SendAsync("GameEnded", "Draw");
                return;
            }

            // Switch turn
            state.CurrentPlayer = state.CurrentPlayer == "X" ? "O" : "X";

            // Broadcast updated state - convert 2D array to nested array
            var boardArray = new string[3][];
            for (int i = 0; i < 3; i++)
            {
                boardArray[i] = new string[3];
                for (int j = 0; j < 3; j++)
                {
                    boardArray[i][j] = state.Board[i, j] ?? "";
                }
            }
            
            await Clients.Group(gameId).SendAsync("GameStateUpdated", new
            {
                Board = boardArray,
                CurrentPlayer = state.CurrentPlayer,
                Winner = state.Winner,
                GameOver = state.GameOver,
                PlayerXConnectionId = state.PlayerXConnectionId,
                PlayerOConnectionId = state.PlayerOConnectionId
            });
        }

        private string? CheckWinner(string[,] board)
        {
            // Check rows
            for (int i = 0; i < 3; i++)
            {
                if (board[i, 0] == board[i, 1] && board[i, 1] == board[i, 2] && !string.IsNullOrEmpty(board[i, 0]))
                    return board[i, 0];
            }

            // Check columns
            for (int i = 0; i < 3; i++)
            {
                if (board[0, i] == board[1, i] && board[1, i] == board[2, i] && !string.IsNullOrEmpty(board[0, i]))
                    return board[0, i];
            }

            // Check diagonals
            if (board[0, 0] == board[1, 1] && board[1, 1] == board[2, 2] && !string.IsNullOrEmpty(board[0, 0]))
                return board[0, 0];
            if (board[0, 2] == board[1, 1] && board[1, 1] == board[2, 0] && !string.IsNullOrEmpty(board[0, 2]))
                return board[0, 2];

            return null;
        }

        private bool IsBoardFull(string[,] board)
        {
            for (int i = 0; i < 3; i++)
            {
                for (int j = 0; j < 3; j++)
                {
                    if (string.IsNullOrEmpty(board[i, j]))
                        return false;
                }
            }
            return true;
        }

        public async Task LeaveGame(string gameId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, gameId);
            
            if (_gameConnections.ContainsKey(gameId))
            {
                _gameConnections[gameId].Remove(Context.ConnectionId);
                if (_gameConnections[gameId].Count == 0)
                {
                    _gameConnections.Remove(gameId);
                    _games.Remove(gameId);
                }
            }
        }
    }

    public class TicTacToeState
    {
        public string[,] Board { get; set; } = new string[3, 3];
        public string CurrentPlayer { get; set; } = "X";
        public string? PlayerXConnectionId { get; set; }
        public string? PlayerOConnectionId { get; set; }
        public string? Winner { get; set; }
        public bool GameOver { get; set; } = false;
    }
}
