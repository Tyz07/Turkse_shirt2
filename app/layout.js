import "./globals.css";
import { Oswald } from "next/font/google";
import { ShopProvider } from "@/components/ShopProvider";
import Header from "@/components/Header";

// Sportief condensed font voor koppen en logo (latin-ext voor Turkse tekens)
const oswald = Oswald({
    subsets: ["latin", "latin-ext"],
    weight: ["500", "600", "700"],
    variable: "--font-heading",
});

export const metadata = {
    title: "Voetbalshop TR",
    description: "Turkse clubshirts – selecteer je club en maat, S t/m XXL op voorraad.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="nl">
            <body className={oswald.variable}>
                <ShopProvider>
                    <Header />

                    {/* Welkomstbanner bovenaan elke pagina */}
                    <section className="hero">
                        <div className="wrap">
                            <h1>Turkse Clubshirts</h1>
                            <p>Selecteer je club en maat – S t/m XXL op voorraad.</p>
                        </div>
                    </section>

                    <main className="wrap">{children}</main>

                    <footer className="ftr">
                        <div className="wrap">© Voetbalshop</div>
                    </footer>
                </ShopProvider>
            </body>
        </html>
    );
}
