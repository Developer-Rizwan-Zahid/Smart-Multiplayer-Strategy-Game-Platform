using Microsoft.AspNetCore.SignalR;

namespace SmartStrategyGame.Backend.Hubs
{
    public class MatchmakingHub : Hub
    {
        public async Task JoinQueue(string userId)
        {
            // Logic to add to queue
            await Clients.Caller.SendAsync("QueueJoined");
        }
    }
}
