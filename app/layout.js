// ============================================================
// layout.js — het "skelet" om elke pagina heen
// ============================================================
// In Next.js (App Router) wordt elke pagina automatisch in deze
// layout gestopt, op de plek van {children}. Alles wat op élke
// pagina hoort (header, hero-banner, footer) staat dus hier.

import "./globals.css";
import { Oswald } from "next/font/google";
import { ShopProvider } from "@/components/ShopProvider";
import Header from "@/components/Header";

// Sportief condensed font voor koppen en logo.
// next/font downloadt het font bij het builden en host het zelf
// (dus geen langzame Google-request bij elke bezoeker).
// "latin-ext" is nodig voor Turkse tekens zoals ş en ğ.
// De variable "--font-heading" wordt in globals.css gebruikt.
const oswald = Oswald({
    subsets: ["latin", "latin-ext"],
    weight: ["500", "600", "700"],
    variable: "--font-heading",
});

// Titel en omschrijving in de browser-tab / zoekmachines
export const metadata = {
    title: "Voetbalshop TR",
    description: "Turkse clubshirts – selecteer je club en maat, S t/m XXL op voorraad.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="nl">
            {/* className zet de font-variabele op de hele pagina */}
            <body className={oswald.variable}>
                {/* ShopProvider moet om ALLES heen staan, anders kunnen
                    de componenten niet bij de winkelmand/valuta/etc. */}
                <ShopProvider>
                    <Header />

                    {/* Rode welkomstbanner bovenaan elke pagina */}
                    <section className="hero">
                        <div className="wrap">
                            <h1>Turkse Clubshirts</h1>
                            <p>Selecteer je club en maat – S t/m XXL op voorraad.</p>
                        </div>
                    </section>

                    {/* Hier komt de inhoud van de huidige pagina */}
                    <main className="wrap">{children}</main>

                    <footer className="ftr">
                        <div className="wrap">© Voetbalshop</div>
                    </footer>
                </ShopProvider>
            </body>
        </html>
    );
}
