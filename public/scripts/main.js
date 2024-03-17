import { createKeyboardListener } from "./keyboard-listener.js";
import { createGameControlListener } from "./game-control-listener.js";
import { createGame } from "./game.js";
import { renderScreen } from "./render-screen.js";
import { onGameChange } from "./client-game/game-state-display.js";
import { onResizeScreen } from "./client-game/player-move-handler.js";

const screen = document.querySelector("canvas#screen");
const socket = io();
const game = createGame(screen);
const keyboardListener = createKeyboardListener(document);
const gameControlListener = createGameControlListener(document);

const moveListeners = [gameControlListener, keyboardListener];

const gameInfo = document.querySelector("#game-info");

socket.on("connect", () => {
  const currentPlayerId = socket.id;

  game.subscribe({
    id: "watch-game",
    callback: () =>
      onGameChange({ currentPlayerId, gameInfo, gameState: game.state }),
  });
  const resizeObserver = new ResizeObserver(([entry]) =>
    onResizeScreen({
      body: entry.target,
      game,
      socket,
      listeners: moveListeners,
    })
  );
  resizeObserver.observe(document.body);
});

socket.on("setup", (state) => {
  const playerId = socket.id;
  game.setState(state);

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
  moveListeners.forEach((listener) => listener.unsubscribeAll());
});
