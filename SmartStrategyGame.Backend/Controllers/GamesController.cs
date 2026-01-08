using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SmartStrategyGame.Backend.Data;
using SmartStrategyGame.Backend.DTOs;
using SmartStrategyGame.Backend.Hubs;
using SmartStrategyGame.Backend.Models;
using System.Security.Claims;

namespace SmartStrategyGame.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GamesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<GameHub> _gameHub;

        public GamesController(ApplicationDbContext context, IHubContext<GameHub> gameHub)
        {
            _context = context;
            _gameHub = gameHub;
        }

        [HttpPost("create")]
        public async Task<ActionResult<Game>> CreateGame(CreateGameDto request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            var game = new Game
            {
                Player1Id = userId,
                Status = "Waiting",
                StartTime = DateTime.UtcNow
            };

            _context.Games.Add(game);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGame), new { gameId = game.Id }, game);
        }

        [HttpGet("{gameId}")]
        public async Task<ActionResult<Game>> GetGame(int gameId)
        {
            var game = await _context.Games
                .Include(g => g.Player1)
                .Include(g => g.Player2)
                .FirstOrDefaultAsync(g => g.Id == gameId);

            if (game == null) return NotFound();

            return game;
        }

        [HttpPost("{gameId}/start")]
        public async Task<IActionResult> StartGame(int gameId)
        {
            var game = await _context.Games.FindAsync(gameId);
            if (game == null) return NotFound();

            if (game.Player2Id == null) return BadRequest("Need two players to start.");

            game.Status = "InProgress";
            await _context.SaveChangesAsync();

            await _gameHub.Clients.Group(gameId.ToString()).SendAsync("GameStarted", game.Id);

            return Ok();
        }

        [HttpPost("{gameId}/end")]
        public async Task<IActionResult> EndGame(int gameId, [FromQuery] int winnerId)
        {
            var game = await _context.Games.FindAsync(gameId);
            if (game == null) return NotFound();

            game.Status = "Finished";
            game.EndTime = DateTime.UtcNow;
            game.WinnerId = winnerId;

            // Update stats
            var winner = await _context.Users.FindAsync(winnerId);
            if (winner != null)
            {
                winner.Wins++;
                winner.MatchesPlayed++;
            }

            var loserId = (game.Player1Id == winnerId) ? game.Player2Id : game.Player1Id;
            if (loserId.HasValue)
            {
                var loser = await _context.Users.FindAsync(loserId.Value);
                if (loser != null)
                {
                    loser.Losses++;
                    loser.MatchesPlayed++;
                }
            }

            var winnerUsername = "Unknown";
            var pointsEarned = 0;

            if (winner != null)
            {
                winnerUsername = winner.Username;
                pointsEarned = 100; // Base points for winning
                // Could add bonus based on quick win etc.
            }

            await _context.SaveChangesAsync();
            
            // Broadcast rich object: { winnerUsername, points }
            await _gameHub.Clients.Group(gameId.ToString()).SendAsync("GameEnded", new { 
                winnerUsername = winnerUsername,
                points = pointsEarned 
            });

            // Notify for leaderboard update/dashboard refresh
            // If using NotificationHub, we'd inject it and send "StatsUpdated"
            
            return Ok();
        }

        [HttpPost("{gameId}/move")]
        public async Task<IActionResult> MakeMove(int gameId, MoveDto move)
        {
            // In a real game, validate move against game state
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            
            // Broadcast move to other players
            await _gameHub.Clients.Group(gameId.ToString()).SendAsync("PlayerMoved", new { UserId = userId, Move = move });

            return Ok();
        }

        [HttpGet("{gameId}/state")]
        public async Task<ActionResult<string>> Getstate(int gameId)
        {
            var game = await _context.Games.FindAsync(gameId);
            if (game == null) return NotFound();
            return Ok(game.GameStateJson);
        }
    }
}
