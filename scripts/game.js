export function createGame(screen) {
  const state = {
    players: {},
    fruits: {},
    screen: {
      width: screen.width,
      height: screen.height,
    },
  };

  function movePlayer({ playerId, keyPressed }) {
    const player = state.players[playerId];
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
  function addPlayer({ playerId, playerX, playerY }) {
    state.players[playerId] = {
      x: playerX,
      y: playerY,
    };
  }
  function removePlayer({ playerId }) {
    delete state.players[playerId];
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

  return {
    movePlayer,
    addPlayer,
    removePlayer,
    addFruit,
    removeFruit,
    state,
  };
}
