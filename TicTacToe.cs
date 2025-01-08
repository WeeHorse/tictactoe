using TicTacToe.Records;

namespace TicTacToe;

public class TicTacToeGame
{
    // Routes are defined and registered for listening for network requests
    // in the constructor below
    // and then in turn processed by methods as called from the routes definitions 
    public TicTacToeGame (WebApplication app)
    {
        // Map incomming request for current game data
        app.MapGet("/api/current-game/{id}", GetCurrentGame);
    }

    Game GetCurrentGame(int id)
    {
        return new Game(1);
    }

    
}