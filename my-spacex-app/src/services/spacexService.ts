import axios from 'axios';

const API_BASE_URL = 'https://lldev.thespacedevs.com/2.2.0';

// Récupérer le prochain lancement
export const getNextLaunch = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/launch/upcoming/?limit=1`);
        return response.data.results[0]; // Retourne le premier lancement futur
    } catch (error) {
        console.error('Erreur lors de la récupération du prochain lancement :', error);
        throw error;
    }
};

// Récupérer les lancements passés
export const getPastLaunches = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/launch/previous/?limit=10`);
        return response.data.results; // Retourne les 10 derniers lancements passés
    } catch (error) {
        console.error('Erreur lors de la récupération des lancements passés :', error);
        throw error;
    }
};