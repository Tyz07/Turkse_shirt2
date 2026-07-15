# Turkse Voetbalshop 2

Webshop voor Turkse voetbalshirts, gebouwd met **Next.js** (App Router) en **MySQL**.

## Functionele eisen

| Nr  | Eis                                                            | Waar te vinden                          |
|-----|----------------------------------------------------------------|-----------------------------------------|
| F1  | Producten bekijken                                             | Homepagina (productgrid)                |
| F2  | Productdetails zien                                            | Klik op foto/titel → detailpagina       |
| F3  | Zoeken                                                         | Zoekbalk bovenaan de homepagina         |
| F4  | Filteren                                                       | Club-dropdown + min/max prijs           |
| F5  | Maat kiezen                                                    | Maat-dropdown bij elk product           |
| F6  | Naam op het shirt (bedrukking)                                 | Tekstveld bij elk product               |
| F7  | Product in de winkelwagen plaatsen                             | Knop "In mand"                          |
| F8  | Product verwijderen uit de winkelwagen                         | Knop "Verwijder" (of aantal op 0)       |
| F9  | Bestelling plaatsen                                            | Winkelmand → Afrekenen                  |
| F10 | Prijs wisselen tussen Euro (€) en Turkse Lira (₺)              | Knoppen rechtsboven in de header        |
| F11 | Kortingscode toepassen in de winkelwagen                       | `KORTING10` (10%) of `KORTING20` (20%)  |
| F12 | Producten toevoegen aan een verlanglijstje                     | Hartje op elk product                   |
| F13 | Orderbevestiging met uniek ordernummer                         | Na het bestellen (bijv. TVS-20260715-8K3F9Q) |

## Technische opbouw

- **Next.js 15** (App Router, JavaScript) — pagina's in `app/`, herbruikbare componenten in `components/`
- **MySQL** via `mysql2` — producten, maten/voorraad en bestellingen
- Winkelmand, verlanglijst, valuta en korting worden client-side bewaard in `localStorage` (via React Context in `components/ShopProvider.js`)
- Bestellingen worden server-side gevalideerd en opgeslagen via `POST /api/orders` (prijzen komen altijd uit de database, nooit uit de browser)

## Installatie

Vereisten: Node.js 18+, een draaiende MySQL-server (bijv. XAMPP) met gebruiker `root` zonder wachtwoord (aanpasbaar in `.env.local`).

```bash
npm install          # dependencies installeren
npm run setup-db     # database 'voetbalshop2' aanmaken en vullen
npm run dev          # ontwikkelserver starten op http://localhost:3000
```

## Database

Schema en testdata staan in `db/init.sql`:

- `products` — shirts (naam, prijs, club, kleur, afbeelding, omschrijving)
- `product_variants` — voorraad per maat (S t/m XXL)
- `orders` — geplaatste bestellingen met uniek ordernummer
- `order_items` — bestelde regels (incl. maat en bedrukking)

Prijzen staan in euro's; de lira-prijs wordt berekend met een vaste koers (1 € = 53 ₺, zie `lib/money.js`).
