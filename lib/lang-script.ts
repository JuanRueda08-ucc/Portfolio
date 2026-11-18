/** Server-safe part of the language system (no React): the storage key and the head script. */
export const LANG_KEY = "juano-lang";

/** Inline script for <head>: saved language, else the browser's, before first paint. */
export const LANG_INIT_SCRIPT = `(function(){try{var l=localStorage.getItem("${LANG_KEY}");if(l!=="en"&&l!=="es")l=(navigator.language||"").toLowerCase().indexOf("es")===0?"es":"en";document.documentElement.lang=l}catch(e){}})();`;
