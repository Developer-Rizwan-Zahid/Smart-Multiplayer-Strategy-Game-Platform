using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace SmartStrategyGame.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AiController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _aiServiceUrl;

        public AiController(IConfiguration configuration)
        {
            _httpClient = new HttpClient();
            _aiServiceUrl = configuration["AI_SERVICE_URL"] ?? "http://localhost:8000";
        }

        [HttpPost("analyze-match")]
        public async Task<IActionResult> AnalyzeMatch([FromBody] object matchData)
        {
            var json = JsonSerializer.Serialize(matchData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_aiServiceUrl}/analyze-match", content);
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                return Ok(result);
            }

            return StatusCode((int)response.StatusCode, "Error contacting AI service");
        }

        [HttpGet("recommendations/{gameId}")]
        public async Task<IActionResult> GetRecommendations(string gameId)
        {
            var response = await _httpClient.GetAsync($"{_aiServiceUrl}/recommendations/{gameId}");

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                return Ok(result);
            }

            return StatusCode((int)response.StatusCode, "Error contacting AI service");
        }
    }
}
