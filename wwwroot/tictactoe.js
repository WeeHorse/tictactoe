let player = null;
let game = null;

function refresh(){ // a sequence to handle reflecting the current game state for any connected user
  // disable all game input until we know who may play
  $('#tictactoe input').prop('disabled', true);
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
}

// first refresh when page has loaded. 
// Then call refesh whenever something has changed, to ensure that both connected players clients reflect the current state
refresh()

$('#add-player').on('submit', addPlayer) // onsubmit for the addPlayer form

async function addPlayer(e) {
  e.preventDefault()
  player = {id:1}
  refresh()
}

$('#add-game').on('submit', addGame) // onsubmit for the addGame form

async function addGame(e) {
  e.preventDefault()
  const response = await fetch('/api/current-game/1')
  game = await response.json();
  refresh()
}

