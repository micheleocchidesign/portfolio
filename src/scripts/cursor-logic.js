import { gsap } from "gsap";
import { isDesktop } from "./utils.js";
import { gyroState } from "./gyro-logic.js";

// --- INPUT (Coordinate target) ---
let mX = window.innerWidth / 2,
    mY = window.innerHeight / 2;

// --- STATO ATTUALE (Per calcoli di direzione/velocità) ---
let cX = mX, cY = mY;
let cPX = mX, cPY = mY; // Stato attuale pupille
let breathTime = 0;
let smoothMX = window.innerWidth / 2;
let smoothMY = window.innerHeight / 2;
let smoothCX = window.innerWidth / 2;
let smoothCY = window.innerHeight / 2;
let lastCursorX = window.innerWidth / 2;
let lastCursorY = window.innerHeight / 2;
// Parametro di Attrito: 
// 1.0 = istantaneo (nessun attrito)
// 0.1 = molto viscoso (ritardo marcato)
// 0.2 = bilanciato
let friction = 0.4;
let isSticky = false;
let stickyScale = 1; // Variabile di supporto per l'ingrandimento
let idleTimeout, idleInterval;
let tPX = mX, tPY = mY; // Target per pupille

// --- Riferimenti DOM per cursore sticky ---
let menuBtn = document.getElementById('nav-text-menu');
const cursor = document.getElementById('custom-cursor');

// Riferimenti agli occhi (Hero e Nav)
let hp, np;

const getEyeParts = (wrapper) => {
    if (!wrapper) return null;
    return {
        eye: wrapper.querySelector('.intero-occhio'),
        pup: wrapper.querySelector('.p-mover'),
        brow: wrapper.querySelector('.sopracciglio')
    };
};

// --- 2. QUICKSETTERS (Per le performance) ---
// Nota: li inizializzeremo dentro una funzione perché il DOM deve essere pronto
let xSet, ySet, scaleXTo, scaleYTo, rotationTo;

export function initCursorLogic() {
    //const cursor = document.getElementById('custom-cursor');
    container = document.getElementById('cursor-container');
    
    // Rimuoviamo il "return" bloccante per mobile.
    // Se siamo su mobile, 'cursor' sarà null, ma a noi servono HP e NP.

    const hLog = document.getElementById('hero-logo-wrapper');
    const nLog = document.getElementById('nav-logo-wrapper');
    
    hp = getEyeParts(hLog);
    np = getEyeParts(nLog);

    // Inizializziamo GSAP solo se il cursore esiste (Desktop)
    if (cursor && isDesktop) {
        xSet = gsap.quickSetter(cursor, "x", "px");
        ySet = gsap.quickSetter(cursor, "y", "px");
        scaleXTo = gsap.quickTo(cursor, "scaleX", { duration: 0.2, ease: "power2.out" });
        scaleYTo = gsap.quickTo(cursor, "scaleY", { duration: 0.2, ease: "power2.out" });
        rotationTo = gsap.quickTo(cursor, "rotation", { duration: 0.2, ease: "power2.out" });
    }

    // --- //MODIFICA CURSORE SE HOVER SU LINK O ALTRI ELEMENTI ---
    if (cursor && isDesktop) {
        document.addEventListener('mouseover', (e) => {
            const target = e.target;
            if (!target) return;

            // Verifichiamo se l'elemento è un link o ha il cursore pointer
            const hasPointer = window.getComputedStyle(target).cursor === 'pointer';
            const isLink = target.closest('a') || target.closest('button');
            
            // Escludiamo il menu che gestisci già con lo stato "isSticky"
            const isMenuElement = target.closest('.menu-link') || target.closest('#nav-text-menu');

            if ((hasPointer || isLink) && !isMenuElement) {
                cursor.classList.add('is-hovering');
            }
            // Check specifico per vedere i lavori
            if (target.closest('.big-works-link')){
                cursor.classList.add('is-works-link');
            }
            // Check specifico per email
            if (target.closest('.scrivimi-link') || target.closest('.email-link')) {
                cursor.classList.add('is-email');
            }
        });

        document.addEventListener('mouseout', (e) => {
            cursor.classList.remove('is-hovering', 'is-works-link', 'is-email');
        });
        // --- //MODIFICA CURSORE SE HOVER SU VIDEO O IFRAME (YouTube) ---
        const videoModules = document.querySelectorAll('.type-youtube, .module video[controls]');        console.log("Moduli YouTube trovati:", videoModules.length); // Deve essere > 0
        videoModules.forEach((mod, index) => {
            mod.addEventListener('mouseenter', () => {
                if (cursor) cursor.style.display = "none";
            });

            mod.addEventListener('mouseleave', () => {
                console.log(`MOUSE LEAVE dal modulo ${index}`);
                if (cursor) cursor.style.display = "block";
            });
        });
    }

    // Il mousemove lo lasciamo, tanto su mobile non triggera o viene ignorato se gyroActive
    document.addEventListener('mousemove', (e) => {
        if (gyroState.active) return;
            mX = e.clientX;
            mY = e.clientY;
            window.realMX = e.clientX;
            window.realMY = e.clientY;
            tPX = e.clientX;
            tPY = e.clientY;

            // Calcolo della distanza dal pulsante menu SOLO se esiste.
            // Se il pulsante non è presente, evitiamo l'eccezione e manteniamo
            // lo stato non-sticky così che `resetIdleTimer()` venga sempre eseguito.

            if (menuBtn) {
                const btnRect = menuBtn.getBoundingClientRect();
                const dist = Math.hypot(mX - (btnRect.left + btnRect.width / 2), mY - (btnRect.top + btnRect.height / 2));
                // Soglia dello sticky
                if (dist < 60 && !document.body.classList.contains('use-standard-cursor')) { 
                    isSticky = true;
                    stickyScale = 2.5; // Qui decidi quanto si deve ingrandire (es. 2.5 volte)
                    menuBtn.classList.add('sticky-active');
                    // Il target del cursore diventa il centro esatto del bottone
                    mX = btnRect.left + btnRect.width / 2;
                    mY = btnRect.top + btnRect.height / 2;
                } else {
                    isSticky = false;
                    stickyScale = 1; // Torna alla dimensione normale
                    menuBtn.classList.remove('sticky-active');
                }
            } else {
                isSticky = false;
                stickyScale = 1;
            }
            resetIdleTimer();
        });
    // Avvia il ciclo di update
    update();
}

// --- 3. LE FUNZIONI DI CALCOLO (solve e update) ---
function solve(eye, radius, mouseX, mouseY) {
    const rect = eye.getBoundingClientRect();
    const eyeX = rect.left + rect.width / 2;
    const eyeY = rect.top + rect.height / 2;
    const dx = mouseX - eyeX;
    const dy = mouseY - eyeY;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const limitedDist = Math.min(dist * 0.1, radius);
    return { x: Math.cos(angle) * limitedDist, y: Math.sin(angle) * limitedDist };
}

// funzione di idle per l'occhio
function startIdleMovement() {
    // Assicuriamoci di non avere intervalli multipli
    clearInterval(idleInterval);
    
    idleInterval = setInterval(() => {
        if (gyroState.active) {
            mX = Math.random() * window.innerWidth;
            mY = Math.random() * window.innerHeight;
        } else {
            window.realMX = undefined;
            window.realMY = undefined;
            mX = tPX = Math.random() * window.innerWidth;
            mY = tPY = Math.random() * window.innerHeight;
        }
    }, 2500);
}

function resetIdleTimer() {
    // Ferma il movimento casuale se era attivo
    clearInterval(idleInterval);
    // Resetta il timer che fa partire l'idle
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(startIdleMovement, 2000);
}

// Aggiungi questa variabile in alto insieme alle altre let (mX, mY, ecc.)
let container; 

// Incolla la funzione (leggermente adattata per sicurezza)
function createDrop(x, y) {
    if (!container) return; // Sicurezza nel caso il container non esista
    
    const drop = document.createElement('div');
    drop.className = 'drop';
    
    drop.style.left = `${x}px`;
    drop.style.top = `${y}px`;
    
    container.appendChild(drop);

    drop.animate([
        { 
            transform: 'translate(-50%, -50%) scale(1)', 
            opacity: 0.6 
        },
        { 
            transform: 'translate(-50%, -50%) scale(0)', 
            opacity: 0 
        }
    ], {
        duration: 600,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }).onfinish = () => drop.remove();
}

function update() {
    let pTargetX, pTargetY; 
    let cTargetX, cTargetY; 

    if (gyroState.active) {
        // Se il giroscopio è attivo, prendiamo le coordinate da lì
        // tPX e tPY diventano i valori calcolati dai sensori
        tPX = gyroState.x;
        tPY = gyroState.y;
        
        pTargetX = cTargetX = tPX;
        pTargetY = cTargetY = tPY;
    } else {
        if (window.realMX !== undefined) {
            // Mouse attivo
            pTargetX = cTargetX = window.realMX;
            pTargetY = cTargetY = window.realMY;
            lastCursorX = window.realMX;
            lastCursorY = window.realMY;
        } else {
            // Idle random
            pTargetX = mX;
            pTargetY = mY;
            cTargetX = lastCursorX;
            cTargetY = lastCursorY;
        }
    }

    // Smoothing separato
    smoothMX += (pTargetX - smoothMX) * friction;
    smoothMY += (pTargetY - smoothMY) * friction;
    
    smoothCX += (cTargetX - smoothCX) * friction;
    smoothCY += (cTargetY - smoothCY) * friction;

    if (isDesktop && xSet && ySet) { // Aggiungiamo il controllo sui setter
        const dx = smoothCX - cX;
        const dy = smoothCY - cY;
        const speed = Math.hypot(dx, dy);

        // Manteniamo i tuoi Lerp per lo stato sticky/normal
        cX += dx * (isSticky ? 0.3 : 0.2);
        cY += dy * (isSticky ? 0.3 : 0.2);

        xSet(cX);
        ySet(cY);

        // --- STEP 3: LOGICA STATI (Idle/Movement) ---
        /*if (cursor.classList.contains('is-email')) {
            // Se è in modalità email, resetta trasformazioni per non deformare l'icona
            //scaleXTo(1);
            //scaleYTo(1);
            //rotationTo(0);
        } 
        else if (speed < 5 || isSticky) {*/

        if (speed < 5 || isSticky) {
            rotationTo.tween.duration(1.2); 
            breathTime += 0.05;
            const baseScale = isSticky ? 1.0 : 0.33; 
            
            scaleXTo(baseScale + Math.sin(breathTime) * (isSticky ? 0.05 : 0.02));
            scaleYTo(baseScale + Math.cos(breathTime * 0.8) * (isSticky ? 0.06 : 0.03));
            rotationTo(isSticky ? 0 : Math.sin(breathTime * 0.5) * 5);
        } else {
            rotationTo.tween.duration(0.05);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            const stretch = Math.min(speed / 500, 0.6); 

            scaleXTo(0.33 + (stretch*0.3));         
            scaleYTo(0.33 - (stretch * 0.2)); 
            rotationTo(angle);            

            if (speed > 20 && Math.random() > 0.8 && !isSticky) {
                createDrop(cX, cY);
            }
        }
    }

    // --- STEP 4: PUPILLE (Sincronizzate con l'attrito) ---
    if (hp) {
        const posHP = solve(hp.eye, 50, smoothMX, smoothMY);
        hp.pup.style.transform = `translate(${posHP.x}px, ${posHP.y}px)`;
    }
    
    if (np) {
        const posNP = solve(np.eye, 30, smoothMX, smoothMY);
        np.pup.style.transform = `translate(${posNP.x}px, ${posNP.y}px)`;
    }

    requestAnimationFrame(update);
}
