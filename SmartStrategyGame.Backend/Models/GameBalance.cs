using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartStrategyGame.Backend.Models
{
    public class GameBalance
    {
        public int Id { get; set; }

        [Required]
        public string Version { get; set; } = "1.0.0";

        [Column(TypeName = "jsonb")]
        public string ConfigJson { get; set; } = "{}"; // Unit stats, costs, etc.

        public bool IsActive { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
