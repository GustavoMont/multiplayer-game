import express from "express";
import http from "http";
import { createGame } from "./public/scripts/game.js";
import { Server } from "socket.io";
import { resolve } from "path";

const log = (...message) => console.log(">", ...message);

const game = subscribeGame(createGame({ width: 10, height: 10 }));
const app = express();
const server = http.createServer(app);

const io = new Server(server);

const PORT = 3000;

const GAME_ROOMS = {
  topen: subscribeGame(createGame({ width: 10, height: 10 }), "topen"),
};

function subscribeGame(game, roomId) {
  function notifyCallback(command) {
    if (roomId) {
      return io.to(roomId).emit(command.type, command);
    }
    io.except(Object.keys(GAME_ROOMS)).emit(command.type, command);
  }
  game.subscribe({ id: "game-state", callback: notifyCallback });
  return game;
}

function getGame(roomId) {
  if (roomId) {
    return GAME_ROOMS[roomId];
  }
  return game;
}

io.on("connection", (socket) => {
  const playerId = socket.id;
  let roomId;
  log(`Player connect in server with id: ${playerId}`);

  function getSocketGame() {
    const game = getGame(roomId);
    if (!game) {
      return {};
    }
    return game;
  }

  socket.on("start-game", () => {
    const game = getSocketGame();
    if (!game.state.isRunning) {
      game.start();
    }
    game.addPlayer({ playerId });
    socket.emit("setup", game.state);
  });

  socket.on("move-player", (command) => {
    const game = getSocketGame();
    game.movePlayer(command);
  });

  socket.on("disconnect", () => {
    const game = getSocketGame();
    log(`Player ${playerId} saiu`);
    game.removePlayer({ playerId });
    if (game.getPlayersCount() === 0) {
      game.end();
    }
  });

  socket.on("enter_room", ({ roomId: room }) => {
    const game = GAME_ROOMS[room];
    if (!game) {
      socket.disconnect(true);
    }
    socket.join(room);
    roomId = room;
  });
});

app.use(express.static(resolve("public")));

app.get("/room/:uuid", (req, res) => {
  return res.sendFile(resolve(".", "public", "index.html"));
});

server.listen(PORT, () => log(`Server running in PORT: ${PORT}`));
