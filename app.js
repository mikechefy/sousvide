// Sousvide Cheat Sheet — tiny renderer.
// Loads data.json, renders category/item/profile tables, wires up search filter.

// Inline SVG icons per category id. Lucide/shadcn-style line icons.
// Add a new category to data.json → also add its icon here.
const ICONS = {
  beef: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 8c0-2.2 1.8-4 4-4h2c2.2 0 4 1.8 4 4v8c0 2.2-1.8 4-4 4h-2c-2.2 0-4-1.8-4-4z"/><circle cx="11" cy="11" r="1"/><circle cx="14" cy="14" r="0.8"/><path d="M11 16h2"/></svg>`,
  pork: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 6l3 2"/><path d="M19 6l-3 2"/><circle cx="12" cy="13" r="7"/><ellipse cx="12" cy="14" rx="3" ry="2"/><path d="M11 14h.01"/><path d="M13 14h.01"/></svg>`,
  poultry: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="9" cy="16" rx="5" ry="4"/><path d="M11.5 13l5-5"/><circle cx="18" cy="6.5" r="1.7"/><circle cx="15.5" cy="9" r="1.7"/></svg>`,
  lamb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="14" r="4"/><circle cx="7" cy="12" r="2.4"/><circle cx="17" cy="12" r="2.4"/><circle cx="9" cy="8" r="2"/><circle cx="15" cy="8" r="2"/><path d="M11 14h.01"/><path d="M13 14h.01"/></svg>`,
  fish: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12c2-2.5 5-4.5 8-4.5s6 2 8 4.5c-2 2.5-5 4.5-8 4.5s-6-2-8-4.5z"/><path d="M19 12l3-2v4z"/><path d="M7 11h.01"/></svg>`,
  eggs: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c-3.5 0-6.5 4.5-6.5 9 0 4.5 3 8 6.5 8s6.5-3.5 6.5-8c0-4.5-3-9-6.5-9z"/></svg>`,
  vegetables: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 7l-9 9c-1 1-1 3 0 4s3 1 4 0l9-9"/><path d="M14 7l3-3"/><path d="M14 7l5-1"/><path d="M18 11l3-3"/></svg>`,
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
