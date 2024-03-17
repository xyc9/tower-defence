import React from "react";

const GameBoard = ({
                       towerAttackRange,
                       gameStarted,
                       gameEnded,
                       sortedEnemies,
                       deadEnemies,
                       resultMessage,
                       newTowerRange,
                       validDataFormat,
                       startGame,
                       parseEnemiesAndTowerRange,
                   }) => {
    return (
        <>
            <div className="game_start-bar">
                <textarea
                    placeholder="Enter tower range and enemies data here..."
                    onChange={(e) => parseEnemiesAndTowerRange(e.target.value)}
                />
                <button onClick={startGame}>
                    {gameStarted ? "Game Started" : "Start Game"}
                </button>

                {!validDataFormat && <p>{resultMessage}</p>}
                {newTowerRange && (
                    newTowerRange === towerAttackRange ? (
                        <p>you can't win due to your input data</p>
                    ) : (
                        <p>To win, you need to set the tower range to {newTowerRange} or more.</p>
                    )
                )}
                {gameStarted && (
                    <div>
                        <h2>Sorted Enemies:</h2>
                        <ul>
                            {sortedEnemies.map(enemy => (
                                <li key={enemy.name}>
                                    {enemy.name} - Current Distance: {enemy.currentDistance}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {gameEnded && (
                    <b>{resultMessage}</b>
                )}
                {deadEnemies.length > 0 && (
                    <div>
                        <h3>Dead Enemies:</h3>
                        <ul>
                            {deadEnemies.map(deadEnemy => (
                                <li key={`${deadEnemy.name}-${deadEnemy.turn}`}>
                                    Enemy {deadEnemy.name} died on turn {deadEnemy.turn}, at distance {deadEnemy.distance}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
};

export default GameBoard;
