const data = window.TRIP_DATA;

const storageKey = "bangkokSingaporeTripDashboardEdits";
const statusChoices = ["Not Yet", "Planned Night", "Visited", "Maybe", "Closed", "Cut"];
const priorityOrder = {
  Legendary: 0,
  Must: 1,
  Strong: 2,
  Maybe: 3,
  Flexible: 4,
  Skip: 5,
};
const mapBounds = {
  Bangkok: { latMin: 12.9, latMax: 13.82, lngMin: 100.45, lngMax: 100.8 },
  Singapore: { latMin: 1.22, latMax: 1.38, lngMin: 103.78, lngMax: 103.97 },
};
const mapLabels = {
  Bangkok: [
    { label: "Song Wat", x: 18, y: 28 },
    { label: "Thong Lo", x: 72, y: 44 },
    { label: "Phrom Phong", x: 56, y: 48 },
    { label: "Sathorn", x: 43, y: 62 },
    { label: "Old Town", x: 20, y: 56 },
  ],
  Singapore: [
    { label: "Orchard", x: 30, y: 44 },
    { label: "City Hall", x: 52, y: 54 },
    { label: "Kampong Glam", x: 62, y: 46 },
    { label: "Chinatown", x: 38, y: 68 },
    { label: "Joo Chiat", x: 79, y: 42 },
  ],
};

const state = {
  filters: {
    search: "",
    city: "All",
    area: "All",
    category: "All",
    mood: "All",
    price: "All",
    priority: "All",
    status: "All",
    porkSafeOnly: false,
    classPassOnly: false,
  },
  edits: loadEdits(),
  mapCity: "Bangkok",
  activePlaceId: null,
  editingPlaceId: null,
};

const elements = {
  summaryRow: document.getElementById("summaryRow"),
  spotlightStack: document.getElementById("spotlightStack"),
  day1Timeline: document.getElementById("day1Timeline"),
  plannerGrid: document.getElementById("plannerGrid"),
  sectionsRoot: document.getElementById("sectionsRoot"),
  mapCityTabs: document.getElementById("mapCityTabs"),
  mapCanvas: document.getElementById("mapCanvas"),
  exportCsvButton: document.getElementById("exportCsvButton"),
  resetFiltersButton: document.getElementById("resetFiltersButton"),
  editorModal: document.getElementById("editorModal"),
  closeModalButton: document.getElementById("closeModalButton"),
  modalTitle: document.getElementById("modalTitle"),
  modalMeta: document.getElementById("modalMeta"),
  editorForm: document.getElementById("editorForm"),
  resetPlaceButton: document.getElementById("resetPlaceButton"),
  editStatus: document.getElementById("editStatus"),
  editVisited: document.getElementById("editVisited"),
  editRating: document.getElementById("editRating"),
  editReview: document.getElementById("editReview"),
  editWouldReturn: document.getElementById("editWouldReturn"),
  editNotes: document.getElementById("editNotes"),
  filters: {
    search: document.getElementById("searchFilter"),
    city: document.getElementById("cityFilter"),
    area: document.getElementById("areaFilter"),
    category: document.getElementById("categoryFilter"),
    mood: document.getElementById("moodFilter"),
    price: document.getElementById("priceFilter"),
    priority: document.getElementById("priorityFilter"),
    status: document.getElementById("statusFilter"),
    porkSafeOnly: document.getElementById("porkSafeOnly"),
    classPassOnly: document.getElementById("classPassOnly"),
  },
};

init();

function init() {
  populateStatusSelect(elements.editStatus, statusChoices);
  populateFilterOptions();
  bindEvents();
  renderAll();
}

function bindEvents() {
  Object.entries(elements.filters).forEach(([key, control]) => {
    const eventName = control.type === "checkbox" ? "change" : "input";
    control.addEventListener(eventName, () => {
      state.filters[key] = control.type === "checkbox" ? control.checked : control.value;
      if (key === "city") {
        adjustMapCityForFilter();
      }
      renderAll();
    });
  });

  elements.exportCsvButton.addEventListener("click", exportEditsCsv);
  elements.resetFiltersButton.addEventListener("click", resetFilters);
  elements.closeModalButton.addEventListener("click", closeModal);
  elements.editorModal.addEventListener("click", (event) => {
    if (event.target.dataset.closeModal === "true") {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.editorModal.classList.contains("hidden")) {
      closeModal();
    }
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-edit-place]");
    if (trigger) {
      openEditor(trigger.dataset.editPlace);
    }
  });

  elements.editorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    savePlaceEdits();
  });

  elements.resetPlaceButton.addEventListener("click", resetPlaceEdits);
}

function loadEdits() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "{}");
  } catch {
    return {};
  }
}

function saveEdits() {
  localStorage.setItem(storageKey, JSON.stringify(state.edits));
}

function getPlaceById(id) {
  return data.places.find((place) => place.id === id);
}

function getPlaceView(place) {
  const edits = state.edits[place.id] || {};
  const visited = edits.visited ?? place.defaults?.visited ?? false;
  const baseStatus = edits.status || place.status;
  const derivedStatus =
    visited && !["Closed", "Cut"].includes(baseStatus) ? "Visited" : baseStatus;
  return {
    ...place,
    edits,
    visited,
    effectiveStatus: derivedStatus,
    myRating: edits.myRating ?? place.defaults?.myRating ?? "",
    review: edits.review ?? place.defaults?.review ?? "",
    wouldReturn: edits.wouldReturn ?? place.defaults?.wouldReturn ?? "",
    personalNotes: edits.notes ?? place.defaults?.notes ?? "",
  };
}

function getAllPlaces() {
  return data.places.map(getPlaceView);
}

function matchesFilter(place) {
  const { filters } = state;
  const searchTarget = [
    place.name,
    place.city,
    place.area,
    place.category,
    place.bestFor,
    place.doOrder,
    place.notes,
  ]
    .join(" ")
    .toLowerCase();
  if (filters.search && !searchTarget.includes(filters.search.toLowerCase().trim())) {
    return false;
  }
  if (filters.city !== "All" && place.city !== filters.city && place.cityGroup !== filters.city) {
    return false;
  }
  if (filters.area !== "All" && place.area !== filters.area) {
    return false;
  }
  if (filters.category !== "All" && place.category !== filters.category) {
    return false;
  }
  if (filters.mood !== "All" && place.mood !== filters.mood) {
    return false;
  }
  if (filters.price !== "All" && place.price !== filters.price) {
    return false;
  }
  if (filters.priority !== "All" && place.priority !== filters.priority) {
    return false;
  }
  if (filters.status !== "All" && place.effectiveStatus !== filters.status) {
    return false;
  }
  if (filters.porkSafeOnly && place.porkFriendly !== "Yes") {
    return false;
  }
  if (filters.classPassOnly && !String(place.classPass).includes("Yes")) {
    return false;
  }
  return true;
}

function getFilteredPlaces() {
  return getAllPlaces().filter(matchesFilter).sort(sortPlaces);
}

function sortPlaces(a, b) {
  const priorityDelta = (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99);
  if (priorityDelta !== 0) return priorityDelta;
  const scoreA = Number(a.score || 0);
  const scoreB = Number(b.score || 0);
  if (scoreB !== scoreA) return scoreB - scoreA;
  return a.name.localeCompare(b.name);
}

function renderAll() {
  const filtered = getFilteredPlaces();
  if (filtered.length && !filtered.some((place) => place.cityGroup === state.mapCity)) {
    state.mapCity = filtered[0].cityGroup;
  }
  syncFilterControls();
  renderSummary(filtered);
  renderSpotlights(filtered);
  renderDay1();
  renderPlanner();
  renderMapTabs(filtered);
  renderMap(filtered);
  renderSections(filtered);
}

function renderSummary(filtered) {
  const plannedNight = filtered.filter((place) => place.effectiveStatus === "Planned Night").length;
  const porkSafe = filtered.filter((place) => place.porkFriendly === "Yes").length;
  const singapore = filtered.filter((place) => place.cityGroup === "Singapore").length;
  const classPass = filtered.filter((place) => String(place.classPass).includes("Yes")).length;
  const closedOrCut = filtered.filter((place) =>
    ["Closed", "Cut"].includes(place.effectiveStatus)
  ).length;

  const cards = [
    {
      label: "Visible Picks",
      value: filtered.length,
      note: "What matches your current filters right now.",
    },
    {
      label: "Planned Night",
      value: plannedNight,
      note: "Tichuca stays front and center.",
    },
    {
      label: "No-Pork Friendly",
      value: porkSafe,
      note: "Entries already marked safe.",
    },
    {
      label: "Singapore",
      value: singapore,
      note: "Short-trip items held separately too.",
    },
    {
      label: "ClassPass",
      value: classPass,
      note: `${closedOrCut} closed or cut items kept in view for context.`,
    },
  ];

  elements.summaryRow.innerHTML = cards
    .map(
      (card) => `
        <article class="summary-card">
          <p class="summary-label">${escapeHtml(card.label)}</p>
          <p class="summary-value">${escapeHtml(String(card.value))}</p>
          <p class="summary-note">${escapeHtml(card.note)}</p>
        </article>
      `
    )
    .join("");
}

function renderSpotlights(filtered) {
  const spotlightIds = ["tichuca-rooftop-bar-night", "song-wat-neighborhood-crawl", "eveandboy"];
  const spotlightPlaces = spotlightIds
    .map((id) => filtered.find((place) => place.id === id) || getAllPlaces().find((place) => place.id === id))
    .filter(Boolean);

  elements.spotlightStack.innerHTML = spotlightPlaces
    .map(
      (place) => `
        <article class="spotlight-item">
          <div class="card-chips">
            ${renderStatusPill(place.effectiveStatus)}
            <span class="chip priority">${escapeHtml(place.priority)}</span>
          </div>
          <h3>${escapeHtml(place.name)}</h3>
          <p class="card-subtitle">${escapeHtml(place.city)} · ${escapeHtml(place.area)}</p>
          <p class="card-notes">${escapeHtml(place.notes)}</p>
          <div class="card-actions">
            <button class="card-button" type="button" data-edit-place="${escapeHtml(place.id)}">
              Edit trip log
            </button>
            ${place.sourceUrl ? `<a class="card-button link" href="${escapeAttribute(place.sourceUrl)}" target="_blank" rel="noreferrer">Open source</a>` : ""}
          </div>
        </article>
      `
    )
    .join("");

}

function renderDay1() {
  elements.day1Timeline.innerHTML = data.day1
    .map(
      (item) => `
        <article class="timeline-item">
          <div class="timeline-time">${escapeHtml(item.Time)}</div>
          <div>
            <h3>${escapeHtml(item.Plan)}</h3>
            <p class="card-subtitle">${escapeHtml(item.Area)} · ${escapeHtml(item.Mood)}</p>
            <p class="card-notes">${escapeHtml(item.Notes)}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderPlanner() {
  const highlights = data.dailyPlanner.filter((entry) =>
    ["2026-07-09", "2026-07-11", "2026-07-13", "TBD"].includes(entry.Date)
  );
  elements.plannerGrid.innerHTML = highlights
    .map(
      (entry) => `
        <article class="planner-item">
          <div>
            <p class="planner-date">${escapeHtml(entry.Date)}</p>
            <h3>${escapeHtml(entry.Mood)}</h3>
          </div>
          <div class="card-meta">
            <div><strong>Morning:</strong> ${escapeHtml(entry.Morning)}</div>
            <div><strong>Afternoon:</strong> ${escapeHtml(entry.Afternoon)}</div>
            <div><strong>Night:</strong> ${escapeHtml(entry.Night)}</div>
          </div>
          <p class="card-notes">${escapeHtml(entry.Notes)}</p>
        </article>
      `
    )
    .join("");
}

function renderMapTabs(filtered) {
  const counts = ["Bangkok", "Singapore"].map((city) => ({
    city,
    count: filtered.filter((place) => place.cityGroup === city).length,
  }));
  elements.mapCityTabs.innerHTML = counts
    .map(
      ({ city, count }) => `
        <button class="map-tab ${state.mapCity === city ? "active" : ""}" type="button" data-map-city="${city}">
          ${escapeHtml(city)} (${count})
        </button>
      `
    )
    .join("");

  elements.mapCityTabs.querySelectorAll("[data-map-city]").forEach((button) => {
    button.addEventListener("click", () => {
      state.mapCity = button.dataset.mapCity;
      state.activePlaceId = null;
      renderMap(filtered);
      renderMapTabs(filtered);
    });
  });
}

function renderMap(filtered) {
  const city = state.mapCity;
  const places = filtered.filter((place) => place.cityGroup === city);
  const fallbackPlace = places[0] || null;
  if (!state.activePlaceId || !places.some((place) => place.id === state.activePlaceId)) {
    state.activePlaceId = fallbackPlace?.id || null;
  }

  const labelsMarkup = mapLabels[city]
    .map(
      (item) =>
        `<div class="map-label" style="left:${item.x}%; top:${item.y}%;">${escapeHtml(item.label)}</div>`
    )
    .join("");

  const pinsMarkup = places
    .map((place) => {
      const { left, top } = projectToMap(city, place.lat, place.lng);
      const pinClass = getPinClass(place);
      return `
        <button
          class="pin-button ${pinClass} ${state.activePlaceId === place.id ? "active" : ""}"
          type="button"
          data-map-place="${escapeHtml(place.id)}"
          style="left:${left}%; top:${top}%; transform: translate(-50%, -50%);"
          aria-label="${escapeAttribute(place.name)}"
        ></button>
      `;
    })
    .join("");

  const activePlace = places.find((place) => place.id === state.activePlaceId) || null;
  const popupMarkup = activePlace ? renderMapPopup(city, activePlace) : "";

  elements.mapCanvas.innerHTML = `
    ${labelsMarkup}
    ${pinsMarkup}
    ${popupMarkup}
  `;

  elements.mapCanvas.querySelectorAll("[data-map-place]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activePlaceId = button.dataset.mapPlace;
      renderMap(filtered);
    });
  });
}

function renderMapPopup(city, place) {
  const { left, top } = projectToMap(city, place.lat, place.lng);
  const popupLeft = Math.min(Math.max(left + 4, 4), 58);
  const popupTop = Math.min(Math.max(top - 8, 8), 62);
  return `
    <div class="pin-popup" style="left:${popupLeft}%; top:${popupTop}%;">
      <div class="card-chips">
        ${renderStatusPill(place.effectiveStatus)}
        <span class="chip">${escapeHtml(place.category)}</span>
      </div>
      <h3>${escapeHtml(place.name)}</h3>
      <p>${escapeHtml(place.area)} · ${escapeHtml(place.bestFor || place.notes)}</p>
      <div class="card-actions" style="margin-top:12px;">
        <button class="card-button" type="button" data-edit-place="${escapeHtml(place.id)}">Edit</button>
        ${place.sourceUrl ? `<a class="card-button link" href="${escapeAttribute(place.sourceUrl)}" target="_blank" rel="noreferrer">Open source</a>` : ""}
      </div>
    </div>
  `;
}

function projectToMap(city, lat, lng) {
  const bounds = mapBounds[city];
  const left = ((lng - bounds.lngMin) / (bounds.lngMax - bounds.lngMin)) * 84 + 8;
  const top = (1 - (lat - bounds.latMin) / (bounds.latMax - bounds.latMin)) * 74 + 10;
  return {
    left: clamp(left, 8, 92),
    top: clamp(top, 10, 88),
  };
}

function renderSections(filtered) {
  const sections = data.focusSections.map((section) => {
    let records = filtered.filter((place) => place.sections.includes(section.id));
    if (section.id === "Skip/Reconsider") {
      records = filtered.filter(
        (place) =>
          place.sections.includes(section.id) ||
          ["Closed", "Cut"].includes(place.effectiveStatus) ||
          ["No", "No/Verify"].includes(place.porkFriendly)
      );
    }
    return { ...section, records };
  });

  elements.sectionsRoot.innerHTML = sections
    .map(
      (section) => `
        <article class="section-card">
          <div class="section-title-row">
            <div>
              <p class="eyebrow">${escapeHtml(section.label)}</p>
              <h2>${escapeHtml(section.label)}</h2>
            </div>
            <span class="count-pill">${section.records.length} visible</span>
          </div>
          ${
            section.records.length
              ? `<div class="section-grid">${section.records.map(renderCard).join("")}</div>`
              : `<div class="empty-state">No places match these filters in ${escapeHtml(section.label)} right now.</div>`
          }
        </article>
      `
    )
    .join("");

}

function renderCard(place) {
  const visiblePorkNote =
    place.porkFriendly !== "Yes"
      ? `Pork note: ${place.porkFriendly}. ${place.doOrder || place.notes}`
      : `No-pork note: ${place.doOrder || "No specific dietary note added yet."}`;

  return `
    <article class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">${escapeHtml(place.name)}</h3>
          <p class="card-subtitle">${escapeHtml(place.city)} · ${escapeHtml(place.area)}</p>
        </div>
        ${renderStatusPill(place.effectiveStatus)}
      </div>
      <div class="card-chips">
        <span class="chip priority">${escapeHtml(place.priority)}</span>
        <span class="chip">${escapeHtml(place.price)}</span>
        <span class="chip">${escapeHtml(place.mood)}</span>
        ${
          String(place.classPass).includes("Yes")
            ? `<span class="chip classpass">ClassPass ${escapeHtml(String(place.classPass))}</span>`
            : ""
        }
        ${
          place.porkFriendly !== "Yes"
            ? `<span class="chip pork-caution">${escapeHtml(place.porkFriendly)}</span>`
            : `<span class="chip">Pork-safe</span>`
        }
      </div>
      <div class="card-meta">
        <div><strong>Best for:</strong> ${escapeHtml(place.bestFor || "Flexible stop")}</div>
        <div><strong>Order / do:</strong> ${escapeHtml(place.doOrder || "Use the notes + source link")}</div>
        <div><strong>Reservation:</strong> ${escapeHtml(place.reservation)}</div>
        ${place.myRating ? `<div><strong>Your rating:</strong> ${escapeHtml(String(place.myRating))}</div>` : ""}
        ${place.wouldReturn ? `<div><strong>Would return:</strong> ${escapeHtml(place.wouldReturn)}</div>` : ""}
      </div>
      <p class="card-notes">${escapeHtml(place.notes)}</p>
      <p class="note-row">${escapeHtml(visiblePorkNote)}</p>
      ${place.personalNotes ? `<p class="note-row"><strong>Your notes:</strong> ${escapeHtml(place.personalNotes)}</p>` : ""}
      <div class="card-actions">
        <button class="card-button" type="button" data-edit-place="${escapeHtml(place.id)}">
          Edit fields
        </button>
        ${place.sourceUrl ? `<a class="card-button link" href="${escapeAttribute(place.sourceUrl)}" target="_blank" rel="noreferrer">Source</a>` : ""}
      </div>
    </article>
  `;
}

function openEditor(placeId) {
  const place = getPlaceView(getPlaceById(placeId));
  state.editingPlaceId = placeId;
  elements.modalTitle.textContent = place.name;
  elements.modalMeta.textContent = `${place.city} · ${place.area} · Default status: ${place.status}`;
  elements.editStatus.value = place.edits.status || place.effectiveStatus || "Not Yet";
  elements.editVisited.checked = place.visited;
  elements.editRating.value = place.myRating;
  elements.editReview.value = place.review;
  elements.editWouldReturn.value = place.wouldReturn;
  elements.editNotes.value = place.personalNotes;
  elements.editorModal.classList.remove("hidden");
  elements.editorModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  elements.editorModal.classList.add("hidden");
  elements.editorModal.setAttribute("aria-hidden", "true");
  state.editingPlaceId = null;
}

function savePlaceEdits() {
  if (!state.editingPlaceId) return;
  state.edits[state.editingPlaceId] = {
    status: elements.editStatus.value,
    visited: elements.editVisited.checked,
    myRating: elements.editRating.value,
    review: elements.editReview.value,
    wouldReturn: elements.editWouldReturn.value,
    notes: elements.editNotes.value,
  };
  saveEdits();
  closeModal();
  renderAll();
}

function resetPlaceEdits() {
  if (!state.editingPlaceId) return;
  delete state.edits[state.editingPlaceId];
  saveEdits();
  closeModal();
  renderAll();
}

function exportEditsCsv() {
  const rows = [
    ["ID", "Name", "City", "Status", "Visited", "My Rating", "Review", "Would Return", "Notes"],
  ];
  getAllPlaces().forEach((place) => {
    rows.push([
      place.id,
      place.name,
      place.city,
      place.effectiveStatus,
      String(place.visited),
      place.myRating,
      place.review,
      place.wouldReturn,
      place.personalNotes,
    ]);
  });

  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "bangkok-singapore-trip-log.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function resetFilters() {
  state.filters = {
    search: "",
    city: "All",
    area: "All",
    category: "All",
    mood: "All",
    price: "All",
    priority: "All",
    status: "All",
    porkSafeOnly: false,
    classPassOnly: false,
  };
  adjustMapCityForFilter();
  renderAll();
}

function adjustMapCityForFilter() {
  if (state.filters.city === "Singapore") {
    state.mapCity = "Singapore";
  } else if (state.filters.city === "Bangkok") {
    state.mapCity = "Bangkok";
  }
}

function populateStatusSelect(select, options) {
  select.innerHTML = options
    .map((option) => `<option value="${escapeAttribute(option)}">${escapeHtml(option)}</option>`)
    .join("");
}

function populateFilterOptions() {
  const places = getAllPlaces();
  const definitions = {
    city: ["All", ...uniqueValues(places, (place) => [place.city, place.cityGroup])],
    area: ["All", ...uniqueValues(places, (place) => [place.area])],
    category: ["All", ...uniqueValues(places, (place) => [place.category])],
    mood: ["All", ...uniqueValues(places, (place) => [place.mood])],
    price: ["All", ...uniqueValues(places, (place) => [place.price])],
    priority: ["All", ...uniqueValues(places, (place) => [place.priority])],
    status: ["All", ...statusChoices],
  };

  Object.entries(definitions).forEach(([key, options]) => {
    const select = elements.filters[key];
    select.innerHTML = options
      .filter(Boolean)
      .map((option) => `<option value="${escapeAttribute(option)}">${escapeHtml(option)}</option>`)
      .join("");
  });
}

function syncFilterControls() {
  elements.filters.search.value = state.filters.search;
  elements.filters.city.value = state.filters.city;
  elements.filters.area.value = state.filters.area;
  elements.filters.category.value = state.filters.category;
  elements.filters.mood.value = state.filters.mood;
  elements.filters.price.value = state.filters.price;
  elements.filters.priority.value = state.filters.priority;
  elements.filters.status.value = state.filters.status;
  elements.filters.porkSafeOnly.checked = state.filters.porkSafeOnly;
  elements.filters.classPassOnly.checked = state.filters.classPassOnly;
}

function renderStatusPill(status) {
  const className = `status-pill ${`status-${status.toLowerCase().replaceAll(" ", "-")}`}`;
  return `<span class="${className}">${escapeHtml(status)}</span>`;
}

function getPinClass(place) {
  if (["Closed", "Cut"].includes(place.effectiveStatus) || place.porkFriendly === "No") {
    return "pin-caution";
  }
  if (place.effectiveStatus === "Planned Night") {
    return "pin-planned";
  }
  return "pin-normal";
}

function uniqueValues(items, mapper) {
  const values = new Set();
  items.forEach((item) => {
    mapper(item)
      .filter(Boolean)
      .forEach((value) => values.add(value));
  });
  return [...values].sort((a, b) => a.localeCompare(b));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
