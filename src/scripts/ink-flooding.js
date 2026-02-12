import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initInkReveal(pathSelector, triggerSelector, customOptions = {}) {
    const path = document.querySelector(pathSelector);
    const container = path?.closest('.flooder');
    const trigger = document.querySelector(triggerSelector);

    if (!path || !trigger || !container) return;

    // ViewBox 1000x1000
    const INITIAL_PATH = "M0,0 L1000,0 L1000,0 C750,0 750,0 500,0 C250,0 250,0 0,0 Z";
    const FINAL_PATH = "M0,0 L1000,0 L1000,900 C800,1200 700,800 500,1100 C300,1300 200,800 0,1000 Z";
    // Rileviamo se l'utente è su QUALSIASI dispositivo mobile (Android o iOS)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
    path.setAttribute('d', FINAL_PATH);
    
    // Impostiamo il punto di origine della trasformazione in alto
    // così l'inchiostro si allunga verso il basso e non verso il centro
    gsap.set(container, { transformOrigin: "center top" });

    return gsap.fromTo(container, 
        { 
            y: "0%", 
            scaleY: 0 // Parte un po' "compresso"
        }, 
        {
            y: "0%", 
            scaleY: 1.2, // Si allunga mentre scende (effetto goccia)
            ease: "none",
            scrollTrigger: {
                trigger: trigger,
                start: customOptions.start || "top bottom",
                end: customOptions.end || "top top",
                scrub: true,
                onUpdate: (self) => {
                    // Opzionale: se vuoi un effetto ancora più dinamico
                    // puoi legare lo scale alla velocità dello scroll (self.getVelocity())
                }
            }
        }
    );
} else {
        // --- STRATEGIA DESKTOP: MORPHING ---
        gsap.set(path, { attr: { d: INITIAL_PATH } });

        return gsap.to(path, {
            attr: { d: FINAL_PATH },
            ease: "none",
            scrollTrigger: {
                trigger: trigger,
                start: customOptions.start || "top bottom",
                end: customOptions.end || "top top",
                scrub: 1, // Manteniamo l'effetto "gommoso" su desktop
                onLeave: () => customOptions.onLeave?.(),
                onEnterBack: () => customOptions.onEnterBack?.(),
            }
        });
    }
}