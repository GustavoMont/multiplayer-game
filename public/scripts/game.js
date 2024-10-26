const generatePosition = (max = 9) => Math.floor(Math.random() * max);

export function createGame(screen) {
  const state = {
    players: {},
    fruits: {},
    poisons: {},
    screen: {
      width: screen.width,
      height: screen.height,
    },
    isRunning: false,
  };
  const observers = [];
  const poisonTimers = {};
  let spawnTimers = [];
  function subscribe({ id, callback }) {
    observers.push({ id, callback });
  }

  function notifyAll(command) {
    for (const { callback } of observers) {
      callback(command);
    }
  }

  function addPoison({
    poisonId,
    poisonX = generatePosition(screen.width),
    poisonY = generatePosition(screen.height),
  }) {
    state.poisons[poisonId] = {
      x: poisonX,
      y: poisonY,
    };
    setTimeout(() => removePoison({ poisonId }), 4000);
    notifyAll({ type: "add-poison", poisonId, poisonX, poisonY });
  }
  function removePoison({ poisonId }) {
    delete state.poisons[poisonId];
    notifyAll({ type: "remove-poison", poisonId });
  }

  function movePlayer({ type, playerId, playerMove }) {
    const player = state.players[playerId] ?? {};
    notifyAll({ type, playerId, playerMove });
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
      ArrowDown: player.isPoisoned ? onMoveUp : onMoveDown,
      ArrowUp: player.isPoisoned ? onMoveDown : onMoveUp,
      ArrowLeft: player.isPoisoned ? onMoveRight : onMoveLeft,
      ArrowRight: player.isPoisoned ? onMoveLeft : onMoveRight,
    };

    const onMove = moveset[playerMove];
    if (onMove && player) {
      onMove(player);
      checkFruitCollision(playerId);
      checkPoisonCollision(playerId);
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
      point: 0,
      isPoisoned: false,
    };
    notifyAll({ type: "add-player", playerId, playerX, playerY });
  }
  function removePlayer({ playerId }) {
    delete state.players[playerId];
    notifyAll({ type: "remove-player", playerId });
  }
  function addFruit({
    fruitId,
    fruitX = generatePosition(screen.width),
    fruitY = generatePosition(screen.width),
  }) {
    state.fruits[fruitId] = {
      x: fruitX,
      y: fruitY,
    };
    notifyAll({ type: "add-fruit", fruitX, fruitY, fruitId });
  }
  function removeFruit({ fruitId }) {
    delete state.fruits[fruitId];
    notifyAll({ type: "remove-fruit" });
  }
  function incrementPlayerPoint({ playerId }) {
    const player = state.players[playerId];
    if (player) {
      player.point++;
    }
    notifyAll({ type: "increment-player-point", playerId });
  }
  function checkFruitCollision(playerId) {
    const player = state.players[playerId];
    for (const fruitId in state.fruits) {
      const fruit = state.fruits[fruitId];
      if (fruit.x === player.x && fruit.y === player.y) {
        removeFruit({ fruitId });
        incrementPlayerPoint({ playerId });
      }
    }
  }
  function unPoisonPlayer({ playerId }) {
    const player = state.players[playerId];
    if (player) {
      player.isPoisoned = false;
      notifyAll({ type: "unpoison-player", playerId });
    }
  }
  function poisonPlayer({ playerId }) {
    const player = state.players[playerId];
    if (player.isPoisoned) {
      const timer = poisonTimers[playerId];
      clearTimeout(timer);
    }
    player.isPoisoned = true;
    poisonTimers[playerId] = setTimeout(
      () => unPoisonPlayer({ playerId }),
      7000,
    );
    notifyAll({ type: "poison-player", playerId });
  }
  function checkPoisonCollision(playerId) {
    const player = state.players[playerId];
    for (const poisonId in state.poisons) {
      const poison = state.poisons[poisonId];
      if (poison.x === player.x && poison.y === player.y) {
        removePoison({ poisonId });
        poisonPlayer({ playerId });
      }
    }
  }
  function getPlayersCount() {
    return Object.keys(state.players).length;
  }
  function start() {
    const frequency = 5000;
    state.isRunning = true;
    const timer = setInterval(() => {
      addFruit({
        fruitId: Math.random().toString(),
      });
      addPoison({ poisonId: Math.random().toString() });
    }, frequency);
    spawnTimers.push(timer);
  }
  function end() {
    spawnTimers.forEach((timer) => clearInterval(timer));
    spawnTimers = [];
    state.fruits = {};
    state.poisons = {};
    state.isRunning = false;
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
    start,
    addPoison,
    removePoison,
    poisonPlayer,
    unPoisonPlayer,
    end,
    getPlayersCount,
    state,
  };
}
