export const gyroState = { 
    active: false, 
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, 
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 
};

let zeroBeta = null;
let zeroGamma = null;

function setupGyro() {
    window.addEventListener('deviceorientation', (event) => {
        // Se i dati sono nulli, usciamo subito
        if (event.beta === null || event.gamma === null) return;

        // Impostiamo il punto zero al primo avvio
        if (zeroBeta === null) {
            zeroBeta = event.beta;
            zeroGamma = event.gamma;
            gyroState.active = true;
            return;
        }

        // Calcoliamo lo scostamento
        const deltaGamma = event.gamma - zeroGamma;
        const deltaBeta = event.beta - zeroBeta;

        // Aggiorniamo lo stato globale (usato dal componente Astro)
        // Nota: 15 è la sensibilità, puoi regolarla qui
        gyroState.x = (window.innerWidth / 2) + (deltaGamma * 15);
        gyroState.y = (window.innerHeight / 2) + (deltaBeta * 15);
    }, true);
}

export function initGyro() {
    // Escludiamo i desktop con mouse (puntamento fine)
    if (window.matchMedia("(pointer: fine)").matches) return;

    if (window.DeviceOrientationEvent) {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            // Gestione iOS
            const cta = document.getElementById('gyro-cta');
            cta?.classList.remove('hidden');
            cta?.addEventListener('click', () => {
                DeviceOrientationEvent.requestPermission()
                    .then(state => {
                        if (state === 'granted') {
                            setupGyro();
                            cta.classList.add('hidden');
                        }
                    })
                    .catch(console.error);
            });
        } else {
            // Android e altri
            setupGyro();
        }
    }
}