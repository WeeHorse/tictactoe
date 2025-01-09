let player = null;
let game = null;

function refresh(){ // a sequence to handle reflecting the current game state for any connected user
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

// first refresh when page has loaded. 
// Then call refesh whenever something has changed, to ensure that both connected players clients reflect the current state
refresh()

function showPlayableTiles(){
  // who playable tiles if player is current player, 
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
  $('#message').text(player.name + ' lades till i spelet')
  refresh()
}

$('#add-game').on('submit', addGame) // onsubmit for the addGame form

async function addGame(e) {
  e.preventDefault()
  const gamecode = $('#add-game>[name="gamecode"]').val()
  const response = await fetch('/api/current-game/' + gamecode)
  game = await response.json();
  if(game){
    $('#message').text('Connected to ' + game.gamecode)
  }else{
    $('#message').text('Hittade inget spel med koden ' + gamecode)
  }
  refresh()
}

$('#tictactoe>input').on('click', playTile);
async function playTile() {
  let tileIndex = $(this).index();
  $(this).val('X') // players[0].tile  X or O
  /*const response = await fetch('/play-tile/', { // post (save new move)
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      player: players[0].id,
      tile: tileIndex,
      game: game
    })
  });*/
  // const data = await response.json();
  // await checkWin(players[0], game);
}
