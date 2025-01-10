let player = null;
let game = null;
let players = [];

// refresh is a sequence to handle reflecting the current game state for any connected user
function refresh(){ 
  // checkWin here
  // await checkWin(game);
  // disable all game input until we know who may play
  $('#tictactoe input').prop('disabled', true);
  console.log(player, game)
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
      showPlayableTiles()
    }
  }
}

// first call refresh when page has loaded to reflect inital state / rebuild current state
// Then call refesh whenever something has changed, to ensure that both connected players clients reflect the current state
refresh()

function showPlayableTiles(){
  // show playable tiles if player is current player, 
  // @todo find out from game state 
  $('#tictactoe input').each(function(){
    //if($(this).val() == "") {
      $(this).prop('disabled', false);
    //}
  })
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
