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
    image?: string; // Ajout du champ pour l'image
    // Ajoutez d'autres champs si nécessaire
}

interface ApiResponse<T> {
    results: T[];
    // Ajoutez d'autres champs si nécessaire
}

// Récupérer le prochain lancement valide (futur)
export const getNextLaunch = async (): Promise<Launch> => {
    try {
        const response = await axios.get<ApiResponse<Launch>>(`${API_BASE_URL}/launch/upcoming/?limit=100`);
        const now = Date.now();
        const futureLaunches = response.data.results.filter((launch) => {
            const launchDate = new Date(launch.net).getTime();
            return launchDate > now;
        });

        if (futureLaunches.length === 0) {
            throw new Error('Aucun lancement futur trouvé.');
        }

        // Ajouter l'image de la fusée si disponible dans l'API
        futureLaunches[0].image = futureLaunches[0].image || `https://example.com/rocket-image/${futureLaunches[0].id}.png`; // Remplacez par l'URL réelle
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
        response.data.results.forEach(launch => {
            launch.image = launch.image || `https://example.com/rocket-image/${launch.id}.png`; // Remplacez par l'URL réelle
        });
        return response.data.results;
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Erreur lors de la récupération des lancements passés :', axiosError.message);
        throw new Error('Erreur lors de la récupération des lancements passés.');
    }
};
