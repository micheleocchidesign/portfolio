import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initInkReveal(pathSelector, triggerSelector, customOptions = {}) {
    const path = document.querySelector(pathSelector);
    const container = path?.closest('.flooder');
    const trigger = document.querySelector(triggerSelector);

    if (!path || !trigger || !container) return;

    const INITIAL_PATH = "M0,0 L1000,0 L1000,0 C750,0 750,0 500,0 C250,0 250,0 0,0 Z";
    const FINAL_PATH = "M0,0 L1000,0 L1000,900 C800,1200 700,800 500,1100 C300,1300 200,800 0,1000 Z";

    // Estraiamo useMorph dalle opzioni, di default è false
    // Se useMorph è true, useremo il morphing del path, poco fluido su ios e safari
    const useMorph = customOptions.useMorph || false;

    if (useMorph) {
        // --- ARCHIVIO: MORPHING ---
        gsap.set(path, { attr: { d: INITIAL_PATH } });
        return gsap.to(path, {
            attr: { d: FINAL_PATH },
            ease: "none",
            scrollTrigger: {
                trigger: trigger,
                start: customOptions.start || "top bottom",
                end: customOptions.end || "top top",
                scrub: 1,
                onLeave: () => customOptions.onLeave?.(),
                onEnterBack: () => customOptions.onEnterBack?.(),
            }
        });
    } else {
        // --- PRODUZIONE: SCALE (Universale e fluido) ---
        path.setAttribute('d', FINAL_PATH);
        gsap.set(container, { transformOrigin: "center top" });

        return gsap.fromTo(container, 
            { scaleY: 0 }, 
            {
                scaleY: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: trigger,
                    start: customOptions.start || "top bottom",
                    end: customOptions.end || "top top",
                    scrub: true,
                    onLeave: () => {
                        // Eseguiamo i tuoi callback passati da BeyondSection
                        customOptions.onLeave?.();
                        // Forza scala 1 alla fine per evitare glitch grafici
                        gsap.set(container, { scaleY: 1 });
                    },
                    onEnterBack: () => customOptions.onEnterBack?.(),
                }
            }
        );
    }
}