export interface Launch {
    id: string;
    name: string;
    net: string; // Date du lancement
    status?: {
        name: string;
    };
    image?: string; // URL de l'image
}
