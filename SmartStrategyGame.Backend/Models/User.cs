using System.ComponentModel.DataAnnotations;

namespace SmartStrategyGame.Backend.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = "Player"; // "Player" or "Admin"

        public int MatchesPlayed { get; set; }
        public int Wins { get; set; }
        public int Losses { get; set; }
        public int Points { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
