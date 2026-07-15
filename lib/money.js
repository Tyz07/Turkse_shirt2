// ============================================================
// money.js — alles wat met prijzen en valuta te maken heeft
// ============================================================
// Alle prijzen staan in de database in EURO's.
// De Turkse lira-prijs wordt live berekend met de vaste koers hieronder.

// Wisselkoers 1 EUR = X TRY
export const EUR_TO_TRY = 53;

/**
 * Formatteert een bedrag (opgeslagen in EUR) in EUR of TRY.
 *
 * Voorbeelden:
 *   formatPrice(84.99)         -> "84,99 €"
 *   formatPrice(84.99, "TRY")  -> "4.504,47 ₺"   (84,99 x 53)
 *
 * @param {number} amount   - Het bedrag in euro's (bijv. 84.99)
 * @param {"EUR"|"TRY"} [currency] - Gewenste valuta, standaard "EUR"
 * @returns {string} Het geformatteerde bedrag met valutasymbool
 */
export function formatPrice(amount, currency = "EUR") {
    // Intl.NumberFormat zorgt voor de Nederlandse notatie:
    // punt voor duizendtallen, komma voor decimalen (1.234,56)
    const nf = new Intl.NumberFormat("nl-NL", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    if (currency === "TRY") {
        return nf.format(amount * EUR_TO_TRY) + " ₺";
    }
    return nf.format(amount) + " €";
}
