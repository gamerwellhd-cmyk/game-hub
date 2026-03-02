// types/tile.ts

type Tile = {
  value: number; // The value of the tile (e.g. 2, 4, 8, etc.)
  position: Position; // The position of the tile on the grid
};


type Position = {
  x: number; // The x-coordinate on the grid
  y: number; // The y-coordinate on the grid
};


type GameState = {
  score: number; // The current score of the game
  tiles: Tile[][]; // A 2D array representing the game grid
};


type Direction = 'up' | 'down' | 'left' | 'right'; // Possible movement directions