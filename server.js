import express from "express";
import http from "http";
import { createGame } from "./public/scripts/game.js";
import { Server } from "socket.io";

const log = (...message) => console.log(">", ...message);

const game = createGame({ width: 10, height: 10 });
const app = express();
const server = http.createServer(app);

const io = new Server(server);

const PORT = 3000;

game.subscribe({
  id: "game-state",
  callback(command) {
    io.emit(command.type, command);
  },
});

io.on("connection", (socket) => {
  const playerId = socket.id;
  log(`Player connect in server with id: ${playerId}`);
  if (!game.state.isRunning) {
    game.start();
  }

  game.addPlayer({ playerId });

  socket.emit("setup", game.state);
  socket.on("move-player", (command) => {
    game.movePlayer(command);
  });
  socket.on("disconnect", () => {
    log(`Player ${playerId} saiu`);
    game.removePlayer({ playerId });

    if (game.getPlayersCount() === 0) {
      game.end();
    }
  });
});

app.use(express.static("public"));

server.listen(PORT, () => log(`Server running in PORT: ${PORT}`));
