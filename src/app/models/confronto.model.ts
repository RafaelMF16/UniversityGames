export interface Confronto {
    id: number;
    equipeA: string;
    equipeB: string;
    data: string;
    horario: string;
    local: string;
    golsA?: number;
    golsB?: number;
}