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
        app.MapGet("/api/current-game/{gamecode}", GetCurrentGame);
        
        // Map incomming request to add a player to a game
        app.MapPost("/api/add-player", async (HttpContext context) =>
        {
            // Player, is a record that defines the post requestBody format
            var requestBody = await context.Request.ReadFromJsonAsync<Player>();
            if (requestBody?.name is null)
            {
                return Results.BadRequest("name is required.");
            }
            var player = await AddPlayer(requestBody.name, context.Request.Cookies["ClientId"]);
            return player.id > 0 ? Results.Ok(player) : Results.StatusCode(500);
        });
    }

    async Task<Game>? GetCurrentGame(string gamecode)
    {
        await using var cmd = db.CreateCommand("SELECT * FROM games WHERE gamecode = $1");
        cmd.Parameters.AddWithValue(gamecode);
        await using (var reader = await cmd.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                return new Game(reader.GetInt32(0),reader.GetInt32(1),reader.GetInt32(2),reader.GetString(3));
            }
        }
        return null;
    }
    
    // Add player, by player name. If player by that name don't exist in the database, a new player with that name is created, 
    // otherwise the existing player is updated by the clientid, should it have changed.
    async Task<Player> AddPlayer(string name, string clientId)
    {
        // check if player already exists
        await using var cmd = db.CreateCommand("SELECT * FROM players WHERE name = $1"); // check if player exists
        cmd.Parameters.AddWithValue(name);
        await using (var reader = await cmd.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                var dbClientId = reader.GetString(1);
                if (clientId.Equals(dbClientId) == false)
                {
                    // if same name but different session, save new clientId to db
                    await using var cmd2 = db.CreateCommand("UPDATE players SET clientid = $1 WHERE id = $2");
                    cmd2.Parameters.AddWithValue(clientId);
                    cmd2.Parameters.AddWithValue(reader.GetInt32(0));
                    await cmd2.ExecuteNonQueryAsync(); // Perform update
                }
                return new Player(reader.GetInt32(0), reader.GetString(1), clientId);
            }
        }
        // if player did not exist we create a new player in the db
        await using var cmd3 = db.CreateCommand("INSERT INTO players (name, clientid) VALUES ($1, $2) RETURNING id");
        cmd3.Parameters.AddWithValue(name);
        cmd3.Parameters.AddWithValue(clientId);
        var result = await cmd3.ExecuteScalarAsync();
        if (result != null && int.TryParse(result.ToString(), out int lastInsertedId))
        {
            return new Player(lastInsertedId, name, clientId);
        }
        return null;
    }
    
    

    
}