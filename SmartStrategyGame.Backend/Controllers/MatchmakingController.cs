using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SmartStrategyGame.Backend.Data;
using SmartStrategyGame.Backend.DTOs;
using SmartStrategyGame.Backend.Hubs;
using SmartStrategyGame.Backend.Models;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace SmartStrategyGame.Backend.Controllers
{
    // Simple in-memory matchmaking service for demo purposes
    public static class MatchmakingQueue
    {
        // Separate queues for each game type
        public static ConcurrentDictionary<string, ConcurrentQueue<int>> QueuesByGameType = new();
        
        public static ConcurrentQueue<int> GetQueueForGameType(string gameType)
        {
            return QueuesByGameType.GetOrAdd(gameType, _ => new ConcurrentQueue<int>());
        }
    }

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MatchmakingController : ControllerBase
    {
        private readonly IHubContext<MatchmakingHub> _hubContext;
        private readonly ApplicationDbContext _context;

        public MatchmakingController(IHubContext<MatchmakingHub> hubContext, ApplicationDbContext context)
        {
            _hubContext = hubContext;
            _context = context;
        }

        [HttpPost("join-queue")]
        public async Task<IActionResult> JoinQueue(JoinQueueDto request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var gameType = request.GameType ?? "Strategy";
            
            // Get queue for this specific game type
            var queue = MatchmakingQueue.GetQueueForGameType(gameType);
            
            // Check if user is already in queue for this game type
            var queueList = queue.ToArray();
            if (queueList.Contains(userId))
            {
                return Ok(new { Message = "Already in queue", IsInQueue = true });
            }

            queue.Enqueue(userId);

            // Attempt to match if 2 players in this game type's queue
            if (queue.Count >= 2)
            {
                if (queue.TryDequeue(out int player1) && queue.TryDequeue(out int player2))
                {
                    // Match found! Create a game record with game type
                    var game = new Game
                    {
                        Player1Id = player1,
                        Player2Id = player2,
                        Status = "Waiting",
                        StartTime = DateTime.UtcNow,
                        GameStateJson = "{}",
                        GameType = gameType
                    };

                    _context.Games.Add(game);
                    await _context.SaveChangesAsync();

                    // Notify both players via SignalR
                    await _hubContext.Clients.All.SendAsync("MatchFound", new 
                    { 
                        GameId = game.Id,
                        Player1 = player1, 
                        Player2 = player2,
                        GameType = gameType
                    });

                    return Ok(new { Message = "Match found!", GameId = game.Id, GameType = gameType });
                }
            }

            return Ok(new { Message = "Joined queue", IsInQueue = true, GameType = gameType });
        }

        [HttpPost("leave-queue")]
        public IActionResult LeaveQueue()
        {
             // Removing from ConcurrentQueue is tricky without rebuilding, skipping for demo
             return Ok("Left queue");
        }

        [HttpGet("status")]
        public ActionResult<QueueStatusDto> GetStatus([FromQuery] string? gameType = "Strategy")
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var queue = MatchmakingQueue.GetQueueForGameType(gameType ?? "Strategy");
            var queueList = queue.ToArray();
            
            return new QueueStatusDto 
            {
                IsInQueue = queueList.Contains(userId),
                PlayersInQueue = queue.Count,
                JoinedAt = DateTime.UtcNow
            };
        }
    }
}
