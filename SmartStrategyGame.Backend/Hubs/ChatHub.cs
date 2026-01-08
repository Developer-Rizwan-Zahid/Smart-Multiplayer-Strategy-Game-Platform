using Microsoft.AspNetCore.SignalR;

namespace SmartStrategyGame.Backend.Hubs
{
    public class ChatHub : Hub
    {
        public async Task JoinChat(string gameId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
        }

        public async Task LeaveChat(string gameId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, gameId);
        }

        public async Task SendMessage(string gameId, string user, string message)
        {
            await Clients.Group(gameId).SendAsync("ReceiveMessage", user, message);
        }
    }
}
