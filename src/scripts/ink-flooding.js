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

    const INITIAL_PATH = "M0,0 L100,0 L100,0 C75,0 75,0 50,0 C25,0 25,0 0,0 Z";
    const FINAL_PATH = "M-20,0 L120,0 L120,105 C80,130 70,90 50,120 C30,140 15,90 -20,105 Z";

    gsap.set(path, { attr: { d: INITIAL_PATH } });

    return gsap.to(path, {
        attr: { d: FINAL_PATH },
        ease: "none",
        scrollTrigger: {
            id: pathSelector, // Assegniamo un ID per poterlo gestire singolarmente
            trigger: trigger,
            start: customOptions.start || "top bottom", 
            end: customOptions.end || "top top",
            scrub: 1,
            invalidateOnRefresh: true,
            // Callback per gestire classi o logiche extra
            onEnter: () => customOptions.onEnter?.(),
            onLeave: () => customOptions.onLeave?.(),
            onEnterBack: () => customOptions.onEnterBack?.(),
            onLeaveBack: () => customOptions.onLeaveBack?.(),
        }
    });
}