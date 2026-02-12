import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initInkReveal(pathSelector, triggerSelector, customOptions = {}) {
    // Ora cerchiamo il rettangolo invece del path
    const container = document.querySelector('.flooder');
    const rect = container?.querySelector('.ink-rect');
    const trigger = document.querySelector(triggerSelector);

    if (!rect || !trigger || !container) return;

    // Reset: partiamo da scala 0
    gsap.set(rect, { 
        scaleY: 0,
        transformOrigin: "top center"
    });

    return gsap.to(rect, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
            trigger: trigger,
            // Inizia quando la sezione trigger appare in fondo allo schermo
            start: customOptions.start || "top bottom",
            // Finisce quando la sezione trigger tocca il top dello schermo
            end: customOptions.end || "top top",
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                // Debug opzionale: console.log(self.progress);
            },
            onLeave: () => customOptions.onLeave?.(),
            onEnterBack: () => customOptions.onEnterBack?.(),
        }
    });
}