using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartStrategyGame.Backend.Models
{
    public class Game
    {
        public int Id { get; set; }

        public int Player1Id { get; set; }
        public User? Player1 { get; set; }

        public int? Player2Id { get; set; }
        public User? Player2 { get; set; }

        public int? WinnerId { get; set; }
        public User? Winner { get; set; }

        public DateTime StartTime { get; set; } = DateTime.UtcNow;
        public DateTime? EndTime { get; set; }

        [Column(TypeName = "jsonb")]
        public string GameStateJson { get; set; } = "{}"; 

        public string Status { get; set; } = "Waiting";
        
        public string GameType { get; set; } = "Strategy"; // Strategy, TicTacToe, etc.
    }
}
