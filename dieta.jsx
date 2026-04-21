import { useState } from "react";

const dietData = [
  {
    category: "Carboidrati",
    icon: "🍞",
    items: [
      { name: "Rosetta", portion: "120g", kcal: 340 },
      { name: "Basmati cotto", portion: "150g", kcal: 200 },
      { name: "Basmati cotto", portion: "200g", kcal: 270 },
      { name: "Taralli", portion: "1 pacchetto", kcal: 280 },
      { name: "Gnocchi", portion: "200g", kcal: 300 },
    ],
  },
  {
    category: "Carne",
    icon: "🍗",
    items: [
      { name: "Pollo", portion: "150g", kcal: 165 },
    ],
  },
  {
    category: "Pesce",
    icon: "🐟",
    items: [
      { name: "Gratinato alle erbe", portion: "½ vaschetta", kcal: 400 },
      { name: "Gratinato ai ceci", portion: "½ vaschetta", kcal: 350 },
      { name: "Gratinato patate/rosmarino", portion: "½ vaschetta", kcal: 240 },
      { name: "Tonno non sgocciolato", portion: "1 scatola", kcal: 200 },
      { name: "Tonno filo d'olio", portion: "1 scatola", kcal: 150 },
    ],
  },
  {
    category: "Uova",
    icon: "🥚",
    items: [{ name: "Uova strapazzate", portion: "2 uova", kcal: 230 }],
  },
  {
    category: "Secondi vegetali",
    icon: "🥬",
    items: [
      { name: "Dischetti spinaci/zuccarota", portion: "1 pezzo", kcal: 83 },
      { name: "Cotoletta vegetale", portion: "1 pezzo", kcal: 220 },
      { name: "Straccetti di soia al sugo", portion: "1 porzione", kcal: 390 },
      { name: "Tofu al naturale", portion: "1 porzione", kcal: 190 },
    ],
  },
  {
    category: "Legumi",
    icon: "🍲",
    items: [{ name: "Borlotti", portion: "1 lattina", kcal: 120 }],
  },
  {
    category: "Contorni",
    icon: "🥦",
    items: [
      { name: "Contorno leggerezza", portion: "225g", kcal: 60 },
      { name: "Contorno tricolore", portion: "225g", kcal: 55 },
    ],
  },
  {
    category: "Formaggi",
    icon: "🧀",
    items: [
      { name: "Mozzarella", portion: "1 pezzo", kcal: 300 },
      { name: "Parmigiano", portion: "10g", kcal: 40 },
    ],
  },
  {
    category: "Condimenti",
    icon: "🍅",
    items: [
      { name: "Passata", portion: "300g", kcal: 90 },
      { name: "Curry sauce", portion: "1 porzione", kcal: 300 },
      { name: "Tikka masala sauce", portion: "1 porzione", kcal: 200 },
      { name: "Olio", portion: "10g", kcal: 90 },
    ],
  },
  {
    category: "Merende",
    icon: "🥄",
    items: [
      { name: "Yogurt bianco", portion: "1 vasetto", kcal: 50 },
      { name: "Mela gialla", portion: "1 medio-piccola", kcal: 67 },
    ],
  },
  {
    category: "Altro",
    icon: "🥟",
    items: [
      { name: "Bao", portion: "1 pezzo", kcal: 375 },
      { name: "Ravioli vapore arancioni", portion: "1 pezzo", kcal: 36 },
    ],
  },
  {
    category: "Fritti",
    icon: "🍟",
    items: [
      { name: "Cotoletta pollo Aia", portion: "1 pezzo", kcal: 200 },
      { name: "Patatine fritte", portion: "200g", kcal: 280 },
      { name: "Sofficino alla pizzaiola", portion: "1 pezzo", kcal: 144 },
    ],
  },
  {
    category: "Alcol",
    icon: "🍺",
    items: [
      { name: "Tennent's Super grande", portion: "44cl", kcal: 320 },
      { name: "Tennent's Super piccola", portion: "35.5cl", kcal: 260 },
    ],
  },
];

function KcalBar({ kcal, max }) {
  const pct = Math.min((kcal / max) * 100, 100);
  let color = "#4ade80";
  if (kcal > 400) color = "#f87171";
  else if (kcal > 250) color = "#fbbf24";
  return (
    <div
      style={{
        width: "100%",
        height: 6,
        borderRadius: 3,
        background: "var(--bar-bg)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          borderRadius: 3,
          background: color,
          transition: "width .4s ease",
        }}
      />
    </div>
  );
}

export default function Dieta() {
  const [openIdx, setOpenIdx] = useState(null);
  const maxKcal = 800;

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        maxWidth: 520,
        margin: "0 auto",
        padding: "24px 12px",
        color: "var(--text)",
        "--text": "#e4e4e7",
        "--text-dim": "#a1a1aa",
        "--surface": "#1c1c22",
        "--surface-hover": "#26262e",
        "--border": "#2e2e38",
        "--bar-bg": "#27272a",
        "--accent": "#a78bfa",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          margin: "0 0 4px",
          letterSpacing: "-0.02em",
        }}
      >
        La Mia Dieta
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-dim)", margin: "0 0 20px" }}>
        {dietData.reduce((s, c) => s + c.items.length, 0)} alimenti ·{" "}
        {dietData.length} categorie
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {dietData.map((cat, i) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={i}
              style={{
                background: "var(--surface)",
                borderRadius: 10,
                border: "1px solid var(--border)",
                overflow: "hidden",
                transition: "background .15s",
              }}
            >
              <button
                onClick={() => toggle(i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  border: "none",
                  background: "transparent",
                  color: "var(--text)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 14,
                  fontWeight: 600,
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{cat.icon}</span>
                <span style={{ flex: 1 }}>{cat.category}</span>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-dim)",
                    fontWeight: 400,
                  }}
                >
                  {cat.items.length}{" "}
                  {cat.items.length === 1 ? "alimento" : "alimenti"}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    transition: "transform .2s",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    color: "var(--text-dim)",
                  }}
                >
                  ▼
                </span>
              </button>

              {isOpen && (
                <div style={{ padding: "0 14px 12px" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 13,
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          color: "var(--text-dim)",
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        <th
                          style={{
                            textAlign: "left",
                            padding: "4px 0 8px",
                            fontWeight: 500,
                          }}
                        >
                          Alimento
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "4px 0 8px",
                            fontWeight: 500,
                          }}
                        >
                          Porzione
                        </th>
                        <th
                          style={{
                            textAlign: "right",
                            padding: "4px 0 8px",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Kcal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.items.map((item, j) => (
                        <tr
                          key={j}
                          style={{
                            borderTop: "1px solid var(--border)",
                          }}
                        >
                          <td style={{ padding: "10px 8px 10px 0" }}>
                            {item.name}
                          </td>
                          <td
                            style={{
                              padding: "10px 8px",
                              color: "var(--text-dim)",
                            }}
                          >
                            {item.portion}
                          </td>
                          <td
                            style={{
                              padding: "10px 0 10px 8px",
                              textAlign: "right",
                            }}
                          >
                            <div>
                              <span style={{ fontWeight: 600 }}>
                                {item.kcal}
                              </span>
                              <div style={{ marginTop: 4 }}>
                                <KcalBar kcal={item.kcal} max={maxKcal} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: "10px 14px",
          background: "var(--surface)",
          borderRadius: 10,
          border: "1px solid var(--border)",
          fontSize: 11,
          color: "var(--text-dim)",
          display: "flex",
          gap: 16,
          justifyContent: "center",
        }}
      >
        <span>
          🟢 {"<"}250
        </span>
        <span>🟡 250–400</span>
        <span>🔴 {">"} 400</span>
      </div>
    </div>
  );
}
