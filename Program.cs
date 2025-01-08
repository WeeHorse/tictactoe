using System.Security.Cryptography;
using TicTacToe;

var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

// Serve static files from wwwroot
app.UseDefaultFiles(); // Serving index.html as the default file
app.UseStaticFiles(); // Serves other static files like CSS, JS, images, etc.


// Routes are defined and registered for listening for network requests
// in the constructors of the initalized classed below
// and then in turn processed by methods as called from the routes definitions 
TicTacToeGame ticTacToeGame = new(app);


// start the web application
app.Run();