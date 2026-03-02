// src/types/game.ts

// Game types and interfaces

export interface Game {
    id: string;
    title: string;
    genre: string;
    releaseDate: Date;
    description?: string;
}

export interface Player {
    id: string;
    name: string;
    score: number;
    level: number;
}

export interface GameStats {
    gameId: string;
    players: Player[];
    highestScore: number;
    averageScore: number;
}