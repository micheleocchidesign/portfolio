export const isDesktop = typeof window !== "undefined" ? window.matchMedia("(pointer: fine)").matches : false;

export const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};