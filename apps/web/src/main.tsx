import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/app/App";
import { i18nReady } from "@/i18n/config";
import "@/index.css";

/**
 * On attend les traductions de la langue active avant de monter l'application
 * (chargees via le backend lazy de i18next) : c'est quasi gratuit (1 petit
 * JSON) par rapport au gain de ne plus embarquer les 8 langues dans le JS
 * initial. Si ce chargement echoue, on monte quand meme : la langue de repli
 * `en` est chargee via le meme backend.
 */
void i18nReady
  .catch(() => undefined)
  .then(() => {
    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  });
