"use client";

import { useState } from "react";
import Link from "next/link";
import { useShop } from "@/components/ShopProvider";
import Price from "@/components/Price";

// Afrekenen (F9) + orderbevestiging met uniek ordernummer (F13)
export default function CheckoutPage() {
    const { cart, cartTotal, discount, clearCart } = useShop();

    const [form, setForm] = useState({
        first_name: "", last_name: "", email: "",
        address: "", postal_code: "", city: "", country: "",
    });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [confirmation, setConfirmation] = useState(null);

    const discountAmount = discount ? cartTotal * discount.percent : 0;
    const newTotal = cartTotal - discountAmount;

    function set(field) {
        return (e) => setForm({ ...form, [field]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setBusy(true);

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer: form,
                    discountCode: discount?.code ?? "",
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
                setError(data.error || "Er ging iets mis bij het bestellen.");
                return;
            }

            // Bevestiging bewaren en mand leegmaken
            setConfirmation({ ...data, firstName: form.first_name });
            clearCart();
        } catch {
            setError("Kon geen verbinding maken met de server.");
        } finally {
            setBusy(false);
        }
    }

    /* ============== Bevestigingspagina na succesvolle bestelling (F13) ============== */
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

    /* ============== Lege mand ============== */
    if (cart.length === 0) {
        return (
            <div className="box">
                <h2>Afrekenen</h2>
                <p className="empty">Je winkelmand is leeg.</p>
                <Link className="btn" href="/">Verder winkelen</Link>
            </div>
        );
    }

    /* ============== Afrekenformulier ============== */
    return (
        <div className="box">
            <h2>Afrekenen</h2>

            {error && <p className="error">❌ {error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="row">
                    <input className="input" placeholder="Voornaam" required
                        value={form.first_name} onChange={set("first_name")} />
                    <input className="input" placeholder="Achternaam" required
                        value={form.last_name} onChange={set("last_name")} />
                </div>

                <div className="row" style={{ marginTop: 8 }}>
                    <input className="input" type="email" placeholder="E-mail" required
                        value={form.email} onChange={set("email")} />
                </div>

                <div className="row" style={{ marginTop: 8 }}>
                    <input className="input" placeholder="Adres" required
                        value={form.address} onChange={set("address")} />
                    <input className="input" placeholder="Postcode" required
                        value={form.postal_code} onChange={set("postal_code")} />
                </div>

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

                <button className="btn" type="submit" disabled={busy}>
                    {busy ? "Bezig..." : "Bestellen"}
                </button>
            </form>
        </div>
    );
}
