const generatePosition = (max = 9) => Math.floor(Math.random() * max);

export function createGame(screen) {
  const state = {
    players: {},
    fruits: {},
    screen: {
      width: screen.width,
      height: screen.height,
    },
  };
  const observers = [];
  console.log(observers);
  function subscribe({ id, callback }) {
    observers.push({ id, callback });
  }

  function notifyAll(command) {
    for (const { callback } of observers) {
      callback(command);
    }
  }

  function movePlayer({ type, playerId, keyPressed }) {
    const player = state.players[playerId];
    notifyAll({ type, playerId, keyPressed });
    const onMoveDown = (player) => {
      if (player.y + 1 < 10) {
        player.y += 1;
      }
    };
    const onMoveUp = (player) => {
      if (player.y - 1 >= 0) {
        player.y -= 1;
      }
    };
    const onMoveLeft = (player) => {
      if (player.x - 1 >= 0) {
        player.x -= 1;
      }
    };
    const onMoveRight = (player) => {
      if (player.x + 1 < 10) {
        player.x += 1;
      }
    };
    const moveset = {
      ArrowDown: onMoveDown,
      ArrowUp: onMoveUp,
      ArrowLeft: onMoveLeft,
      ArrowRight: onMoveRight,
    };

    const onMove = moveset[keyPressed];
    if (onMove && player) {
      onMove(player);
      checkFruitCollision(playerId);
    }
  }
  function addPlayer({
    playerId,
    playerX = generatePosition(screen.width),
    playerY = generatePosition(screen.height),
  }) {
    state.players[playerId] = {
      x: playerX,
      y: playerY,
    };
    notifyAll({ type: "add-player", playerId, playerX, playerY });
  }
  function removePlayer({ playerId }) {
    delete state.players[playerId];
    notifyAll({ type: "remove-player", playerId });
  }
  function addFruit({ fruitId, fruitX, fruitY }) {
    state.fruits[fruitId] = {
      x: fruitX,
      y: fruitY,
    };
  }
  function removeFruit({ fruitId }) {
    delete state.fruits[fruitId];
  }
  function checkFruitCollision(playerId) {
    const player = state.players[playerId];
    for (const fruitId in state.fruits) {
      const fruit = state.fruits[fruitId];
      if (fruit.x === player.x && fruit.y === player.y) {
        removeFruit({ fruitId });
      }
    }
  }
  function setState(newState) {
    Object.assign(state, newState);
  }

  return {
    movePlayer,
    addPlayer,
    removePlayer,
    addFruit,
    removeFruit,
    setState,
    subscribe,
    state,
  };
}
