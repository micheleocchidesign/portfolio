import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initInkReveal(pathSelector, triggerSelector, customOptions = {}) {
    const path = document.querySelector(pathSelector);
    const trigger = document.querySelector(triggerSelector);

    if (!path || !trigger) return;

    // Opzionale: uccidi eventuali istanze precedenti su QUESTO trigger specifico
    // invece di fare un "massacro" globale con .getAll()
    ScrollTrigger.getById(pathSelector)?.kill();

    const INITIAL_PATH = "M0,0 L1000,0 L1000,0 C750,0 250,0 0,0 Z";
    const FINAL_PATH = "M0,0 L1000,0 L1000,1100 C750,1300 250,800 0,1100 Z";
    gsap.set(path, { attr: { d: INITIAL_PATH } });

    return gsap.to(path, {
    attr: { d: FINAL_PATH },
    ease: "power1.inOut", // Un leggero easing interno aiuta
    scrollTrigger: {
        trigger: trigger,
        start: customOptions.start || "top bottom", 
        end: customOptions.end || "top top",
        // TRUCCO: scrub true è più leggero di scrub: 1 perché non deve gestire l'inerzia temporale
        scrub: true, 
        invalidateOnRefresh: true,
        // Evitiamo che GSAP calcoli posizioni millimetriche inutili
        fastScrollEnd: true,
        preventOverlaps: true,
    }
});
}