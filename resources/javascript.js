(function () {
  window.ttt = {
    turn: 'X', // player's turn X||O
    turnNum: 0, // turn number
    mode: null, // game mode cpu||multi
    
    // keeps track of wins for the current session
    wins: {
      X: 0,
      O: 0,
      Draw : 0
    },


    // conditions for winnin'
    outcomes: {
      // horizontal
      'outcome 1' : [0, 1, 2],
      'outcome 2' : [3, 4, 5],
      'outcome 3' : [6, 7, 8],

      // vertical
      'outcome 4' : [0, 3, 6],
      'outcome 5' : [1, 4, 7],
      'outcome 6' : [2, 5, 8],

      // diagonal
      'outcome 7' : [0, 4, 8],
      'outcome 8' : [2, 4, 6]
    },


    // menus
    menu: {
      main : document.getElementById('menu-main'),
      mode : document.getElementById('menu-mode'),
      help : document.getElementById('menu-help'),
      about : document.getElementById('menu-about'),
      game : document.getElementById('menu-game')
    },


    // show the specified menu and hide the rest
    showMenu : function (id) {
      var i;
      for (i in ttt.menu) {
        ttt.menu[i].style.display = id == i ? '' : 'none';
      }
    },


    // starts the game
    startGame : function (mode, type) {
      var board = document.getElementById('game-board'),
          title = document.getElementById('game-title'),
          turn = document.getElementById('game-turn'),
          squareId = 9,
          rowId = 0,
          rowItems = 0,
          html = '',
          i;

      // hide/show specific options
      document.getElementById('start-game').style.display = 'none';
      document.getElementById('game-replay').style.display = 'none';
      document.getElementById('continue-game').style.display = '';
      document.getElementById('quit-game').style.display = '';

      // generate the game board
      while (squareId --> 0) {
        html += (rowItems++ == 0 ? '<div id="row' + rowId + '" class="row">' : '') + '<div id="s' + squareId + '" class="square" onclick="ttt.mark(this);"></div>' + (rowItems == 3 ? '</div>' : '');

        if (rowItems == 3) {
          rowItems = 0;
          rowId++;
        }
      }
      board.innerHTML = html;
      board.className = (mode == 'cpu' ? 'single' : 'multi') + '-player turn-x';

      // setup the turn data
      ttt.turn = 'X';
      ttt.turnNum = 0;
      turn.innerHTML = '<span class="mark-x">X</span>\'s turn';

      // setup initial new game specific data (only reapplied when quitting)
      if (type == 'new') {
        ttt.mode = mode;
        ttt.wins = {
          X : 0,
          O : 0,
          Draw : 0
        };

        title.innerHTML = 'Tic-Tac-Toe - ' + (mode == 'cpu' ? 'Single' : 'Two') + ' Player';
      }

      // setup the score counters
      for (i in ttt.wins) {
        document.getElementById('score-' + i.toLowerCase()).innerHTML = '<span class="mark-' + i.toLowerCase() + '">' + i + '</span>: ' + ttt.wins[i];
      }

      // show the game
      ttt.showMenu('game');
    },


    // quit the current game
    quitGame : function () {
      if (confirm('Are you sure you want to quit your current game? Your progress will be lost.')) {
        document.getElementById('start-game').style.display = '';
        document.getElementById('continue-game').style.display = 'none';
        document.getElementById('quit-game').style.display = 'none';
      };
    },


    // marks a square as X or O
    mark : function (square) {
      var board = document.getElementById('game-board'), 
          turn = document.getElementById('game-turn'),
          game;

      // marks the square and removes the ability to mark it
      square.onclick = null;
      square.className += ' marked';
      square.innerHTML = '<span class="mark-' + ttt.turn.toLowerCase() + '">' + ttt.turn + '</span>';

      // increment turn number and check game state
      ttt.turnNum++
      game = ttt.checkStatus();


      // if turns exceed the limit (9) or there's a winner, the game ends
      if (game.state == 'over') {
        turn.innerHTML = game.winner == 'Draw' ? 'DRAW!' : '<span class="mark-' + game.winner.toLowerCase() + '">' + game.winner + '</span> WINS!';
        board.className += ' game-over';

        // show the replay button
        document.getElementById('game-replay').style.display = '';

        // increment the score counters
        var score = document.getElementById('score-' + game.winner.toLowerCase());
        score.innerHTML = score.innerHTML.replace(/\d+/, ++ttt.wins[game.winner]);

      // continue the game by changing the turn
      } else {
        ttt.turn = ttt.turn == 'X' ? 'O' : 'X';
        turn.innerHTML = '<span class="mark-' + ttt.turn.toLowerCase() + '">' + ttt.turn + '</span>\'s turn';
        board.className = board.className.replace(/turn-(?:x|o)/, 'turn-' + ttt.turn.toLowerCase());

        // if playing single player, the computer will take a turn
        if (ttt.mode == 'cpu' && ttt.turn == 'O') {
          window.setTimeout(ttt.cpuCalculate, 500); // add a small delay to make it LOOK like the computer is thinking
        }
      }
    },
    
    
    // checks the state of the game; is there a winner? did enough turns pass?
    checkStatus : function () {
      var i, j, k, square, winner, X, O;

      for (k in ttt.outcomes) {
        for (i = 0, j = ttt.outcomes[k].length, X = 0, O = 0; i < j; i++) {
          square = document.getElementById('s' + ttt.outcomes[k][i]);

          // if X or O own a square, increment their score
          if (/X/.test(square.innerHTML)) {
            X++;
          }

          if (/O/.test(square.innerHTML)) {
            O++;
          }
        }
        
        // if X or O get three in a row, they win 
        if (X == 3) {
          winner = 'X';
          break;
        }

        if (O == 3) {
          winner = 'O';
          break;
        }
      }

      // if someone won or the turns are maxed, the winner is presented
      if (ttt.turnNum == 9 || winner) {
        return {
          winner : winner || 'Draw',
          state : 'over'
        };

      // if no winners or the game is ongoing, send that status back
      } else {
        return {
          state : 'ongoing'
        };
      }
    },


    // logic that helps the CPU calcuate it's next move
    cpuCalculate : function () {
      var outcomes = {
        'outcome 1' : [0, 0, 0],
        'outcome 2' : [0, 0, 0],
        'outcome 3' : [0, 0, 0],
        'outcome 4' : [0, 0, 0],
        'outcome 5' : [0, 0, 0],
        'outcome 6' : [0, 0, 0],
        'outcome 7' : [0, 0, 0],
        'outcome 8' : [0, 0, 0]
      },
      i, j, k, squares, hit;


      // checks the current state of the board
      for (k in ttt.outcomes) {
        for (i = 0, j = ttt.outcomes[k].length; i < j; i++) {
          square = document.getElementById('s' + ttt.outcomes[k][i]);

          // finds where X and O populate the board 
          if (/X/.test(square.innerHTML)) {
            outcomes[k][0]++
            outcomes[k][2]++
          }

          if (/O/.test(square.innerHTML)) {
            outcomes[k][1]++
            outcomes[k][2]++
          }
        }

        // goes for the win or blocks the player's win
        if ((outcomes[k][1] == 2 || outcomes[k][0] == 2) && outcomes[k][2] < 3) {
          ttt.cpuMark(k);
          hit = true;
          break;
        }
      }

      // if a win or loss is not in sight, randomly mark a square
      if (!hit) {
        ttt.cpuMark('random');
      }
    },


    // CPU chooses what square to mark
    cpuMark : function (outcome) {
      // randomly marks an open square
      if (outcome == 'random') {
        var squares = document.querySelectorAll('.square:not(.marked)');
        ttt.mark(squares[Math.floor(Math.random() * squares.length)]);

      // goes in for the win or blocks the player's win
      } else {
        for (var i = 0, j = ttt.outcomes[outcome].length, square; i < j; i++) {
          square = document.getElementById('s' + ttt.outcomes[outcome][i]);

          if (!/marked/.test(square.className)) {
            ttt.mark(square);
            break;
          }
        }
      }
    }
  };
}());