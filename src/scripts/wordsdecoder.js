// src/scripts/wordsdecoder.js
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrambleTextPlugin, ScrollTrigger);

export function decode(txt, target, options = {}) {
    // Cerchiamo l'elemento (può essere un ID o una classe)
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;

    // Valori di default uniti a quelli passati dall'utente
    const settings = {
        duration: 0.8,
        chars: "ABCDEFGHILMNOPQRSTUVZ123456789",
        speed: 1,
        delay: 0,
        ...options // Sovrascrive i default se passi qualcosa di diverso
    };

    gsap.to(el, {
        duration: settings.duration,
        delay: settings.delay,
        scrambleText: {
            text: txt.replace("|", "<br>"),
            chars: settings.chars,
            speed: settings.speed
        },
        onComplete: () => {
            if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        }
    });
}
export function decodeCycle(wordsArray, target, options = {}) {
    const settings = {
        interval: 4000,
        ...options
    };

    let currentIndex = 0;

    // Funzione interna per gestire il cambio
    const runCycle = () => {
        currentIndex = (currentIndex + 1) % wordsArray.length;
        // Chiamiamo la decode singola passandogli le opzioni
        decode(wordsArray[currentIndex], target, settings);
    };

    // Facciamo partire il primo decode immediatamente (opzionale)
    decode(wordsArray[0], target, settings);

    // Restituiamo l'ID dell'intervallo così puoi fermarlo se serve
    return setInterval(runCycle, settings.interval);
}