$(function() {
  var APP = {
    game_choices: ["0,0", "0,1", "0,2", "1,0", "1,1", "1,2", "2,0", "2,1", "2,2"],
    player_handle: "",
    player_a: [],
    player_b: [],
    game_started: false,
    game_result: '',
    ws: null,  // Will contain websocket connection
    ws_url: 'ws://' + 'localhost:8001' + '/tic-tac-toe/',

    reset_board: function() {
      $("ul.row button").each( function() {
        var button = $(this)
        var content = button.find(".content");
        if (content) {
          // set the game matrix
          content.text('_');
          button.prop("disabled", false);
          button.on("click");
        }
      });
    },

    initialize_socket: function(ws_url, onmessage_cb, onerror_cb, onopen_cb, onclose_cb) {

      var ws = new WebSocket(ws_url);

      ws.onmessage = function(e) {
        data = JSON.parse(e.data);
        onmessage_cb(data);
      };

      ws.onerror = function(e) {
        data = JSON.parse(e.data);
        onerror_cb(data);
      };

      ws.onopen = function() {
        onopen_cb();
      };

      ws.onclose = function() {
        onclose_cb();
      };

      // Return the websocket connection
      return ws;
    },

    send_msg: function(data) {
      var message = JSON.stringify(data);
      APP.ws.send(message);
    },

    recvd_msg: function(data) {
      console.log(data);
      if (data.action == 'connect') {
        APP.player_handle = data.player_handle;
      } else if (data.action == 'player-move') {

      }
    },

    ws_open: function(data) {
      // var message = JSON.stringify(data);
      // APP.ws.send(message);
    },

    ws_close: function() {
      APP.ws.close();
    },

    ws_error: function(message) {
      console.log('WS Err: ', message);
    }
  };

  var initalize_game = function() {
    APP.reset_board();
    APP.ws = APP.initialize_socket(APP.ws_url, APP.recvd_msg, APP.ws_error, APP.ws_open, APP.ws_close);
  };

  // On open, connect to socket and reset board
  initalize_game();

  // On Play Gain, reset the game
  $("button.action").on("click", function(event) {
    event.preventDefault();
    var button = $(this);
    if (APP.game_started) {
      // terminate the game
    } else {
      // start the game
      // APP.start_game();
      var data = {
        'handle': APP.player_handle,
        'action': 'ready'
      }
      APP.send_msg(data);
    }
  });

  // When one of the button is pressed, send message to server
  $("ul.row button").on("click", function(event) {
    event.preventDefault();
    var button = $(this);
    var sel_item = button.val();
    APP.player_a.push(sel_item);
    APP.game_choices.splice(APP.game_choices.indexOf(sel_item), 1);
    var content = button.find(".content");
    if (content) {
      // set the game matrix
      content.text('X');
      button.prop("disabled", true);
      button.off("click");
      // Send message to Server

      // // Check game over
      // // Computer to Pick a slot
      // sel_item = app_toe.computer_slot();
      // if (sel_item) {
      //   app_toe.player_b.push(sel_item);
      //   app_toe.game_choices.splice(app_toe.game_choices.indexOf(sel_item), 1);
      //   button = $('button[value="'+sel_item+'"]');
      //   if (button) {
      //     content = button.find(".content");
      //     content.text('O');
      //     button.prop("disabled", true);
      //     // button.off("click");
      //   }
    }
  });
});