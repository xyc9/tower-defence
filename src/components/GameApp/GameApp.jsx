import React, { useState, useEffect } from "react";
import GameBoard from "./GameBoard";


const GameApp = () => {
    const [defaultEnemies, setDefaultEnemies] = useState([])
    const [towerAttackRange, setTowerAttackRange] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);
    const [turns, setTurns] = useState(1);
    const [totalEnemies, setTotalEnemies] = useState(defaultEnemies.length);
    const [enemies, setEnemies] = useState(defaultEnemies);
    const [sortedEnemies, setSortedEnemies] = useState(enemies);
    const [deadEnemies, setDeadEnemies] = useState([]);
    const [resultMessage, setResultMessage] = useState("");
    const [newTowerRange, setNewTowerRange] = useState(null);
    const [validDataFormat, setValidDataFormat] = useState(true);

    const startGame = () => {
        const errorMessages = parseEnemiesAndTowerRange();
        if (errorMessages.length > 0) {
            alert(errorMessages.join("\n"));
            return;
        }

        setGameStarted(true);
        setGameEnded(false);
        setTurns(1);
        setTotalEnemies(defaultEnemies.length);
        setEnemies(defaultEnemies);
        setSortedEnemies(defaultEnemies);
        setDeadEnemies([]);
        setResultMessage("");
        setNewTowerRange(null);
    };
    const parseEnemiesAndTowerRange = () => {
        const text = document.querySelector("textarea").value;
        const lines = text.split("\n");
        const minLines = 2;
        const errors = [];

        if (lines.length < minLines) {
            errors.push("Invalid input format: Please provide tower range and at least one enemy.");
            errors.push("Example data format:");
            errors.push("50m");
            errors.push("BotA 100m 10m");
            errors.push("BotB 50m 20m");
            errors.push("BotC 30m 20m");
        } else {
            setValidDataFormat(true);
            const towerRangeString = lines[0];
            const towerRangeRegex = /^(\d+(\.\d+)?)(m|km)?$/;
            const towerRangeMatch = towerRangeString.match(towerRangeRegex);
            if (!towerRangeMatch) {
                errors.push("Invalid tower range format: Please specify range in meters (m) or kilometers (km).");
            } else {
                let towerRange = parseFloat(towerRangeMatch[1]);
                if (towerRangeMatch[3] === 'km') {
                    towerRange *= 1000;
                }
                setTowerAttackRange(towerRange);
            }

            const parsedEnemies = [];
            for (let i = 1; i < lines.length; i++) {
                const enemyData = lines[i].split(" ");
                if (enemyData.length !== 3) {
                    errors.push(`Invalid enemy data format in line ${i + 1}: Please provide name, current distance, and speed separated by spaces.`);
                } else {
                    const name = enemyData[0];
                    const distanceString = enemyData[1];
                    const distanceRegex = /^(\d+(\.\d+)?)(m|km)?$/;
                    const distanceMatch = distanceString.match(distanceRegex);
                    if (!distanceMatch) {
                        errors.push(`Invalid distance format for enemy ${name}: Please use 'm' for meters or 'km' for kilometers.`);
                        continue;
                    }
                    let currentDistance = parseFloat(distanceMatch[1]);
                    if (distanceMatch[3] === 'km') {
                        currentDistance *= 1000;
                    }
                    const speedString = enemyData[2];
                    const speedRegex = /^(\d+(\.\d+)?)(m|km)?$/;
                    const speedMatch = speedString.match(speedRegex);
                    if (!speedMatch) {
                        errors.push(`Invalid speed format for enemy ${name}: Please use 'm' for meters or 'km' for kilometers.`);
                        continue;
                    }
                    let speed = parseFloat(speedMatch[1]);
                    if (speedMatch[3] === 'km') {
                        speed *= 1000;
                    }
                    const duplicateName = parsedEnemies.find(enemy => enemy.name === name);
                    if(duplicateName){
                        errors.push(`The name "${duplicateName.name}" is duplicated.`);
                    }else{
                        parsedEnemies.push({ name, currentDistance, speed });
                    }

                }
            }

            if (parsedEnemies.length > 0) {
                setTotalEnemies(parsedEnemies.length);
                setDefaultEnemies(parsedEnemies);
                setDeadEnemies([]);
                setResultMessage("");
                setNewTowerRange(null);
                setEnemies(parsedEnemies);
                setSortedEnemies(parsedEnemies);
            }
        }

        return errors;
    };




    const handleEnemyDeath = (enemyOnTowerRange, turnOfDeath) => {
        const enemy = enemies.find(enemy => enemy.name === enemyOnTowerRange.name);
        const distanceAtDeath = enemy ? enemyOnTowerRange.currentDistance : 0;
        setDeadEnemies(prevDeadEnemies => [...prevDeadEnemies, { name: enemyOnTowerRange.name, turn: turnOfDeath, distance: distanceAtDeath }]);
    };

    const checkWin = () => {
        const remainingEnemies = sortedEnemies.filter(enemy => enemy.currentDistance > towerAttackRange);
        if (remainingEnemies.length === 0 && totalEnemies === 0) {
            setGameEnded(true);
            setGameStarted(false);
            setResultMessage("Congratulations! You won on the " + (turns - 1) + " turn!");
            return true;
        }
        return false;
    };

    const checkLoss = () => {
        const enemyReachedTower = sortedEnemies.find(enemy => enemy.currentDistance <= 0);
        if (enemyReachedTower) {
            const initialEnemy = defaultEnemies.find(enemy => enemy.name === enemyReachedTower.name);
            const selectedEnemySpeed = initialEnemy.speed
            const selectedEnemyDistance = initialEnemy.currentDistance
            const enemiesRateSpeed = selectedEnemyDistance / selectedEnemySpeed;

            let nextTowerRange;
            if (enemiesRateSpeed <= 1) {
                nextTowerRange = selectedEnemyDistance;
            } else {
                const enemyTurnDistanceRemainder = selectedEnemyDistance % selectedEnemySpeed;
                if (enemyTurnDistanceRemainder === 0) {
                    nextTowerRange = selectedEnemySpeed;
                } else {
                    nextTowerRange = enemyTurnDistanceRemainder;
                }
            }
            setGameEnded(true);
            setGameStarted(false);
            setNewTowerRange(nextTowerRange);
            setResultMessage(`You lose! ${sortedEnemies.find(enemy => enemy.currentDistance <= 0).name} has reached the tower.`);


            return true;
        }
        return false;
    };

    useEffect(() => {
        if (gameStarted) {
            const intervalId = setInterval(() => {
                setEnemies(prevEnemies => {
                    const sortedUpdatedEnemies = prevEnemies.sort((a, b) => {
                        if (a.currentDistance <= a.speed && b.currentDistance > b.speed) {
                            return -1;
                        }
                        if (a.currentDistance > a.speed && b.currentDistance <= b.speed) {
                            return 1;
                        }
                        if (a.currentDistance === a.speed && b.currentDistance === b.speed) {
                            return b.speed - a.speed;
                        }
                        return a.currentDistance - b.currentDistance;
                    });

                    let enemyOnTowerRange = null;
                    for (let i = 0; i < sortedUpdatedEnemies.length; i++) {
                        if (sortedUpdatedEnemies[i].currentDistance <= towerAttackRange) {
                            enemyOnTowerRange = sortedUpdatedEnemies[i];
                            break;
                        }
                    }

                    if (enemyOnTowerRange) {
                        handleEnemyDeath(enemyOnTowerRange, turns);
                        const updatedEnemies = prevEnemies.map(enemy => ({
                            ...enemy,
                            currentDistance: Math.max(enemy.currentDistance - enemy.speed, 0)
                        }));
                        const remainingEnemies = updatedEnemies.filter(enemy => enemy.name !== enemyOnTowerRange.name);
                        setTotalEnemies(remainingEnemies.length);
                        setSortedEnemies(remainingEnemies);
                        return remainingEnemies;
                    } else {
                        const updatedEnemies = prevEnemies.map(enemy => ({
                            ...enemy,
                            currentDistance: Math.max(enemy.currentDistance - enemy.speed, 0)
                        }));
                        const sortedUpdatedEnemies = updatedEnemies.sort((a, b) => a.currentDistance - b.currentDistance);
                        setSortedEnemies(sortedUpdatedEnemies);
                        return sortedUpdatedEnemies;
                    }
                });

                if (!checkWin() && !checkLoss()) {
                    setTurns(prevTurns => prevTurns + 1);
                }

            }, 500);

            return () => clearInterval(intervalId);
        }
    }, [gameStarted, turns, towerAttackRange, totalEnemies]);


    return (
        <GameBoard
            towerAttackRange={towerAttackRange}
            gameStarted={gameStarted}
            gameEnded={gameEnded}
            sortedEnemies={sortedEnemies}
            deadEnemies={deadEnemies}
            resultMessage={resultMessage}
            newTowerRange={newTowerRange}
            validDataFormat={validDataFormat}
            startGame={startGame}
            parseEnemiesAndTowerRange={parseEnemiesAndTowerRange}
        />
    );
};

export default GameApp;
