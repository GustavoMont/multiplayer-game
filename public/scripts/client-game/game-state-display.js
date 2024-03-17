export function onGameChange({ currentPlayerId, gameInfo, gameState }) {
  let number = 0;
  gameInfo.innerHTML = "";
  for (const playerId in gameState.players) {
    number++;
    const player = gameState.players[playerId];
    const points = player.point;
    const p = document.createElement("p");
    const isCurrentPlayer = currentPlayerId === playerId;
    p.style.color = isCurrentPlayer ? "green" : "gray";
    p.style.fontWeight = isCurrentPlayer ? "bold" : "light";
    p.innerText += `${number}. ${playerId}: ${points}`;
    gameInfo.appendChild(p);
  }
}
