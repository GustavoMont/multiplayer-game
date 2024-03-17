export function createKeyboardListener(document) {
  const state = {
    observers: [],
  };

  const handleKeyPress = (e) => {
    const playerId = state.playerId;
    const playerMove = e.key;

    notifyAll({ type: "move-player", playerId, playerMove });
  };
  document.addEventListener("keydown", handleKeyPress);

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
