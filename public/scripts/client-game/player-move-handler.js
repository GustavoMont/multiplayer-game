const gameControl = document.querySelector("#game-control");

export function onResizeScreen({ body, socket, listeners = [], game }) {
  const ids = ["move-player", "emit-move-player"];
  ids.forEach((id) => {
    listeners.forEach((listener) => listener.unsubscribe(id));
  });
  const [gameControlListener, keyboardListener] = listeners;

  gameControl.style.display = body.clientWidth > 769 ? "none" : "flex";

  const gameControlDisplay = gameControl.style.display;
  const hasControlButton = gameControlDisplay !== "none";
  const moveListener = hasControlButton
    ? gameControlListener
    : keyboardListener;
  subscribeMoveListener({ socket, moveListener, game });
}

function subscribeMoveListener({ socket, moveListener, game }) {
  const playerId = socket.id;
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
