import { createKeyboardListener } from "./keyboard-listener.js";
import { createGameControlListener } from "./game-control-listener.js";
import { createGame } from "./game.js";
import { renderScreen } from "./render-screen.js";
const screen = document.querySelector("canvas#screen");
// eslint-disable-next-line no-undef
const socket = io();
const game = createGame(screen);
const keyboardListener = createKeyboardListener(document);
const gameControlListener = createGameControlListener(document);
const gameControl = document.querySelector("#game-control");

const gameInfo = document.querySelector("#game-info");

function onGameChange({ currentPlayerId, gameInfo }) {
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
}

socket.on("connect", () => {
  const currentPlayerId = socket.id;

  game.subscribe({
    id: "watch-game",
    callback: () => onGameChange({ currentPlayerId, gameInfo }),
  });
  const resizeObserver = new ResizeObserver(([entry]) =>
    onResizeScreen({
      body: entry.target,
      gameControl,
      playerId: currentPlayerId,
    }),
  );
  resizeObserver.observe(document.body);
});

function subscribeMoveListener({ playerId = "", moveListener }) {
  moveListener.setPlayer(playerId);
  moveListener.subscribe({
    id: "move-player",
    callback: game.movePlayer,
  });
  moveListener.subscribe({
    id: "emit-move-player",
    callback: ({ playerId, playerMove, type }) => {
      socket.emit("move-player", { type, playerId, playerMove });
    },
  });
}

function onResizeScreen({ body, gameControl, playerId }) {
  const ids = ["move-player", "emit-move-player"];
  ids.forEach((id) => {
    keyboardListener.unsubscribe(id);
    gameControlListener.unsubscribe(id);
  });

  gameControl.style.display = body.clientWidth > 769 ? "none" : "flex";

  const gameControlDisplay = gameControl.style.display;
  const hasControlButton = gameControlDisplay !== "none";
  const moveListener = hasControlButton
    ? gameControlListener
    : keyboardListener;
  subscribeMoveListener({ playerId, moveListener });
}

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
socket.on("disconnect", () => {
  keyboardListener.unsubscribe("move-player");
  keyboardListener.unsubscribe("emit-move-player");
});
