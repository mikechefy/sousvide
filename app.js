// Sousvide Cheat Sheet — tiny renderer.
// Loads data.json, renders category/item/profile tables, wires up search filter.

// Inline SVG icons per category id. Sourced from Lucide (lucide.dev), MIT.
// Lamb has no Lucide icon — using `bone` as a stand-in for bone-in cuts.
// Add a new category to data.json → also add its icon here.
const SVG_ATTRS =
  'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

const ICONS = {
  beef: `<svg ${SVG_ATTRS}><path d="M16.4 13.7A6.5 6.5 0 1 0 6.28 6.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3"/><path d="m18.5 6 2.19 4.5a6.48 6.48 0 0 1-2.29 7.2C15.4 20.2 11 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5"/><circle cx="12.5" cy="8.5" r="2.5"/></svg>`,
  pork: `<svg ${SVG_ATTRS}><path d="M13.144 21.144A7.274 10.445 45 1 0 2.856 10.856"/><path d="M13.144 21.144A7.274 4.365 45 0 0 2.856 10.856a7.274 4.365 45 0 0 10.288 10.288"/><path d="M16.565 10.435 18.6 8.4a2.501 2.501 0 1 0 1.65-4.65 2.5 2.5 0 1 0-4.66 1.66l-2.024 2.025"/><path d="m8.5 16.5-1-1"/></svg>`,
  poultry: `<svg ${SVG_ATTRS}><path d="M15.4 15.63a7.875 6 135 1 1 6.23-6.23 4.5 3.43 135 0 0-6.23 6.23"/><path d="m8.29 12.71-2.6 2.6a2.5 2.5 0 1 0-1.65 4.65A2.5 2.5 0 1 0 8.7 18.3l2.59-2.59"/></svg>`,
  lamb: `<svg ${SVG_ATTRS}><path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z"/></svg>`,
  fish: `<svg ${SVG_ATTRS}><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33"/><path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4"/><path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98"/></svg>`,
  eggs: `<svg ${SVG_ATTRS}><path d="M12 2C8 2 4 8 4 14a8 8 0 0 0 16 0c0-6-4-12-8-12"/></svg>`,
  vegetables: `<svg ${SVG_ATTRS}><path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46"/><path d="M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z"/><path d="M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.84 2-3.5C17 3.33 15 2 15 2z"/></svg>`,
};

(async function () {
  try {
    const res = await fetch("./data.json");
    if (!res.ok) throw new Error("Failed to load data.json");
    const data = await res.json();
    render(data);
    setupSearch();
  } catch (err) {
    const main = document.getElementById("content");
    const p = document.createElement("p");
    p.className = "noscript";
    p.textContent =
      "Could not load data.json. If viewing locally, serve the folder (e.g. `python3 -m http.server`).";
    main.appendChild(p);
    console.error(err);
  }
})();

function formatTime(min) {
  if (min < 60) return `${min}m`;
  const h = min / 60;
  if (Number.isInteger(h)) return `${h}h`;
  const whole = Math.floor(h);
  const rem = min - whole * 60;
  return `${whole}h ${rem}m`;
}

function formatTimeRange(min, max) {
  if (min === max) return formatTime(min);
  if (max < 60) return `${min}–${max}m`;
  const minH = min / 60;
  const maxH = max / 60;
  if (Number.isInteger(minH) && Number.isInteger(maxH) && min >= 60) {
    return `${minH}–${maxH}h`;
  }
  return `${formatTime(min)} – ${formatTime(max)}`;
}

function render(data) {
  const main = document.getElementById("content");

  main.appendChild(buildPicker(data.categories));

  data.categories.forEach((cat) => {
    const section = document.createElement("section");
    section.className = "category";
    section.id = cat.id;

    const h2 = document.createElement("h2");
    h2.textContent = cat.name;
    section.appendChild(h2);

    cat.items.forEach((item) => {
      section.appendChild(buildItem(item, cat.name));
    });

    main.appendChild(section);
  });

  const disclaimer = document.getElementById("disclaimer");
  const meta = document.getElementById("meta");
  if (data.meta) {
    if (data.meta.disclaimer) disclaimer.textContent = data.meta.disclaimer;
    if (data.meta.updated && data.meta.version) {
      meta.textContent = `Updated ${data.meta.updated} · v${data.meta.version}`;
    }
  }
}

function buildPicker(categories) {
  const nav = document.createElement("nav");
  nav.className = "picker";
  nav.setAttribute("aria-label", "Jump to category");

  categories.forEach((cat) => {
    const a = document.createElement("a");
    a.href = `#${cat.id}`;

    const iconWrap = document.createElement("span");
    iconWrap.className = "picker-icon";
    iconWrap.innerHTML = ICONS[cat.id] || "";

    const label = document.createElement("span");
    label.textContent = cat.name;

    a.append(iconWrap, label);
    nav.appendChild(a);
  });

  return nav;
}

function buildItem(item, categoryName) {
  const article = document.createElement("article");
  article.className = "item";

  // Build a haystack for search matching.
  const haystack = [
    item.cut,
    categoryName,
    item.notes || "",
    ...(item.profiles || []).map((p) => p.result),
  ]
    .join(" ")
    .toLowerCase();
  article.dataset.search = haystack;

  const h3 = document.createElement("h3");
  h3.textContent = item.cut;
  article.appendChild(h3);

  if (item.notes) {
    const p = document.createElement("p");
    p.className = "notes";
    p.textContent = item.notes;
    article.appendChild(p);
  }

  const table = document.createElement("table");
  table.className = "profiles";
  const tbody = document.createElement("tbody");

  (item.profiles || []).forEach((profile) => {
    const tr = document.createElement("tr");
    if (profile.recommended) tr.className = "recommended";

    const tdResult = document.createElement("td");
    tdResult.className = "result";
    tdResult.textContent = profile.result;

    const tdTemp = document.createElement("td");
    tdTemp.className = "temp";
    tdTemp.textContent = `${profile.tempC}°C`;

    const tdTime = document.createElement("td");
    tdTime.className = "time";
    tdTime.textContent = formatTimeRange(profile.timeMin, profile.timeMax);

    tr.append(tdResult, tdTemp, tdTime);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  article.appendChild(table);
  return article;
}

function setupSearch() {
  const input = document.getElementById("search");
  if (!input) return;

  const picker = document.querySelector(".picker");

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();

    if (picker) picker.hidden = !!q;

    document.querySelectorAll(".item").forEach((el) => {
      const match = !q || el.dataset.search.includes(q);
      el.hidden = !match;
    });

    document.querySelectorAll(".category").forEach((cat) => {
      const anyVisible = Array.from(cat.querySelectorAll(".item")).some(
        (i) => !i.hidden
      );
      cat.hidden = !anyVisible;
    });
  });
}
