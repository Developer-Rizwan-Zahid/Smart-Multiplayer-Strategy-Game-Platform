using System.ComponentModel.DataAnnotations;

namespace SmartStrategyGame.Backend.DTOs
{
    // Auth DTOs (Already exist, but kept here for reference if separate file used)
    
    public class RefreshTokenRequest
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }

    // User DTOs
    public class UserProfileDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int MatchesPlayed { get; set; }
        public int Wins { get; set; }
        public int Losses { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateProfileDto
    {
        public string? NewPassword { get; set; }
        // Add other updatable fields here
    }

    // Matchmaking DTOs
    public class JoinQueueDto
    {
        public string GameMode { get; set; } = "Standard";
        public string GameType { get; set; } = "Strategy"; // Strategy, TicTacToe, etc.
    }

    public class QueueStatusDto
    {
        public bool IsInQueue { get; set; }
        public int PlayersInQueue { get; set; }
        public DateTime? JoinedAt { get; set; }
    }

    // Game DTOs
    public class CreateGameDto
    {
        public int MapId { get; set; }
        public string GameMode { get; set; } = "Standard";
    }

    public class GameStateDto
    {
        public int GameId { get; set; }
        public string Status { get; set; } = string.Empty;
        public int TurnNumber { get; set; }
        public int CurrentPlayerId { get; set; }
        public string BoardStateJson { get; set; } = "{}";
        public DateTime? LastMoveTime { get; set; }
    }
    
    public class MoveDto
    {
        public int UnitId { get; set; }
        public int TargetX { get; set; }
        public int TargetY { get; set; }
        public string ActionType { get; set; } = "Move"; // Attack, Build, etc.
    }

    // Chat DTOs
    public class ChatMessageDto
    {
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }

    // Admin DTOs
    public class CreateMapDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        [Required]
        public string LayoutJson { get; set; } = "{}";
    }

    public class UpdateGameBalanceDto
    {
        [Required]
        public string ConfigJson { get; set; } = "{}";
        public string Version { get; set; } = "1.0.1";
    }
}
