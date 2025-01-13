let player = null;
let game = null;
let playedTiles = []; 

// refresh is a sequence to handle reflecting the current game state for any connected user
async function refresh(){
  // make sure you have a player
  if(!player){
    $('#add-player').show()
  }else{
    $('#add-player').hide()
    // make sure you are joined to a game
    if(!game) {
      $('#add-game').show()
    }else{
      $('#add-game').hide()
    }
  }
  // until we have a game
  if(!player || !game){
    // disable tiles
    $('#tictactoe input').prop('disabled', true);
  }else{
    // poll refresh continously to reflect the game state for both connected players
    let timeout = setTimeout(async function(){
      // check tiles update
      const response = await fetch('/api/played-tiles/' + game.id);
      const playedTilesUpdate = await response.json();
      // only refresh the board if something has changed
      if(playedTilesUpdate != playedTiles){
        playedTiles = playedTilesUpdate
        // reflect played tiles
        showPlayableTiles(playedTiles)
        // tell who's turn
        tellTurn(playedTiles)
      }
      // check win
      if(await checkWin(game)){
        clearTimeout(timeout);
        return; // stop polling, game is over whoever won
      }
      await refresh()
    }, 300) // poll every 0.3 sec
  }
}

// first call refresh when page has loaded to reflect inital state / rebuild current state
refresh()


function showPlayableTiles(playedTiles){
  const playedTilesHash = {}
  for(let tile of playedTiles){
    playedTilesHash[tile.tile] = tile
  }
  // enable all, and then disable the ones already played
  $('#tictactoe input').prop('disabled', false);
  $('#tictactoe input').each(function(){
    let tile = playedTilesHash[$(this).index()];
    if(tile?.tile > -1){ // if this index exists in the hash
      $(this).prop('disabled', true);
      if(tile.player === player.id){
        $(this).val(player.tile)
      }else{
        $(this).val(player.tile === 'X'?'O':'X') // the other player gets whatever tile you don't have
      }
    }
  })
}

function tellTurn(playedTiles){
  let yourMoves = 0;
  let otherMoves = 0;
  for(let tile of playedTiles){
    if(tile.player === player.id){
      yourMoves++
    }else{
      otherMoves++
    }
  }
  // player with tile X plays first
  if(player.tile === 'X' && yourMoves <= otherMoves || player.tile === 'O' && yourMoves < otherMoves){
    $('#message').text('It is you turn, ' + player.name + ' to play a ' + player.tile)
  }else{
    $('#message').text('It is their turn')
    // if it's their turn we disable all tiles for us
    $('#tictactoe input').prop('disabled', true);
  }
}

async function checkWin() {
  const response = await fetch('/api/check-win/' + game.id);
  const win = await response.json();
  if(win){
    $('#message').text('Raden ' + win.join(' - ') + ' vann!')
    // disable tiles
    $('#tictactoe input').prop('disabled', true);
    // show winning row
    $('#tictactoe input').each(function() {
      if(win.includes($(this).index())){
        $(this).css('background-color', 'yellow')
      }
    })
    return true;
  }
  return false;
}


$('#add-player').on('submit', addPlayer) // onsubmit for the addPlayer form

async function addPlayer(e) {
  e.preventDefault()
  const playerName = $('#add-player>[name="name"]').val()
  const response = await fetch('/api/add-player/', { // post
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: playerName })
  });
  player = await response.json();
  $('#message').text(player.name + ' was added to the game')
  refresh()
}

$('#add-game').on('submit', addGame) // onsubmit for the addGame form

async function addGame(e) {
  e.preventDefault()
  const gamecode = $('#add-game>[name="gamecode"]').val()
  const response = await fetch('/api/current-game/' + gamecode)
  game = await response.json();
  player.tile = (player.id === game.player_1)?'X':'O'; // Are you player 1? Then you get X, else O.
  if(game){
    $('#message').text('Connected to ' + game.gamecode)
  }else{
    $('#message').text('Found no game with the code ' + gamecode)
  }
  refresh()
}

$('#tictactoe>input').on('click', playTile);
async function playTile() {
  let tileIndex = $(this).index();
  const response = await fetch('/api/play-tile/', { // post (save new move)
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tile: tileIndex,
      player: player.id,
      game: game.id
    })
  });
  const moveAccepted = await response.json();
  if(moveAccepted){
    $(this).val(player.tile) // player tile X or O is decided in addGame (player 1 is X, player 2 is O)
    $('#message').text('Move accepted, with ' + player.tile + ' at index ' + tileIndex)
  }else{
    $('#message').text('This tile is already taken')
  }
  refresh();
}
