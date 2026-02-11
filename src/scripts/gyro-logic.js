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

function updateGyroUI(state) {
    const cta = document.getElementById('gyro-cta');
    if (!cta) return;
    const span = cta.querySelector('span');
    
    if (state === 'active') {
        if (span) span.innerText = "MUOVI PER INTERAGIRE";
        // Sparisce dopo 3 secondi così non rompe il design
        setTimeout(() => {
            cta.style.opacity = '0';
            setTimeout(() => cta.classList.add('hidden'), 500);
        }, 3000);
    } else if (state === 'ask') {
        if (span) span.innerText = "ATTIVA INTERAZIONE";
        cta.classList.remove('hidden');
    }
}

export function initGyro() {
    if (window.matchMedia("(pointer: fine)").matches) return;

    if (window.DeviceOrientationEvent) {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS: mostriamo il tasto e chiediamo il testo "ask"
            updateGyroUI('ask'); 
            
            const cta = document.getElementById('gyro-cta');
            cta?.addEventListener('click', () => {
                DeviceOrientationEvent.requestPermission()
                    .then(state => {
                        if (state === 'granted') {
                            setupGyro();
                            updateGyroUI('active');
                        }
                    })
                    .catch(console.error);
            });
        } else {
            // Android: parte da solo, mostriamo il testo "active" e poi nascondiamo
            setupGyro();
            updateGyroUI('active');
        }
    }
}