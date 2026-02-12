import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin);

export function initInkReveal(pathSelector, triggerSelector, customOptions = {}) {
    const path = document.querySelector(pathSelector);
    const trigger = document.querySelector(triggerSelector);

    if (!path || !trigger) return;

    ScrollTrigger.getById(pathSelector)?.kill();

    // PATH OTTIMIZZATI
    // Nota: MorphSVG gestisce meglio i path, ma manteniamo la tua struttura
    const INITIAL_PATH = "M-20,0 L100,0 L100,0 C75,0 75,0 50,0 C25,0 25,0 0,0 Z";
    const FINAL_PATH = "M-20,0 L120,0 L120,105 C80,130 70,90 50,120 C30,140 15,90 -20,105 Z";

    // Reset iniziale
    gsap.set(path, { attr: { d: INITIAL_PATH } });

    return gsap.to(path, {
        // --- CAMBIO LOGICA QUI ---
        morphSVG: {
        shape: FINAL_PATH,
        shapeIndex: "auto" // Prova anche con 0, 1, o -1 se auto non basta
        },
        // -------------------------
        ease: "none",
        scrollTrigger: {
            id: pathSelector,
            trigger: trigger,
            start: customOptions.start || "top bottom", 
            end: customOptions.end || "top top",
            scrub: 0.5, // Ridotto a 0.5 per una risposta più pronta su iOS
            invalidateOnRefresh: true,
            onEnter: () => customOptions.onEnter?.(),
            onLeave: () => customOptions.onLeave?.(),
            onEnterBack: () => customOptions.onEnterBack?.(),
            onLeaveBack: () => customOptions.onLeaveBack?.(),
        }
    });
}