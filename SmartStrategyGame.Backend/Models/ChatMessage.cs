using System.ComponentModel.DataAnnotations;

namespace SmartStrategyGame.Backend.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }

        public int GameId { get; set; }
        public Game? Game { get; set; }

        public int SenderId { get; set; }
        public User? Sender { get; set; }

        [Required]
        public string Message { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
