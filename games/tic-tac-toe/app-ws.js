$(function() {
  var APP = {
    game_choices: ["0,0", "0,1", "0,2", "1,0", "1,1", "1,2", "2,0", "2,1", "2,2"],
    player_a: [],
    player_b: [],
    game_started: false,
    game_result: '',
    ws: null,  // Will contain websocket connection
    ws_url: 'ws://' + 'localhost:8888' + '/tic-tac-toe/',

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

    initialize_socket: function(ws_url, player_handle, onmessage_cb, onerror_cb, onopen_cb, onclose_cb) {

      var ws = new WebSocket(ws_url + player_handle);

      ws.onmessage = function(message) {
        onmessage_cb(message);
      };

      ws.onerror = function(message) {
        onerror_cb(message);
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
      message = JSON.stringify(data);
      APP.ws.send(message);
    },

    parse_msg_data: function(data) {
      data = JSON.parse(data);
      console.log('WS Msg: ', data.text);
      return data;
    },

    recvd_msg: function(data) {
      message = JSON.stringify(data);
      APP.ws.send(message);
    },

    ws_open: function(data) {
      message = JSON.stringify(data);
      APP.ws.send(message);
    },

    ws_close: function() {
      APP.ws.close();
    }
  };

  APP.reset_board();
  var player_handle = $('.player-handle').value
  console.log(player_handle);
  APP.ws = APP.initialize_socket(APP.ws_url, player_handle, APP.recvd_msg, APP.ws_error, APP.ws_open, APP.ws_close);

  // On Play Gain, reset the game
  $("button.action").on("click", function(event) {
    event.preventDefault();
    var button = $(this);
    if (APP.game_started) {
      // terminate the game
    } else {
      // start the game
      APP.start_game();
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