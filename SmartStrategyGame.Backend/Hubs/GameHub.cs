using Microsoft.AspNetCore.SignalR;
using SmartStrategyGame.Backend.Models;
using SmartStrategyGame.Backend.Data;
using System.Text.Json;

namespace SmartStrategyGame.Backend.Hubs
{
    public class GameHub : Hub
    {
        // Simple in-memory state for demo purposes. 
        // In production, this would be in Redis or DB.
        private static readonly Dictionary<string, GameState> _games = new();
        private static readonly Dictionary<string, List<string>> _gameConnections = new(); // gameId -> list of connectionIds

        private readonly ApplicationDbContext _context;

        public GameHub(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task JoinGame(string gameId, string gameType = "strategy")
        {
            // Ensure gameId is normalized
            gameId = gameId?.Trim() ?? "";
            
            // Try to look up game type from DB to ensure consistency
            if (int.TryParse(gameId, out int id))
            {
                var game = await _context.Games.FindAsync(id);
                if (game != null && !string.IsNullOrEmpty(game.GameType))
                {
                    gameType = game.GameType;
                }
            }

            if (string.IsNullOrEmpty(gameId))
            {
                await Clients.Caller.SendAsync("Error", "Invalid game ID");
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
            
            // Track connections for this game (each gameId has its own isolated state)
            if (!_gameConnections.ContainsKey(gameId))
            {
                _gameConnections[gameId] = new List<string>();
            }
            
            var connections = _gameConnections[gameId];
            bool isFirstPlayer = !connections.Contains(Context.ConnectionId);
            
            // Add connection if not already present
            if (isFirstPlayer)
            {
                connections.Add(Context.ConnectionId);
            }
            
            // Each gameId has its own isolated game state
            if (!_games.ContainsKey(gameId))
            {
                // First player - create NEW game state for THIS gameId
                var units = new List<GameUnit>();
                // Logic Switch based on GameType
                switch (gameType.ToLower())
                {
                    case "conquest": // Galactic Conquest
                        units.Add(new GameUnit { Id = $"{gameId}-p1-flagship", Type = "flagship", OwnerId = Context.ConnectionId, Position = new Position { X = 1, Y = 3 }, Health = 200 }); // Strong unit
                        units.Add(new GameUnit { Id = $"{gameId}-p1-scout", Type = "scout", OwnerId = Context.ConnectionId, Position = new Position { X = 2, Y = 2 }, Health = 50 });
                        units.Add(new GameUnit { Id = $"{gameId}-p1-scout2", Type = "scout", OwnerId = Context.ConnectionId, Position = new Position { X = 2, Y = 4 }, Health = 50 });
                        break;

                    case "arena": // Tactical Arena
                        units.Add(new GameUnit { Id = $"{gameId}-p1-hero", Type = "hero", OwnerId = Context.ConnectionId, Position = new Position { X = 2, Y = 3 }, Health = 150 });
                        units.Add(new GameUnit { Id = $"{gameId}-p1-sniper", Type = "sniper", OwnerId = Context.ConnectionId, Position = new Position { X = 0, Y = 0 }, Health = 60 });
                        units.Add(new GameUnit { Id = $"{gameId}-p1-medic", Type = "medic", OwnerId = Context.ConnectionId, Position = new Position { X = 0, Y = 6 }, Health = 70 });
                        break;

                    case "cards": // Dynasty Cards
                        // Represented as 'summoners' or 'towers' for now
                        units.Add(new GameUnit { Id = $"{gameId}-p1-castle", Type = "castle", OwnerId = Context.ConnectionId, Position = new Position { X = 1, Y = 3 }, Health = 300 });
                        break;

                    case "siege": // Citadel Siege
                        // Attacker vs Defender logic usually, but here symmetric for now
                        units.Add(new GameUnit { Id = $"{gameId}-p1-catapult", Type = "catapult", OwnerId = Context.ConnectionId, Position = new Position { X = 1, Y = 2 }, Health = 80 });
                        units.Add(new GameUnit { Id = $"{gameId}-p1-ram", Type = "ram", OwnerId = Context.ConnectionId, Position = new Position { X = 2, Y = 3 }, Health = 120 });
                        units.Add(new GameUnit { Id = $"{gameId}-p1-catapult2", Type = "catapult", OwnerId = Context.ConnectionId, Position = new Position { X = 1, Y = 4 }, Health = 80 });
                        break;

                    case "clans": // Clans & Kingdoms
                        units.Add(new GameUnit { Id = $"{gameId}-p1-warlord", Type = "warlord", OwnerId = Context.ConnectionId, Position = new Position { X = 2, Y = 3 }, Health = 180 });
                        units.Add(new GameUnit { Id = $"{gameId}-p1-barbarian", Type = "barbarian", OwnerId = Context.ConnectionId, Position = new Position { X = 3, Y = 2 }, Health = 90 });
                        units.Add(new GameUnit { Id = $"{gameId}-p1-barbarian2", Type = "barbarian", OwnerId = Context.ConnectionId, Position = new Position { X = 3, Y = 4 }, Health = 90 });
                        break;

                    case "grid": // Neon Grid
                        // Abstract shapes
                        units.Add(new GameUnit { Id = $"{gameId}-p1-cube", Type = "cube", OwnerId = Context.ConnectionId, Position = new Position { X = 2, Y = 2 }, Health = 100 });
                        units.Add(new GameUnit { Id = $"{gameId}-p1-pyramid", Type = "pyramid", OwnerId = Context.ConnectionId, Position = new Position { X = 2, Y = 4 }, Health = 100 });
                        units.Add(new GameUnit { Id = $"{gameId}-p1-sphere", Type = "sphere", OwnerId = Context.ConnectionId, Position = new Position { X = 1, Y = 3 }, Health = 150 });
                        break;

                    case "towers": // Cosmic Towers
                        units.Add(new GameUnit { Id = $"{gameId}-p1-base", Type = "base", OwnerId = Context.ConnectionId, Position = new Position { X = 0, Y = 3 }, Health = 500 });
                        units.Add(new GameUnit { Id = $"{gameId}-p1-drone", Type = "drone", OwnerId = Context.ConnectionId, Position = new Position { X = 2, Y = 2 }, Health = 40 });
                        units.Add(new GameUnit { Id = $"{gameId}-p1-drone2", Type = "drone", OwnerId = Context.ConnectionId, Position = new Position { X = 2, Y = 4 }, Health = 40 });
                        break;

                    case "chess": // Void Chess
                        // Player 1 (White)
                        units.Add(new GameUnit { Id = $"{gameId}-p1-king", Type = "king", OwnerId = Context.ConnectionId, Position = new Position { X = 4, Y = 0 }, Health = 100 });
                        units.Add(new GameUnit { Id = $"{gameId}-p1-pawn1", Type = "pawn", OwnerId = Context.ConnectionId, Position = new Position { X = 4, Y = 1 }, Health = 50 });
                        units.Add(new GameUnit { Id = $"{gameId}-p1-pawn2", Type = "pawn", OwnerId = Context.ConnectionId, Position = new Position { X = 3, Y = 1 }, Health = 50 });
                        break;
                    
                    case "racing": // Nebula Racing
                        // Player 1 Racer
                        units.Add(new GameUnit { Id = $"{gameId}-p1-racer", Type = "racer", OwnerId = Context.ConnectionId, Position = new Position { X = 0, Y = 1 }, Health = 100 });
                        break;

                    case "tictactoe":
                         // No units initially
                         break; 

                    default: // Strategy / Default
                        // Player 1 units (left side of board)
                        units.Add(new GameUnit { Id = $"{gameId}-p1-infantry", Type = "infantry", OwnerId = Context.ConnectionId, Position = new Position { X = 2, Y = 2 }, Health = 100 });
                        units.Add(new GameUnit { Id = $"{gameId}-p1-tank", Type = "tank", OwnerId = Context.ConnectionId, Position = new Position { X = 2, Y = 5 }, Health = 100 });
                        break;
                }

                _games[gameId] = new GameState
                {
                    Units = units,
                    CurrentTurn = 1,
                    ActivePlayerId = connections[0], // First player's turn
                    TurnStartTime = DateTime.UtcNow,
                    Resources = new SimpleResources { Gold = 100, Mana = 50 },
                    GameType = gameType
                };
            }
            else 
            {
                // Second player joining existing game - add their units
                var gameState = _games[gameId];
                // Check if this player already has units to prevent duplicates
                var playerUnits = gameState.Units.Where(u => u.OwnerId == Context.ConnectionId).ToList();
                if (playerUnits.Count == 0 && connections.Count >= 1)
                {
                    // Add second player's units based on GameType (we assume GameType is consistent)
                    // We don't have GameType stored in GameState currently, but we can infer or pass it again.
                    // For robustness, let's just use the passed gameType.
                    
                    switch (gameType.ToLower())
                    {
                        case "conquest":
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-flagship", Type = "flagship", OwnerId = Context.ConnectionId, Position = new Position { X = 10, Y = 3 }, Health = 200 });
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-scout", Type = "scout", OwnerId = Context.ConnectionId, Position = new Position { X = 9, Y = 2 }, Health = 50 });
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-scout2", Type = "scout", OwnerId = Context.ConnectionId, Position = new Position { X = 9, Y = 4 }, Health = 50 });
                            break;

                        case "arena":
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-hero", Type = "hero", OwnerId = Context.ConnectionId, Position = new Position { X = 9, Y = 3 }, Health = 150 });
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-sniper", Type = "sniper", OwnerId = Context.ConnectionId, Position = new Position { X = 11, Y = 0 }, Health = 60 });
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-medic", Type = "medic", OwnerId = Context.ConnectionId, Position = new Position { X = 11, Y = 6 }, Health = 70 });
                            break;

                        case "cards":
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-castle", Type = "castle", OwnerId = Context.ConnectionId, Position = new Position { X = 10, Y = 3 }, Health = 300 });
                            break;

                        case "siege":
                            // Defender
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-archer", Type = "archer", OwnerId = Context.ConnectionId, Position = new Position { X = 10, Y = 2 }, Health = 60 });
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-wall", Type = "wall", OwnerId = Context.ConnectionId, Position = new Position { X = 9, Y = 3 }, Health = 200 });
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-archer2", Type = "archer", OwnerId = Context.ConnectionId, Position = new Position { X = 10, Y = 4 }, Health = 60 });
                            break;

                        case "clans":
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-warlord", Type = "warlord", OwnerId = Context.ConnectionId, Position = new Position { X = 9, Y = 3 }, Health = 180 });
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-barbarian", Type = "barbarian", OwnerId = Context.ConnectionId, Position = new Position { X = 8, Y = 2 }, Health = 90 });
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-barbarian2", Type = "barbarian", OwnerId = Context.ConnectionId, Position = new Position { X = 8, Y = 4 }, Health = 90 });
                            break;

                        case "grid":
                             // Abstract shapes
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-cube", Type = "cube", OwnerId = Context.ConnectionId, Position = new Position { X = 9, Y = 2 }, Health = 100 });
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-pyramid", Type = "pyramid", OwnerId = Context.ConnectionId, Position = new Position { X = 9, Y = 4 }, Health = 100 });
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-sphere", Type = "sphere", OwnerId = Context.ConnectionId, Position = new Position { X = 10, Y = 3 }, Health = 150 });
                            break;

                        case "towers":
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-base", Type = "base", OwnerId = Context.ConnectionId, Position = new Position { X = 11, Y = 3 }, Health = 500 });
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-drone", Type = "drone", OwnerId = Context.ConnectionId, Position = new Position { X = 9, Y = 2 }, Health = 40 });
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-drone2", Type = "drone", OwnerId = Context.ConnectionId, Position = new Position { X = 9, Y = 4 }, Health = 40 });
                            break;

                        case "chess":
                            // Player 2 (Black)
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-king", Type = "king", OwnerId = Context.ConnectionId, Position = new Position { X = 4, Y = 7 }, Health = 100 }); // Assuming 8x8 but board is 12x8? Default is 12x8.
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-pawn1", Type = "pawn", OwnerId = Context.ConnectionId, Position = new Position { X = 4, Y = 6 }, Health = 50 });
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-pawn2", Type = "pawn", OwnerId = Context.ConnectionId, Position = new Position { X = 3, Y = 6 }, Health = 50 });
                            break;

                        case "racing":
                            // Player 2 Racer
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-racer", Type = "racer", OwnerId = Context.ConnectionId, Position = new Position { X = 0, Y = 2 }, Health = 100 });
                            break;

                        case "tictactoe":
                            // Player 2 is O
                             break;

                        default:
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-infantry", Type = "infantry", OwnerId = Context.ConnectionId, Position = new Position { X = 9, Y = 2 }, Health = 100 });
                            gameState.Units.Add(new GameUnit { Id = $"{gameId}-p2-tank", Type = "tank", OwnerId = Context.ConnectionId, Position = new Position { X = 9, Y = 5 }, Health = 100 });
                            break;
                    }
                    
                    // Broadcast updated state to all players in THIS game only
                    await Clients.Group(gameId).SendAsync("GameStateUpdated", gameState);
                }
            }

            // Send current state to joining player (isolated to this gameId)
            if (_games.ContainsKey(gameId))
            {
                await Clients.Client(Context.ConnectionId).SendAsync("GameStateUpdated", _games[gameId]);
            }
            await Clients.Group(gameId).SendAsync("PlayerJoined", Context.ConnectionId);
        }

        public async Task SendMove(string gameId, MoveAction move)
        {
            // Ensure gameId is normalized
            gameId = gameId?.Trim() ?? "";
            if (string.IsNullOrEmpty(gameId) || !_games.ContainsKey(gameId))
            {
                return; // Invalid game or game doesn't exist
            }

            if (_games.TryGetValue(gameId, out var state))
            {
                // Check if it's player's turn
                if (state.ActivePlayerId != Context.ConnectionId) return;

                // --- Tic Tac Toe Logic ---
                if (state.GameType?.ToLower() == "tictactoe")
                {
                    // Validate bounds 0-2
                    if (move.TargetPosition.X < 0 || move.TargetPosition.X > 2 || move.TargetPosition.Y < 0 || move.TargetPosition.Y > 2) return;

                    // Validate cell is empty
                    bool occupied = state.Units.Any(u => u.Position.X == move.TargetPosition.X && u.Position.Y == move.TargetPosition.Y);
                    if (occupied) return;

                    // Determine marker (Player 1 = X, Player 2 = O)
                    var connections = _gameConnections[gameId];
                    bool isPlayer1 = connections.IndexOf(Context.ConnectionId) == 0;
                    string marker = isPlayer1 ? "X" : "O";

                    // Add "unit" (marker)
                    var newUnit = new GameUnit 
                    { 
                        Id = $"{gameId}-{marker}-{move.TargetPosition.X}-{move.TargetPosition.Y}", 
                        Type = marker, 
                        OwnerId = Context.ConnectionId, 
                        Position = move.TargetPosition, 
                        Health = 1 
                    };
                    state.Units.Add(newUnit);

                    // Check Win Condition
                    bool won = CheckTicTacToeWin(state.Units, marker);
                    
                    if (won)
                    {
                        // Calculate score (simple 100 for now)
                        await EndGame(gameId, Context.ConnectionId); // Reuse EndGame logic (might need to pass score logic here or in EndGame)
                        // Trigger Controller EndGame to save stats - client does this usually via API call after event, 
                        // but here we just notify. The frontend calls 'EndGame' API usually? 
                        // Actually, backend EndGame just notifies. The controller handles DB. 
                        // We need a way to tell Controller to result it?
                        // For now, consistent with existing flow: Notify GameEnded. 
                        // Note: Existing EndGame method in Hub is just signature public async Task EndGame(string gameId, string winnerConnectionId)
                        // We will call that.
                        return;
                    }

                    // Check Draw
                    if (state.Units.Count >= 9)
                    {
                        // Draw
                        await Clients.Group(gameId).SendAsync("GameEnded", new { winnerUsername = "Draw", points = 10 });
                         _ = Task.Run(async () => {
                            await Task.Delay(5000);
                            _games.Remove(gameId);
                        });
                        return;
                    }

                    // Switch Turn
                    state.CurrentTurn++;
                    if (connections.Count > 1)
                    {
                        state.ActivePlayerId = connections.First(c => c != state.ActivePlayerId);
                    }
                    
                    await Clients.Group(gameId).SendAsync("GameStateUpdated", state);
                    return;
                }
                // --- End Tic Tac Toe Logic ---
                
                var unit = state.Units.FirstOrDefault(u => u.Id == move.UnitId);
                if (unit != null && unit.OwnerId == Context.ConnectionId)
                {
                    // Validate move distance (max 2 cells per turn)
                    var distance = Math.Abs(unit.Position.X - move.TargetPosition.X) + Math.Abs(unit.Position.Y - move.TargetPosition.Y);
                    if (distance > 2) return; // Invalid move distance
                    
                    // Check if target cell is occupied by friendly unit
                    var targetUnit = state.Units.FirstOrDefault(u => u.Position.X == move.TargetPosition.X && u.Position.Y == move.TargetPosition.Y);
                    if (targetUnit != null && targetUnit.OwnerId == unit.OwnerId) return; // Can't move on friendly unit
                    
                    // Check for combat if enemy unit is at target
                    if (targetUnit != null && targetUnit.OwnerId != unit.OwnerId)
                    {
                        // Combat: attacker deals damage based on unit type
                        int damage = unit.Type == "tank" ? 50 : 30;
                        targetUnit.Health -= damage;
                        
                        // If enemy unit is destroyed
                        if (targetUnit.Health <= 0)
                        {
                            state.Units.Remove(targetUnit);
                            
                            // Check win condition: all enemy units eliminated
                            var enemyUnits = state.Units.Where(u => u.OwnerId != unit.OwnerId).ToList();
                            if (enemyUnits.Count == 0)
                            {
                                // Player wins!
                                await EndGame(gameId, unit.OwnerId);
                                return;
                            }
                        }
                        else
                        {
                            // Enemy survives, attacker takes damage too
                            unit.Health -= 20;
                            if (unit.Health <= 0)
                            {
                                state.Units.Remove(unit);
                                await Clients.Group(gameId).SendAsync("GameStateUpdated", state);
                                return;
                            }
                        }
                    }
                    
                    // Check win condition: capture enemy base (right side for player 1, left side for player 2)
                    var connections = _gameConnections[gameId];
                    bool isPlayer1 = connections.IndexOf(unit.OwnerId) == 0;
                    bool capturedBase = isPlayer1 
                        ? move.TargetPosition.X >= 11 // Player 1 reaches right edge
                        : move.TargetPosition.X <= 0;  // Player 2 reaches left edge
                    
                    if (capturedBase)
                    {
                        await EndGame(gameId, unit.OwnerId);
                        return;
                    }
                    
                    // Update unit position
                    unit.Position = move.TargetPosition;
                    
                    // Broadcast new state to all players in game
                    await Clients.Group(gameId).SendAsync("GameStateUpdated", state);
                }
            }
        }

        private bool CheckTicTacToeWin(List<GameUnit> units, string marker)
        {
            // Helper to check if marker exists at x,y
            bool Has(int x, int y) => units.Any(u => u.Type == marker && u.Position.X == x && u.Position.Y == y);

            // Lines
            for (int i = 0; i < 3; i++)
            {
                if (Has(i, 0) && Has(i, 1) && Has(i, 2)) return true; // Col
                if (Has(0, i) && Has(1, i) && Has(2, i)) return true; // Row
            }
            // Diagonals
            if (Has(0, 0) && Has(1, 1) && Has(2, 2)) return true;
            if (Has(0, 2) && Has(1, 1) && Has(2, 0)) return true;

            return false;
        }

        public async Task EndTurn(string gameId)
        {
            // Ensure gameId is normalized
            gameId = gameId?.Trim() ?? "";
            if (string.IsNullOrEmpty(gameId) || !_games.ContainsKey(gameId))
            {
                return; // Invalid game or game doesn't exist
            }

            if (_games.TryGetValue(gameId, out var state))
            {
                if (state.ActivePlayerId != Context.ConnectionId) return; // Not your turn

                // Check win condition before ending turn: all enemy units eliminated
                var connections = _gameConnections[gameId];
                var myUnits = state.Units.Where(u => u.OwnerId == Context.ConnectionId).ToList();
                var enemyUnits = state.Units.Where(u => u.OwnerId != Context.ConnectionId).ToList();
                
                if (enemyUnits.Count == 0 && myUnits.Count > 0)
                {
                    // Current player wins!
                    await Clients.Group(gameId).SendAsync("GameEnded", Context.ConnectionId);
                    return;
                }

                // Switch turn
                state.CurrentTurn++;
                state.TurnStartTime = DateTime.UtcNow;
                
                // Toggle active player (simple 2-player logic)
                if (connections.Count > 1)
                {
                    state.ActivePlayerId = connections.First(c => c != state.ActivePlayerId);
                }

                // Give resources per turn
                var activePlayerUnits = state.Units.Where(u => u.OwnerId == state.ActivePlayerId).ToList();
                foreach (var unit in activePlayerUnits)
                {
                    // Heal units slightly each turn
                    unit.Health = Math.Min(100, unit.Health + 5);
                }

                await Clients.Group(gameId).SendAsync("GameStateUpdated", state);
            }
        }

        public async Task LeaveGame(string gameId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, gameId);
            
            // Remove connection from tracking
            if (_gameConnections.ContainsKey(gameId))
            {
                _gameConnections[gameId].Remove(Context.ConnectionId);
                
                // If no players left, clean up game state
                if (_gameConnections[gameId].Count == 0)
                {
                    _gameConnections.Remove(gameId);
                    _games.Remove(gameId);
                }
            }
            
            await Clients.Group(gameId).SendAsync("PlayerLeft", Context.ConnectionId);
        }

        public async Task EndGame(string gameId, string winnerConnectionId)
        {
            gameId = gameId?.Trim() ?? "";
            if (string.IsNullOrEmpty(gameId) || !_games.ContainsKey(gameId))
            {
                return;
            }

            if (_games.TryGetValue(gameId, out var state))
            {
                int winnerPoints = 0;
                string winnerName = "Unknown"; // Default

                // Persist result to DB
                if (int.TryParse(gameId, out int id))
                {
                    try 
                    {
                        var game = await _context.Games.FindAsync(id);
                        if (game != null && game.Status != "Finished")
                        {
                            var connections = _gameConnections.ContainsKey(gameId) ? _gameConnections[gameId] : new List<string>();
                            
                            // Determine Winner/Loser User IDs based on connection index
                            // Assumption: connections[0] is Player1, connections[1] is Player2
                            int winnerUserId = 0;
                            int loserUserId = 0;

                            if (connections.Count > 0 && winnerConnectionId == connections[0])
                            {
                                winnerUserId = game.Player1Id;
                                loserUserId = game.Player2Id ?? 0;
                            }
                            else if (connections.Count > 1 && winnerConnectionId == connections[1])
                            {
                                winnerUserId = game.Player2Id ?? 0;
                                loserUserId = game.Player1Id;
                            }
                            
                            // fallback: if we can't map by index, try to infer? 
                            // If index mapping failed, we might skip updates or just mark game ended.
                            
                            if (winnerUserId != 0)
                            {
                                game.WinnerId = winnerUserId;
                                game.Status = "Finished";
                                game.EndTime = DateTime.UtcNow;

                                // Update Player Stats
                                var winner = await _context.Users.FindAsync(winnerUserId);
                                if (winner != null)
                                {
                                    winner.Wins++;
                                    winner.MatchesPlayed++;
                                    winner.Points += 100; // 100 points for win
                                    winnerPoints = winner.Points;
                                    winnerName = winner.Username; 
                                }

                                if (loserUserId != 0)
                                {
                                    var loser = await _context.Users.FindAsync(loserUserId);
                                    if (loser != null)
                                    {
                                        loser.Losses++;
                                        loser.MatchesPlayed++;
                                        loser.Points += 20; // 20 points for participating
                                    }
                                }
                                
                                await _context.SaveChangesAsync();
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error saving game result: {ex.Message}");
                    }
                }

                // Broadcast game end with details
                await Clients.Group(gameId).SendAsync("GameEnded", new { winnerUsername = winnerName, points = 100 });
                
                // Clean up game state after a delay (to allow clients to receive the message)
                // In production, you might want to persist this to DB first
                _ = Task.Run(async () =>
                {
                    await Task.Delay(5000); // Wait 5 seconds
                    if (_games.ContainsKey(gameId))
                    {
                        _games.Remove(gameId);
                    }
                    if (_gameConnections.ContainsKey(gameId))
                    {
                        _gameConnections.Remove(gameId);
                    }
                });
            }
        }

        // Helper method to get active games count (for debugging)
        public int GetActiveGamesCount()
        {
            return _games.Count;
        }
    }
}
