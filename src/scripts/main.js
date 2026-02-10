import { gsap } from "gsap";
    
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

import { initGyro } from "./gyro-logic.js";
import { initCursorLogic } from "./cursor-logic.js";

gsap.registerPlugin(MorphSVGPlugin, ScrollTrigger, ScrollToPlugin, DrawSVGPlugin, ScrambleTextPlugin);
/*
const hLog = document.getElementById('hero-logo-wrapper'),
    nLog = document.getElementById('nav-logo-wrapper');

const getEyeParts = (wrapper) => {
    if (!wrapper) return null;
    return {
        eye: wrapper.querySelector('.intero-occhio'),
        pup: wrapper.querySelector('.p-mover'),
        brow: wrapper.querySelector('.sopracciglio')
    };
};

const hp = getEyeParts(hLog);
const np = getEyeParts(nLog);

const cursor = document.getElementById('custom-cursor'),
    container = document.getElementById('cursor-container');
const menuBtn = document.getElementById('nav-text-menu'),
    labelName = document.getElementById('label-name');*/





// Gestisce link interni alla pagina con scroll dolce tramite GSAP invece del salto immediato
document.querySelectorAll('.internal-link').forEach(link => {
    link.addEventListener('click', (e) => {
        targetInterno = link.getAttribute('href');

         // Intercetta solo se è un'ancora locale (inizia con #)
        if (targetInterno && targetInterno.startsWith('#')) {
            e.preventDefault(); // Impedisce il salto immediato dell'ancora

            // Scrolla dolcemente alla sezione usando GSAP
            gsap.to(window, { duration: 1.5, scrollTo: targetInterno, ease: "power2.inOut", delay: 0.2 });
        }
    });
});



/* SEZIONE SINGOLO PROGETTO */
    function initProjectSticky() {
        // Kill eventuali trigger esistenti per evitare duplicati al cambio pagina
        ScrollTrigger.getAll().forEach(t => {
            if (t.vars.pin === ".project-side") t.kill();
        });

        ScrollTrigger.matchMedia({
            "(min-width: 901px)": function() {
                ScrollTrigger.create({
                    trigger: ".project-grid", // Usiamo la griglia come riferimento di durata
                    start: "top 140px",       // Inizia quando la griglia arriva al top desiderato
                    end: "bottom bottom",    // Finisce quando il fondo griglia tocca il fondo scroller
                    pin: ".project-side",
                    pinSpacing: false,
                    invalidateOnRefresh: true,
                    anticipatePin: 1,
                    refreshPriority: 1 // Diamo priorità a questo calcolo
                });
            }
        });
    }

    /* --- REVEAL INCHIOSTRO WORKS --- */
    /*function initWorksInkReveal() {
        const inkPathWorks = document.getElementById('works-ink-path');
        if (!inkPathWorks) return;

        const INITIAL_PATH = "M0,0 L100,0 L100,0 C75,0 75,0 50,0 C25,0 25,0 0,0 Z";
        const FINAL_PATH = "M-20,0 L120,0 L120,105 C80,130 70,90 50,120 C30,140 15,90 -20,105 Z";

        gsap.to(inkPathWorks, {
            scrollTrigger: {
                trigger: "#works-intro",
                start: "top top",      // Inizia subito
                end: "bottom top",     // Finisce quando la intro nera è sparita
                scrub: 1,
            },
            attr: { d: FINAL_PATH },
            ease: "none"
        });
    }*/
    function setupAll() {
        // support both possible IDs (legacy: 'skill-filters', current markup: 'skills-filters')
        if (document.querySelector('.project-side')) initProjectSticky();
        if( document.getElementById('works-ink-path')) initWorksInkReveal();
        initGyro();
        initCursorLogic();

        ScrollTrigger.refresh(); // Forza il ricalcolo immediato

        // FADE IN INIZIALE UI (Cursore & CTA)
        gsap.to("#custom-cursor", { opacity: 1, duration: 0.5 });  
        const cta = document.getElementById('gyro-cta');
        if (cta) gsap.to(cta, { opacity: 1, duration: 0.5, delay: 0.2 });
    }

    // Resize finestra
  window.addEventListener("resize", debounce(() => {
      ScrollTrigger.refresh();
  }, 200));

    // Utility Debounce per resize
  // Funzione debounce per limitare la frequenza di esecuzione durante il resize
  function debounce(func, wait) {
      let timeout;
      return function(...args) {
          clearTimeout(timeout);
          timeout = setTimeout(() => func.apply(this, args), wait);
      };
  }


// Avvio iniziale
window.addEventListener("load", setupAll);
