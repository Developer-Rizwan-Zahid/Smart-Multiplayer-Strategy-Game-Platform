using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartStrategyGame.Backend.Data;
using SmartStrategyGame.Backend.DTOs;
using SmartStrategyGame.Backend.Models;

namespace SmartStrategyGame.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<UserProfileDto>>> GetAllUsers()
        {
             return await _context.Users
                .Select(u => new UserProfileDto { Id = u.Id, Username = u.Username })
                .ToListAsync();
        }

        [HttpPost("maps")]
        public async Task<IActionResult> CreateMap(CreateMapDto request)
        {
            var map = new Map
            {
                Name = request.Name,
                LayoutJson = request.LayoutJson
            };
            
            _context.Maps.Add(map);
            await _context.SaveChangesAsync();
            return Ok(map);
        }

        [HttpPut("game-balance")]
        public async Task<IActionResult> UpdateGameBalance(UpdateGameBalanceDto request)
        {
            // Deactivate old configs?
            
            var balance = new GameBalance
            {
                ConfigJson = request.ConfigJson,
                Version = request.Version,
                IsActive = true
            };

            _context.GameBalances.Add(balance);
            await _context.SaveChangesAsync();
            return Ok(balance);
        }

        [HttpGet("matches")]
        public async Task<IActionResult> GetAllMatches()
        {
            return Ok(await _context.Games.ToListAsync());
        }
    }
}
