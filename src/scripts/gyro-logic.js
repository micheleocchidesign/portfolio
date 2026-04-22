export const gyroState = { 
    active: false, 
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, 
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 
};

let zeroBeta = null;
let zeroGamma = null;

function setupGyro() {
    window.addEventListener('deviceorientation', (event) => {
        // Se i dati sono nulli (es. sensore spento o non disponibile), usciamo
        if (event.beta === null || event.gamma === null) return;

        // Impostiamo il punto zero al primo avvio per evitare "salti" della pupilla
        if (zeroBeta === null) {
            zeroBeta = event.beta;
            zeroGamma = event.gamma;
            gyroState.active = true;
            return;
        }

        // Calcoliamo lo scostamento rispetto alla posizione iniziale
        const deltaGamma = event.gamma - zeroGamma;
        const deltaBeta = event.beta - zeroBeta;

        // Aggiorniamo lo stato globale (usato da cursor-logic.js)
        // Sensibilità impostata a 15
        gyroState.x = (window.innerWidth / 2) + (deltaGamma * 15);
        gyroState.y = (window.innerHeight / 2) + (deltaBeta * 15);
    }, true);
}

export function initGyro() {
    // 1. Esci subito se è Desktop (evita calcoli inutili)
    if (window.matchMedia("(pointer: fine)").matches) return;

    // 2. Controllo disponibilità sensore
    if (window.DeviceOrientationEvent) {
        /**
         * LOGICA SILENZIOSA:
         * Su iOS (Safari) esiste 'requestPermission'. Dato che richiede un'interazione 
         * utente esplicita e noi NON vogliamo mostrare UI di attivazione, 
         * lo ignoriamo totalmente. L'occhio userà l'Idle casuale.
         * * Su Android/Chrome spesso il permesso non è richiesto o è già gestito, 
         * quindi proviamo ad attivarlo direttamente.
         */
        if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
            setupGyro();
        }
    }
}