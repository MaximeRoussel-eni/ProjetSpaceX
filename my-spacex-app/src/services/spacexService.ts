import axios, { AxiosError } from 'axios';

// Configuration de l'API
const API_BASE_URL = 'https://lldev.thespacedevs.com/2.2.0';

// Interfaces pour le typage
interface Launch {
    id: string;
    name: string;
    net: string;
    status?: {
        name: string;
    };
    // Ajoutez d'autres champs si nécessaire
}

interface ApiResponse<T> {
    results: T[];
    // Ajoutez d'autres champs si nécessaire
}

// Récupérer le prochain lancement valide (futur)
export const getNextLaunch = async (): Promise<Launch> => {
    try {
        // Récupérer les 10 prochains lancements
        const response = await axios.get<ApiResponse<Launch>>(`${API_BASE_URL}/launch/upcoming/?limit=100`);
        console.log('Réponse de l\'API :', response.data); // Debug

        // Filtrer les lancements passés
        const now = Date.now();
        const futureLaunches = response.data.results.filter((launch) => {
            const launchDate = new Date(launch.net).getTime();
            return launchDate > now; // Garder uniquement les lancements futurs
        });

        // Si aucun lancement futur n'est trouvé
        if (futureLaunches.length === 0) {
            throw new Error('Aucun lancement futur trouvé.');
        }

        // Retourner le premier lancement valide
        return futureLaunches[0];
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Erreur lors de la récupération du prochain lancement :', axiosError.message);
        throw new Error('Erreur lors de la récupération du prochain lancement.');
    }
};

// Récupérer les lancements passés
export const getPastLaunches = async (): Promise<Launch[]> => {
    try {
        const response = await axios.get<ApiResponse<Launch>>(`${API_BASE_URL}/launch/previous/?limit=100`);
        return response.data.results; // Retourne les 10 derniers lancements passés
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Erreur lors de la récupération des lancements passés :', axiosError.message);
        throw new Error('Erreur lors de la récupération des lancements passés.');
    }
};