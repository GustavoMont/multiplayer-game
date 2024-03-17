export function createGameControlListener(document) {
  const state = {
    observers: [],
  };
  const buttons = document.querySelectorAll("#game-control button");
  const [leftButton, upButton, downButton, rightButton] = buttons;

  function handleClickButton(playerMove) {
    const playerId = state.playerId;
    notifyAll({ type: "move-player", playerId, playerMove });
  }

  upButton.addEventListener("click", () => handleClickButton("ArrowUp"));
  leftButton.addEventListener("click", () => handleClickButton("ArrowLeft"));
  rightButton.addEventListener("click", () => handleClickButton("ArrowRight"));
  downButton.addEventListener("click", () => handleClickButton("ArrowDown"));

  function subscribe({ id, callback }) {
    state.observers.push({ id, callback });
  }
  function unsubscribe(observerId) {
    const observers = state.observers.filter(({ id }) => id !== observerId);
    state.observers = observers;
  }
  function notifyAll(command) {
    for (const { callback } of state.observers) {
      callback(command);
    }
  }
  function setPlayer(playerId) {
    state.playerId = playerId;
  }

  return {
    subscribe,
    unsubscribe,
    setPlayer,
  };
}
