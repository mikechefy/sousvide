// Sousvide Cheat Sheet — tiny renderer.
// Loads data.json, renders category/item/profile tables, wires up search filter.

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

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();

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
