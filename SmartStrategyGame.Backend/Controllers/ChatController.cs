using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartStrategyGame.Backend.Data;
using SmartStrategyGame.Backend.DTOs;

namespace SmartStrategyGame.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ChatController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{gameId}/chat")]
        public async Task<ActionResult<IEnumerable<ChatMessageDto>>> GetChatHistory(int gameId)
        {
            var messages = await _context.ChatMessages
                .Where(m => m.GameId == gameId)
                .OrderBy(m => m.Timestamp)
                .Select(m => new ChatMessageDto
                {
                    SenderId = m.SenderId,
                    SenderName = m.Sender!.Username,
                    Message = m.Message,
                    Timestamp = m.Timestamp
                })
                .ToListAsync();

            return Ok(messages);
        }
    }
}
