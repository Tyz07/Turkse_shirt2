"use client";
// ============================================================
// checkout/page.js — afrekenen (F9) en de orderbevestiging (F13)
// ============================================================
// Deze pagina heeft drie "gezichten", van onder naar boven in de code:
//   1. het afrekenformulier (de normale situatie)
//   2. een melding als de mand leeg is
//   3. de bevestigingspagina na een geslaagde bestelling
//
// Bij "Bestellen" sturen we de mand + klantgegevens als JSON naar
// onze eigen API (/api/orders). Die slaat alles op in MySQL en
// stuurt het unieke ordernummer terug.

import { useState } from "react";
import Link from "next/link";
import { useShop } from "@/components/ShopProvider";
import Price from "@/components/Price";

export default function CheckoutPage() {
    const { cart, cartTotal, discount, clearCart } = useShop();

    // De ingevulde klantgegevens (elk veld gekoppeld aan een input)
    const [form, setForm] = useState({
        first_name: "", last_name: "", email: "",
        address: "", postal_code: "", city: "", country: "",
    });
    const [error, setError] = useState("");        // foutmelding van de server
    const [busy, setBusy] = useState(false);       // true tijdens het versturen
    const [confirmation, setConfirmation] = useState(null); // orderdata na succes

    // Bedragen voor het overzichtje onder het formulier
    const discountAmount = discount ? cartTotal * discount.percent : 0;
    const newTotal = cartTotal - discountAmount;

    /**
     * Hulpfunctie die een onChange-handler maakt voor één veld.
     * set("city") geeft een functie terug die form.city bijwerkt.
     * Scheelt zeven bijna identieke handlers.
     */
    function set(field) {
        return (e) => setForm({ ...form, [field]: e.target.value });
    }

    /** Klik op "Bestellen": alles naar de API sturen (F9). */
    async function handleSubmit(e) {
        e.preventDefault(); // browser niet zelf laten submitten
        setError("");
        setBusy(true); // knop uitschakelen tegen dubbel klikken

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer: form,
                    discountCode: discount?.code ?? "",
                    // Alleen de essentie meesturen; prijzen zoekt de
                    // server zélf op in de database (veiliger)
                    items: cart.map((it) => ({
                        id: it.id,
                        size: it.size,
                        customName: it.customName,
                        qty: it.qty,
                    })),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                // Server zei nee (bijv. veld leeg of product bestaat niet meer)
                setError(data.error || "Er ging iets mis bij het bestellen.");
                return;
            }

            // Gelukt! Bevestiging bewaren en de mand leegmaken.
            // (eerst bewaren, anders is de data weg voor het tonen)
            setConfirmation({ ...data, firstName: form.first_name });
            clearCart();
        } catch {
            setError("Kon geen verbinding maken met de server.");
        } finally {
            setBusy(false);
        }
    }

    /* ============== 3. Bevestigingspagina na succesvolle bestelling (F13) ============== */
    if (confirmation) {
        return (
            <div className="box">
                <h2>🎉 Bestelling geplaatst!</h2>
                <p>
                    Bedankt voor je bestelling,{" "}
                    <strong>{confirmation.firstName}</strong>.
                </p>
                <p>
                    Je ordernummer is:{" "}
                    <strong>{confirmation.orderNumber}</strong>
                </p>

                <hr />

                {/* Overzicht van wat er besteld is */}
                <h3>Overzicht van je bestelling:</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Aantal</th>
                            <th>Prijs</th>
                        </tr>
                    </thead>
                    <tbody>
                        {confirmation.items.map((it, i) => (
                            <tr key={i}>
                                <td>
                                    {it.name} (Maat: {it.size})
                                    {it.customName && <> — {it.customName}</>}
                                </td>
                                <td>{it.qty}x</td>
                                <td><Price amount={it.subtotal} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totaal betaald, met kortingsregels indien van toepassing */}
                <div className="total">
                    {confirmation.discountAmount > 0 && (
                        <>
                            <p>Origineel: <Price amount={confirmation.originalTotal} /></p>
                            <p>Korting: -<Price amount={confirmation.discountAmount} /></p>
                        </>
                    )}
                    <strong>Totaal betaald: <Price amount={confirmation.total} /></strong>
                </div>

                <Link className="btn" href="/">Verder winkelen</Link>
            </div>
        );
    }

    /* ============== 2. Lege mand: niks om af te rekenen ============== */
    if (cart.length === 0) {
        return (
            <div className="box">
                <h2>Afrekenen</h2>
                <p className="empty">Je winkelmand is leeg.</p>
                <Link className="btn" href="/">Verder winkelen</Link>
            </div>
        );
    }

    /* ============== 1. Het afrekenformulier ============== */
    return (
        <div className="box">
            <h2>Afrekenen</h2>

            {/* Foutmelding van de server, als die er is */}
            {error && <p className="error">❌ {error}</p>}

            <form onSubmit={handleSubmit}>
                {/* Naam */}
                <div className="row">
                    <input className="input" placeholder="Voornaam" required
                        value={form.first_name} onChange={set("first_name")} />
                    <input className="input" placeholder="Achternaam" required
                        value={form.last_name} onChange={set("last_name")} />
                </div>

                {/* E-mail (type="email" laat de browser het formaat checken) */}
                <div className="row" style={{ marginTop: 8 }}>
                    <input className="input" type="email" placeholder="E-mail" required
                        value={form.email} onChange={set("email")} />
                </div>

                {/* Adres + postcode */}
                <div className="row" style={{ marginTop: 8 }}>
                    <input className="input" placeholder="Adres" required
                        value={form.address} onChange={set("address")} />
                    <input className="input" placeholder="Postcode" required
                        value={form.postal_code} onChange={set("postal_code")} />
                </div>

                {/* Stad + land */}
                <div className="row" style={{ marginTop: 8 }}>
                    <input className="input" placeholder="Stad" required
                        value={form.city} onChange={set("city")} />
                    <input className="input" placeholder="Land" required
                        value={form.country} onChange={set("country")} />
                </div>

                {/* Prijsoverzicht: kortingregels alleen tonen als er korting is */}
                <div className="total">
                    {discount && (
                        <>
                            <p>Origineel: <Price amount={cartTotal} /></p>
                            <p>Korting ({discount.code}): -<Price amount={discountAmount} /></p>
                        </>
                    )}
                    <strong>Totaal: <Price amount={newTotal} /></strong>
                </div>

                {/* disabled tijdens het versturen: voorkomt dubbele bestellingen */}
                <button className="btn" type="submit" disabled={busy}>
                    {busy ? "Bezig..." : "Bestellen"}
                </button>
            </form>
        </div>
    );
}
