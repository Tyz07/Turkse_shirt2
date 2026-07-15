// Wisselkoers 1 EUR = X TRY
export const EUR_TO_TRY = 53;

// Formatteert een bedrag (opgeslagen in EUR) in EUR of TRY met NL-notatie.
export function formatPrice(amount, currency = "EUR") {
    const nf = new Intl.NumberFormat("nl-NL", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    if (currency === "TRY") {
        return nf.format(amount * EUR_TO_TRY) + " ₺";
    }
    return nf.format(amount) + " €";
}
