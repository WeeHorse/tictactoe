using Npgsql;
using TicTacToe.Records;

namespace TicTacToe;

public class TicTacToeGame
{
    // initialize database
    Database database = new();
    private NpgsqlDataSource db;
    
    // Routes are defined and registered for listening for network requests
    // in the constructor below
    // and then in turn processed by methods as called from the routes definitions 
    public TicTacToeGame (WebApplication app)
    {
        // Get database connection
        db = database.Connection();
        
        // Map incomming request for current game data
        app.MapGet("/api/current-game/{id}", GetCurrentGame);
    }

    async Task<Game>? GetCurrentGame(int id)
    {
        await using var cmd = db.CreateCommand("SELECT * FROM games WHERE id = $1");
        cmd.Parameters.AddWithValue(id);
        await using (var reader = await cmd.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                return new Game(reader.GetInt32(0),reader.GetInt32(1),reader.GetInt32(2),reader.GetString(3));
            }
        }
        return null;
    }

    
}