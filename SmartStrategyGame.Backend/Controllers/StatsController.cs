using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartStrategyGame.Backend.Data;
using SmartStrategyGame.Backend.DTOs;
using System.Security.Claims;

namespace SmartStrategyGame.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StatsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StatsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("me")]
        public async Task<ActionResult<UserProfileDto>> GetMyStats()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            return new UserProfileDto
            {
                Id = user.Id,
                Username = user.Username,
                MatchesPlayed = user.MatchesPlayed,
                Wins = user.Wins,
                Losses = user.Losses
            };
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<UserProfileDto>> GetUserStats(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            return new UserProfileDto
            {
                Id = user.Id,
                Username = user.Username,
                MatchesPlayed = user.MatchesPlayed,
                Wins = user.Wins,
                Losses = user.Losses
            };
        }

        [HttpGet("leaderboard")]
        public async Task<ActionResult<IEnumerable<UserProfileDto>>> GetLeaderboard()
        {
             var users = await _context.Users
                .OrderByDescending(u => u.Wins)
                .Take(10)
                .Select(u => new UserProfileDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    MatchesPlayed = u.MatchesPlayed,
                    Wins = u.Wins,
                    Losses = u.Losses
                })
                .ToListAsync();

            return Ok(users);
        }
    }
}
