// Sousvide Cheat Sheet — tiny renderer.
// Loads data.json, renders category/item/profile tables, wires up search filter.

// Inline SVG icons per category id. Sourced from Lucide (lucide.dev), MIT.
// The sheep icon for `lamb` is a custom silhouette (potrace traced) — Lucide
// has no sheep/lamb icon. Add a new category to data.json → also add its icon here.
const SVG_ATTRS =
  'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

const ICONS = {
  beef: `<svg ${SVG_ATTRS}><path d="M16.4 13.7A6.5 6.5 0 1 0 6.28 6.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3"/><path d="m18.5 6 2.19 4.5a6.48 6.48 0 0 1-2.29 7.2C15.4 20.2 11 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5"/><circle cx="12.5" cy="8.5" r="2.5"/></svg>`,
  pork: `<svg ${SVG_ATTRS}><path d="M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z"/><path d="M16 10h.01"/><path d="M2 8v1a2 2 0 0 0 2 2h1"/></svg>`,
  poultry: `<svg ${SVG_ATTRS}><path d="M15.4 15.63a7.875 6 135 1 1 6.23-6.23 4.5 3.43 135 0 0-6.23 6.23"/><path d="m8.29 12.71-2.6 2.6a2.5 2.5 0 1 0-1.65 4.65A2.5 2.5 0 1 0 8.7 18.3l2.59-2.59"/></svg>`,
  lamb: `<svg viewBox="0 0 2600 2600" aria-hidden="true"><g transform="translate(0,2600) scale(0.1,-0.1)" fill="currentColor" stroke="none"><path d="M11930 23019 c-1021 -76 -1968 -499 -2684 -1199 -229 -224 -386 -410 -543 -643 -126 -188 -266 -440 -337 -606 l-27 -64 -62 7 c-506 56 -957 -3 -1414 -186 -626 -249 -1137 -721 -1434 -1323 -159 -323 -244 -657 -264 -1041 l-7 -132 -122 -80 c-746 -497 -1288 -1234 -1527 -2077 -97 -341 -133 -611 -133 -985 0 -344 26 -557 105 -875 224 -891 799 -1688 1588 -2200 l103 -67 -7 -121 c-11 -206 19 -493 76 -722 86 -344 253 -685 477 -975 89 -115 294 -324 420 -427 326 -270 762 -481 1170 -569 l83 -18 -8 -45 c-4 -25 -8 -811 -8 -1746 l0 -1700 28 -90 c98 -315 346 -543 663 -610 91 -19 256 -19 352 1 306 63 564 294 655 589 45 145 47 198 47 1323 l0 1064 137 -131 c602 -580 1354 -968 2178 -1125 1365 -260 2785 167 3782 1137 l122 119 4 -1119 c4 -1223 0 -1154 63 -1323 57 -152 209 -336 347 -418 150 -90 300 -132 469 -132 386 1 708 239 835 620 l28 85 0 1710 c0 941 -4 1728 -8 1751 l-8 40 83 18 c46 10 135 34 198 53 897 271 1586 952 1844 1823 71 240 99 438 100 723 l1 217 134 90 c931 627 1518 1581 1641 2670 30 269 23 620 -20 907 -82 564 -313 1131 -650 1599 -264 365 -667 746 -1026 970 l-71 44 -7 128 c-8 161 -21 269 -47 402 -185 965 -917 1759 -1895 2055 -368 112 -758 145 -1171 99 l-62 -7 -27 64 c-45 106 -167 338 -239 454 -316 511 -737 947 -1240 1282 -789 525 -1756 782 -2685 712z m740 -853 c459 -64 878 -202 1258 -417 585 -330 1038 -798 1332 -1374 89 -174 154 -342 241 -625 39 -129 73 -237 75 -239 2 -2 106 26 231 62 367 105 563 135 808 123 428 -20 792 -150 1123 -400 473 -359 744 -917 719 -1481 -3 -71 -16 -201 -27 -288 -12 -87 -20 -160 -18 -162 2 -3 87 -48 188 -101 228 -119 346 -192 503 -311 568 -427 961 -1045 1097 -1719 102 -513 49 -1092 -145 -1565 -204 -497 -522 -909 -952 -1232 -168 -127 -294 -204 -533 -326 -113 -57 -207 -106 -209 -108 -3 -2 10 -71 28 -154 52 -242 61 -306 68 -454 13 -305 -50 -587 -193 -865 -86 -167 -175 -290 -314 -433 -443 -459 -1067 -666 -1720 -571 -125 18 -163 27 -432 105 -113 32 -210 59 -215 59 -5 0 -26 -57 -47 -128 -149 -496 -256 -742 -460 -1052 -289 -438 -706 -819 -1181 -1077 -523 -284 -1069 -423 -1666 -423 -781 0 -1513 252 -2139 736 -142 109 -428 393 -539 534 -99 125 -230 320 -299 446 -119 215 -199 416 -302 757 -35 114 -68 207 -73 207 -5 0 -102 -27 -215 -59 -269 -78 -307 -87 -432 -105 -564 -82 -1122 66 -1550 411 -107 87 -274 263 -353 373 -90 126 -207 365 -251 510 -55 186 -70 290 -70 500 -1 198 4 239 61 507 20 95 35 174 32 177 -2 2 -76 40 -165 84 -196 98 -328 173 -459 263 -615 418 -1049 1050 -1204 1754 -58 265 -77 622 -47 885 73 630 340 1194 780 1648 267 275 494 440 885 641 89 46 161 88 161 95 0 6 -9 81 -20 166 -61 464 -18 762 161 1118 88 175 175 297 319 445 465 482 1144 690 1814 556 54 -11 202 -50 328 -86 126 -36 231 -64 232 -62 2 2 36 109 75 237 40 129 87 273 105 320 272 710 787 1300 1471 1683 404 226 853 370 1300 418 55 6 116 13 135 15 86 10 591 -3 700 -18z"/><path d="M12035 18264 c-16 -2 -73 -9 -125 -15 -430 -49 -885 -232 -1251 -505 l-86 -64 -1434 -2 -1434 -3 2 -90 c4 -176 66 -413 153 -585 94 -187 259 -387 425 -514 103 -80 143 -105 251 -159 316 -159 688 -199 1033 -111 52 13 96 22 98 20 2 -1 -5 -45 -16 -97 -47 -235 -46 -171 -46 -2014 0 -1406 3 -1757 13 -1830 72 -482 237 -879 526 -1265 86 -116 350 -382 466 -472 189 -146 438 -290 635 -368 436 -174 916 -234 1365 -170 943 134 1744 766 2093 1650 73 185 123 373 159 600 22 134 22 148 26 1740 4 1826 4 1818 -65 2189 -6 33 -6 34 23 27 181 -46 209 -50 409 -50 170 0 215 3 298 22 298 66 532 190 743 395 275 265 435 607 460 985 l7 102 -1427 0 -1427 0 -77 59 c-185 141 -449 286 -666 366 -207 76 -454 133 -675 155 -95 9 -386 12 -456 4z"/></g></svg>`,
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
    tdTime.textContent = formatTime(profile.time);

    tr.append(tdResult, tdTemp, tdTime);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  article.appendChild(table);

  if (item.source && item.source.url) {
    const sourceP = document.createElement("p");
    sourceP.className = "source";
    sourceP.append("Source: ");
    const a = document.createElement("a");
    a.href = item.source.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = item.source.name || "link";
    const arrow = document.createElement("span");
    arrow.className = "external-arrow";
    arrow.textContent = " ↗";
    a.appendChild(arrow);
    sourceP.appendChild(a);
    article.appendChild(sourceP);
  }

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
