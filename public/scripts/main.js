import { createKeyboardListener } from "./keyboard-listener.js";
import { createGame } from "./game.js";
import { renderScreen } from "./render-screen.js";
const screen = document.querySelector("canvas#screen");
const socket = io();
const game = createGame(screen);
const keyboardListener = createKeyboardListener(document);
const gameInfo = document.querySelector("#game-info");

socket.on("connect", () => {
  const currentPlayerId = socket.id;
  console.log(`Player connect in client with id: ${currentPlayerId}`);

  game.subscribe({
    id: "watch-game",
    callback: () => {
      let number = 0;
      gameInfo.innerHTML = "";
      for (const playerId in game.state.players) {
        number++;
        const player = game.state.players[playerId];
        const points = player.point;
        const p = document.createElement("p");
        const isCurrentPlayer = currentPlayerId === playerId;
        p.style.color = isCurrentPlayer ? "green" : "gray";
        p.style.fontWeight = isCurrentPlayer ? "bold" : "light";
        p.innerText += `${number}. ${playerId}: ${points}`;
        gameInfo.appendChild(p);
      }
    },
  });
});
socket.on("setup", (state) => {
  const playerId = socket.id;
  game.setState(state);
  keyboardListener.setPlayer(playerId);
  keyboardListener.subscribe({
    id: "move-player",
    callback: game.movePlayer,
  });
  keyboardListener.subscribe({
    id: "emit-move-player",
    callback: ({ playerId, keyPressed, type }) => {
      socket.emit("move-player", { type, playerId, keyPressed });
    },
  });

  renderScreen({
    game,
    screen,
    currentPlayerId: playerId,
    requestAnimationFrame,
  });
});
socket.on("add-player", ({ playerId, playerX, playerY }) => {
  game.addPlayer({ playerId, playerX, playerY });
});
socket.on("remove-player", ({ playerId }) => {
  game.removePlayer({ playerId });
});
socket.on("move-player", (command) => {
  const playerId = socket.id;
  if (command.playerId !== playerId) {
    game.movePlayer(command);
  }
});
socket.on("remove-fruit", ({ fruitId }) => {
  game.removeFruit({ fruitId });
});
socket.on("add-fruit", ({ fruitId, fruitY, fruitX }) => {
  game.addFruit({ fruitId, fruitY, fruitX });
});
socket.on("remove-poison", ({ poisonId }) => {
  game.removePoison({ poisonId });
});
socket.on("add-poison", ({ poisonId, poisonY, poisonX }) => {
  game.addPoison({ poisonId, poisonY, poisonX });
});
socket.on("poison-player", ({ playerId }) => {
  game.poisonPlayer({ playerId });
});
socket.on("unpoison-player", ({ playerId }) => {
  game.addPoison({ playerId });
});
socket.on("disconnect", ({}) => {
  keyboardListener.unsubscribe("move-player");
  keyboardListener.unsubscribe("emit-move-player");
});
