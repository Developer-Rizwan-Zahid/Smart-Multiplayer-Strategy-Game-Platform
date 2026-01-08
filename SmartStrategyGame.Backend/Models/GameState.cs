using System.Numerics;

namespace SmartStrategyGame.Backend.Models
{
    public class GameState
    {
        public List<GameUnit> Units { get; set; } = new List<GameUnit>();
        public int CurrentTurn { get; set; } = 1;
        public string ActivePlayerId { get; set; } = string.Empty;
        public DateTime TurnStartTime { get; set; } = DateTime.UtcNow;
        public SimpleResources Resources { get; set; } = new SimpleResources();
        public string GameType { get; set; } = "Strategy";
    }

    public class SimpleResources
    {
        public int Gold { get; set; } = 100;
        public int Mana { get; set; } = 50;
    }

    public class GameUnit
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = "infantry";
        public string OwnerId { get; set; } = string.Empty;
        public Position Position { get; set; } = new Position { X = 0, Y = 0 };
        public int Health { get; set; } = 100;
    }

    public class Position
    {
        public int X { get; set; }
        public int Y { get; set; }
    }

    public class MoveAction
    {
        public string UnitId { get; set; } = string.Empty;
        public Position TargetPosition { get; set; } = new Position();
    }
}
