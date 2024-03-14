export function renderScreen({
  game,
  screen,
  requestAnimationFrame,
  currentPlayerId,
}) {
  const SIZE = 1;
  const context = screen.getContext("2d");
  context.clearRect(0, 0, screen.width, screen.height);
  for (const playerId in game.state.players) {
    const player = game.state.players[playerId];
    context.fillStyle = currentPlayerId === playerId ? "yellow" : "black";
    context.fillRect(player.x, player.y, SIZE, SIZE);
  }
  for (const fruitId in game.state.fruits) {
    const fruit = game.state.fruits[fruitId];
    context.fillStyle = "green";
    context.fillRect(fruit.x, fruit.y, SIZE, SIZE);
  }
  for (const poisonId in game.state.poisons) {
    const poison = game.state.poisons[poisonId];
    context.fillStyle = "red";
    context.fillRect(poison.x, poison.y, SIZE, SIZE);
  }
  requestAnimationFrame(() =>
    renderScreen({ screen, game, requestAnimationFrame, currentPlayerId })
  );
}
