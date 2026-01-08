using Microsoft.AspNetCore.Mvc;

namespace SmartStrategyGame.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeaderboardController : ControllerBase
    {
        // Reusing logic from StatsController or implementing season logic
        // For now, simple stubs matching the requested API

        [HttpGet("global")]
        public IActionResult GetGlobalLeaderboard()
        {
            // Implementation similar to StatsController.GetLeaderboard
            return Ok(new List<object>()); 
        }

        [HttpGet("season/{seasonId}")]
        public IActionResult GetSeasonLeaderboard(string seasonId)
        {
             // Stub
             return Ok(new List<object>()); 
        }
    }
}
