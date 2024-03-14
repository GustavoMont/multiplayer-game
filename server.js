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

log(game.state);
game.subscribe({
  id: "game-state",
  callback(command) {
    log(`Emmiting ${command.type}`);
    io.emit(command.type, command);
  },
});

game.addFruit({ fruitId: "fruta", fruitX: 5, fruitY: 5 });

io.on("connection", (socket) => {
  const playerId = socket.id;
  log(`Player connect in server with id: ${playerId}`);
  game.addPlayer({ playerId });

  socket.emit("setup", game.state);
  socket.on("move-player", (command) => {
    game.movePlayer(command);
  });
  socket.on("disconnect", () => {
    log(`Player ${playerId} saiu`);
    game.removePlayer({ playerId });
  });
});

app.use(express.static("public"));

server.listen(PORT, () => log(`Server running in PORT: ${PORT}`));
