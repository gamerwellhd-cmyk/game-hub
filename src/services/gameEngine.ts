// src/services/gameEngine.ts

import { Tile, Position, GameState, Direction } from '../types/tile';

export class GameEngine {
  private gridSize = 4;
  private tiles: Map<string, Tile> = new Map();
  private score = 0;

  constructor() {
    this.initializeGame();
  }

  private initializeGame(): void {
    this.tiles.clear();
    this.score = 0;
    this.addNewTile();
    this.addNewTile();
  }

  private addNewTile(): void {
    const emptyPositions = this.getEmptyPositions();
    if (emptyPositions.length === 0) return;

    const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    const key = `${randomPos.x}-${randomPos.y}`;
    
    this.tiles.set(key, {
      value,
      position: randomPos,
    });
  }

  private getEmptyPositions(): Position[] {
    const occupied = new Set(Array.from(this.tiles.values()).map(t => `${t.position.x}-${t.position.y}`));
    const empty: Position[] = [];

    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        if (!occupied.has(`${x}-${y}`)) {
          empty.push({ x, y });
        }
      }
    }
    return empty;
  }

  moveTiles(direction: Direction): { moved: boolean; scoreGain: number } {
    const oldState = this.serializeState();
    let scoreGain = 0;

    const tiles = Array.from(this.tiles.values());
    const tilesToMove = this.sortTilesByDirection(tiles, direction);

    const movedTiles: Tile[] = [];
    
    for (const tile of tilesToMove) {
      let newPos = this.getNewPosition(tile.position, direction, movedTiles);
      
      const tileAtNewPos = movedTiles.find(t => t.position.x === newPos.x && t.position.y === newPos.y);
      
      if (tileAtNewPos && tileAtNewPos.value === tile.value) {
        tileAtNewPos.value *= 2;
        scoreGain += tileAtNewPos.value;
      } else {
        tile.position = newPos;
        movedTiles.push(tile);
      }
    }

    this.tiles.clear();
    movedTiles.forEach(tile => {
      const key = `${tile.position.x}-${tile.position.y}`;
      this.tiles.set(key, tile);
    });

    const moved = oldState !== this.serializeState();
    if (moved) {
      this.addNewTile();
      this.score += scoreGain;
    }

    return { moved, scoreGain };
  }

  private sortTilesByDirection(tiles: Tile[], direction: Direction): Tile[] {
    const sorted = [...tiles];
    
    switch (direction) {
      case 'up':
        return sorted.sort((a, b) => a.position.y - b.position.y);
      case 'down':
        return sorted.sort((a, b) => b.position.y - a.position.y);
      case 'left':
        return sorted.sort((a, b) => a.position.x - b.position.x);
      case 'right':
        return sorted.sort((a, b) => b.position.x - a.position.x);
    }
  }

  private getNewPosition(pos: Position, direction: Direction, occupiedTiles: Tile[]): Position {
    let newPos = { ...pos };

    while (this.isValidPosition(newPos, direction, occupiedTiles)) {
      switch (direction) {
        case 'up':
          newPos.y--;
          break;
        case 'down':
          newPos.y++;
          break;
        case 'left':
          newPos.x--;
          break;
        case 'right':
          newPos.x++;
          break;
      }
    }

    switch (direction) {
      case 'up':
        newPos.y++;
        break;
      case 'down':
        newPos.y--;
        break;
      case 'left':
        newPos.x++;
        break;
      case 'right':
        newPos.x--;
        break;
    }

    return newPos;
  }

  private isValidPosition(pos: Position, direction: Direction, occupiedTiles: Tile[]): boolean {
    let nextPos = { ...pos };

    switch (direction) {
      case 'up':
        nextPos.y--;
        break;
      case 'down':
        nextPos.y++;
        break;
      case 'left':
        nextPos.x--;
        break;
      case 'right':
        nextPos.x++;
        break;
    }

    if (nextPos.x < 0 || nextPos.x >= this.gridSize || nextPos.y < 0 || nextPos.y >= this.gridSize) {
      return false;
    }

    return !occupiedTiles.some(t => t.position.x === nextPos.x && t.position.y === nextPos.y);
  }

  getGameState(): GameState {
    return {
      score: this.score,
      tiles: this.buildGrid(),
    };
  }

  private buildGrid(): Tile[][] {
    const grid: (Tile | null)[][] = Array(this.gridSize)
      .fill(null)
      .map(() => Array(this.gridSize).fill(null));

    this.tiles.forEach(tile => {
      grid[tile.position.y][tile.position.x] = tile;
    });

    return grid as Tile[][];
  }

  private serializeState(): string {
    return JSON.stringify(
      Array.from(this.tiles.values()).map(t => ({ ...t }))
    );
  }

  isGameOver(): boolean {
    if (this.getEmptyPositions().length > 0) return false;

    const tiles = Array.from(this.tiles.values());
    for (const tile of tiles) {
      for (const dir of ['up', 'down', 'left', 'right'] as Direction[]) {
        const newPos = this.getNewPosition(tile.position, dir, tiles.filter(t => t !== tile));
        if (newPos.x !== tile.position.x || newPos.y !== tile.position.y) {
          return false;
        }
      }
    }

    return true;
  }

  reset(): void {
    this.initializeGame();
  }

  getScore(): number {
    return this.score;
  }

  getTiles(): Tile[] {
    return Array.from(this.tiles.values());
  }
}