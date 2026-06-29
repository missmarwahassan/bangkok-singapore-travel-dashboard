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
    { label: "Song Wat", left: 19, top: 30 },
    { label: "Old Town", left: 24, top: 45 },
    { label: "Sathorn", left: 45, top: 52 },
    { label: "Phrom Phong", left: 62, top: 43 },
    { label: "Thong Lo", left: 74, top: 44 },
    { label: "Ari", left: 57, top: 24 },
  ],
  Singapore: [
    { label: "Orchard", left: 32, top: 48 },
    { label: "City Hall", left: 50, top: 54 },
    { label: "Kampong Glam", left: 60, top: 46 },
    { label: "Chinatown", left: 39, top: 65 },
    { label: "Joo Chiat", left: 78, top: 42 },
  ],
};
const mapViews = {
  Bangkok: { scale: 1.08, x: 0, y: 0 },
  Singapore: { scale: 1.15, x: 0, y: 0 },
};
const defaultResultsSummary =
  "Browse the shortlist by city, neighborhood, category, mood, and trip status.";

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
  plannerIndex: 0,
  draggingMap: null,
};

const elements = {
  day1Timeline: document.getElementById("day1Timeline"),
  plannerRail: document.getElementById("plannerRail"),
  plannerStage: document.getElementById("plannerStage"),
  plannerPrevButton: document.getElementById("plannerPrevButton"),
  plannerNextButton: document.getElementById("plannerNextButton"),
  resultsSummary: document.getElementById("resultsSummary"),
  spotlightStack: document.getElementById("spotlightStack"),
  sectionsRoot: document.getElementById("sectionsRoot"),
  mapCityTabs: document.getElementById("mapCityTabs"),
  mapCanvas: document.getElementById("mapCanvas"),
  mapDetail: document.getElementById("mapDetail"),
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
        if (state.filters.city === "Bangkok" || state.filters.city === "Singapore") {
          state.mapCity = state.filters.city;
        }
        populateFilterOptions();
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
  elements.editorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    savePlaceEdits();
  });
  elements.resetPlaceButton.addEventListener("click", resetPlaceEdits);
  elements.plannerPrevButton.addEventListener("click", () => shiftPlanner(-1));
  elements.plannerNextButton.addEventListener("click", () => shiftPlanner(1));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.editorModal.classList.contains("hidden")) {
      closeModal();
    }
  });

  document.addEventListener("click", (event) => {
    const editTrigger = event.target.closest("[data-edit-place]");
    if (editTrigger) {
      openEditor(editTrigger.dataset.editPlace);
      return;
    }

    const plannerTrigger = event.target.closest("[data-planner-index]");
    if (plannerTrigger) {
      state.plannerIndex = Number(plannerTrigger.dataset.plannerIndex);
      renderPlanner();
      return;
    }

    const cityTrigger = event.target.closest("[data-map-city]");
    if (cityTrigger) {
      state.mapCity = cityTrigger.dataset.mapCity;
      state.activePlaceId = null;
      renderMapTabs(getFilteredPlaces());
      renderMap(getFilteredPlaces());
      return;
    }

    const placeTrigger = event.target.closest("[data-map-place]");
    if (placeTrigger) {
      state.activePlaceId = placeTrigger.dataset.mapPlace;
      renderMap(getFilteredPlaces());
      return;
    }

    const mapControl = event.target.closest("[data-map-control]");
    if (mapControl) {
      adjustMapView(mapControl.dataset.mapControl);
    }
  });
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
  const effectiveStatus =
    visited && !["Closed", "Cut"].includes(baseStatus) ? "Visited" : baseStatus;
  const neighborhood = deriveNeighborhood(place);
  const filterCategory = deriveCategory(place);
  return {
    ...place,
    edits,
    visited,
    effectiveStatus,
    neighborhood,
    filterCategory,
    myRating: edits.myRating ?? place.defaults?.myRating ?? "",
    review: edits.review ?? place.defaults?.review ?? "",
    wouldReturn: edits.wouldReturn ?? place.defaults?.wouldReturn ?? "",
    personalNotes: edits.notes ?? place.defaults?.notes ?? "",
  };
}

function getAllPlaces() {
  return data.places.map(getPlaceView);
}

function deriveCategory(place) {
  const raw = String(place.category || "").toLowerCase();
  if (raw.includes("restaurant") || raw.includes("dessert")) return "Food";
  if (raw.includes("coffee")) return "Coffee";
  if (raw.includes("cocktails")) return "Cocktails";
  if (raw.includes("wellness")) return "Wellness";
  if (raw.includes("fitness")) return "Fitness/ClassPass";
  if (
    raw.includes("shopping") ||
    raw.includes("designer") ||
    raw.includes("luxury") ||
    raw.includes("tea")
  ) {
    return "Shopping";
  }
  if (raw.includes("day trip")) return "Day Trip";
  return "Experience";
}

function deriveNeighborhood(place) {
  const text = `${place.area} ${place.name}`.toLowerCase();
  if (place.cityGroup === "Bangkok") {
    if (text.includes("song wat")) return "Song Wat";
    if (text.includes("talat noi")) return "Talat Noi";
    if (
      text.includes("old town") ||
      text.includes("chinatown") ||
      text.includes("charoen krung") ||
      text.includes("bang rak") ||
      text.includes("river city") ||
      text.includes("warehouse 30") ||
      text.includes("soi nana")
    ) {
      return "Old Town / Chinatown";
    }
    if (text.includes("thong lo") || text.includes("ekkamai")) return "Thong Lo / Ekkamai";
    if (text.includes("phrom phong") || text.includes("emsphere") || text.includes("emquartier")) {
      return "Phrom Phong";
    }
    if (text.includes("asok") || text.includes("sukhumvit 31")) return "Asok";
    if (text.includes("sathorn") || text.includes("silom") || text.includes("dusit")) {
      return "Sathorn / Silom";
    }
    if (
      text.includes("chit lom") ||
      text.includes("phloen chit") ||
      text.includes("siam") ||
      text.includes("pratunam")
    ) {
      return "Siam / Chit Lom";
    }
    if (text.includes("ari") || text.includes("phaya thai")) return "Ari / Phaya Thai";
    if (text.includes("bang krachao")) return "Bang Krachao";
    if (text.includes("koh larn") || text.includes("pattaya")) return "Koh Larn / Pattaya";
    if (text.includes("sukhumvit")) return "Sukhumvit";
    return "Flexible Bangkok";
  }

  if (text.includes("orchard")) return "Orchard";
  if (text.includes("city hall") || text.includes("marina bay")) return "City Hall / Marina Bay";
  if (text.includes("kampong glam") || text.includes("bugis")) return "Kampong Glam / Bugis";
  if (
    text.includes("chinatown") ||
    text.includes("ann siang") ||
    text.includes("amoy") ||
    text.includes("tras") ||
    text.includes("tanjong pagar")
  ) {
    return "Chinatown / CBD";
  }
  if (text.includes("dempsey")) return "Dempsey";
  if (text.includes("tiong bahru") || text.includes("river valley")) return "Tiong Bahru / River Valley";
  if (text.includes("joo chiat") || text.includes("east coast")) return "Joo Chiat / East Coast";
  if (text.includes("airport")) return "Airport";
  if (text.includes("sentosa")) return "Sentosa";
  if (text.includes("little india") || text.includes("dhoby ghaut") || text.includes("kovan")) {
    return "Little India / Dhoby Ghaut";
  }
  return "Flexible Singapore";
}

function matchesFilter(place) {
  const { filters } = state;
  const searchTarget = [
    place.name,
    place.city,
    place.neighborhood,
    place.filterCategory,
    place.area,
    place.bestFor,
    place.doOrder,
    place.notes,
  ]
    .join(" ")
    .toLowerCase();

  if (filters.search && !searchTarget.includes(filters.search.toLowerCase().trim())) return false;
  if (filters.city !== "All" && place.cityGroup !== filters.city) return false;
  if (filters.area !== "All" && place.neighborhood !== filters.area) return false;
  if (filters.category !== "All" && place.filterCategory !== filters.category) return false;
  if (filters.mood !== "All" && place.mood !== filters.mood) return false;
  if (filters.price !== "All" && place.price !== filters.price) return false;
  if (filters.priority !== "All" && place.priority !== filters.priority) return false;
  if (filters.status !== "All" && place.effectiveStatus !== filters.status) return false;
  if (filters.porkSafeOnly && place.porkFriendly !== "Yes") return false;
  if (filters.classPassOnly && !String(place.classPass).includes("Yes")) return false;
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
  populateFilterOptions();
  syncFilterControls();
  renderResultsSummary(filtered);
  renderDay1();
  renderPlanner();
  renderSpotlights(filtered);
  renderMapTabs(filtered);
  renderMap(filtered);
  renderSections(filtered);
}

function renderResultsSummary(filtered) {
  const label =
    filtered.length === getAllPlaces().length
      ? defaultResultsSummary
      : `${filtered.length} places match the current filters.`;
  elements.resultsSummary.textContent = label;
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
  const entries = data.dailyPlanner;
  if (state.plannerIndex >= entries.length) state.plannerIndex = 0;
  const active = entries[state.plannerIndex];

  elements.plannerRail.innerHTML = entries
    .map(
      (entry, index) => `
        <button class="planner-pill ${index === state.plannerIndex ? "active" : ""}" type="button" data-planner-index="${index}">
          ${escapeHtml(entry.Date)} · ${escapeHtml(entry.Mood)}
        </button>
      `
    )
    .join("");

  elements.plannerStage.innerHTML = `
    <p class="planner-date">${escapeHtml(active.Date)} · ${escapeHtml(active.City)}</p>
    <h3>${escapeHtml(active.Mood)}</h3>
    <p class="card-notes">${escapeHtml(active.Notes)}</p>
    <div class="planner-stage-grid">
      ${renderPlannerSlot("Morning", active.Morning)}
      ${renderPlannerSlot("Workout", active.Workout)}
      ${renderPlannerSlot("Lunch", active.Lunch)}
      ${renderPlannerSlot("Afternoon", active.Afternoon)}
      ${renderPlannerSlot("Dinner", active.Dinner)}
      ${renderPlannerSlot("Night", active.Night)}
      ${renderPlannerSlot("Reservations", active["Reservation Needed"])}
    </div>
  `;
}

function renderPlannerSlot(label, value) {
  return `
    <article class="planner-slot">
      <strong>${escapeHtml(label)}</strong>
      <span>${escapeHtml(value || "—")}</span>
    </article>
  `;
}

function shiftPlanner(delta) {
  const total = data.dailyPlanner.length;
  state.plannerIndex = (state.plannerIndex + delta + total) % total;
  renderPlanner();
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
            <span class="chip">${escapeHtml(place.filterCategory)}</span>
          </div>
          <h3>${escapeHtml(place.name)}</h3>
          <p class="card-subtitle">${escapeHtml(place.cityGroup)} · ${escapeHtml(place.neighborhood)}</p>
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
}

function renderMap(filtered) {
  const city = state.mapCity;
  const places = filtered.filter((place) => place.cityGroup === city);
  if (!places.length) {
    elements.mapCanvas.innerHTML = `<div class="map-hud"><p class="map-hint">No visible places in ${escapeHtml(city)} for the current filters.</p></div>`;
    elements.mapDetail.innerHTML = `<p class="map-hint">Try loosening a filter or switching city tabs.</p>`;
    return;
  }

  if (!state.activePlaceId || !places.some((place) => place.id === state.activePlaceId)) {
    state.activePlaceId = places[0].id;
  }

  const activePlace = places.find((place) => place.id === state.activePlaceId) || places[0];
  const view = mapViews[city];

  const labelsMarkup = mapLabels[city]
    .map(
      (item) =>
        `<div class="map-label" style="left:${item.left}%; top:${item.top}%;">${escapeHtml(item.label)}</div>`
    )
    .join("");

  const pinsMarkup = places
    .map((place) => {
      const point = projectToMap(city, place.lat, place.lng);
      return `
        <button
          class="pin-button ${getPinClass(place)} ${place.id === activePlace.id ? "active" : ""}"
          type="button"
          data-map-place="${escapeHtml(place.id)}"
          style="left:${point.left}%; top:${point.top}%;"
          aria-label="${escapeAttribute(place.name)}"
        ></button>
      `;
    })
    .join("");

  elements.mapCanvas.innerHTML = `
    <div class="map-hud">
      <p class="map-hint">Drag to move. Use zoom controls for closer neighborhood views.</p>
      <p class="map-hint">${escapeHtml(city)} · ${places.length} visible pins</p>
    </div>
    <div class="map-viewport" id="mapViewport">
      <div
        class="map-layer"
        id="mapLayer"
        style="transform: translate(${view.x}px, ${view.y}px) scale(${view.scale});"
      >
        <div class="map-background">${renderMapBackground(city)}</div>
        ${labelsMarkup}
        ${pinsMarkup}
      </div>
    </div>
  `;

  renderMapDetail(activePlace);
  attachMapInteractions(city);
}

function renderMapDetail(place) {
  const placeCount = getFilteredPlaces().filter((item) => item.cityGroup === place.cityGroup).length;
  const porkCopy =
    place.porkFriendly === "Yes"
      ? "No-pork friendly"
      : `Dietary note: ${place.porkFriendly}`;
  elements.mapDetail.innerHTML = `
    <div class="card-chips">
      ${renderStatusPill(place.effectiveStatus)}
      <span class="chip">${escapeHtml(place.filterCategory)}</span>
      <span class="chip">${escapeHtml(place.neighborhood)}</span>
    </div>
    <h3>${escapeHtml(place.name)}</h3>
    <p>${escapeHtml(place.cityGroup)} · ${escapeHtml(place.area)} · ${escapeHtml(place.bestFor || "Flexible pick")}</p>
    <div class="card-meta" style="margin-top:12px;">
      <div><strong>Mood:</strong> ${escapeHtml(place.mood)}</div>
      <div><strong>Priority:</strong> ${escapeHtml(place.priority)}</div>
      <div><strong>Map view:</strong> ${placeCount} visible places in this city right now</div>
      <div><strong>Dietary:</strong> ${escapeHtml(porkCopy)}</div>
      <div><strong>What to do:</strong> ${escapeHtml(place.doOrder || "Use source + notes")}</div>
    </div>
    <p class="card-notes" style="margin-top:12px;">${escapeHtml(place.notes)}</p>
    ${
      place.personalNotes
        ? `<p class="note-row"><strong>Your notes:</strong> ${escapeHtml(place.personalNotes)}</p>`
        : ""
    }
    <div class="map-detail-actions" style="margin-top:12px;">
      <a class="card-button link" href="#card-${escapeAttribute(place.id)}">Jump to card</a>
      <button class="card-button" type="button" data-edit-place="${escapeHtml(place.id)}">Edit fields</button>
      ${place.sourceUrl ? `<a class="card-button link" href="${escapeAttribute(place.sourceUrl)}" target="_blank" rel="noreferrer">Open source</a>` : ""}
    </div>
  `;
}

function attachMapInteractions(city) {
  const viewport = document.getElementById("mapViewport");
  const layer = document.getElementById("mapLayer");
  if (!viewport || !layer) return;

  viewport.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const delta = event.deltaY < 0 ? 0.12 : -0.12;
      const next = clamp(mapViews[city].scale + delta, 0.9, 2.8);
      mapViews[city].scale = next;
      layer.style.transform = mapTransform(city);
    },
    { passive: false }
  );

  viewport.addEventListener("pointerdown", (event) => {
    if (event.target.closest("[data-map-place]")) return;
    state.draggingMap = {
      city,
      startX: event.clientX,
      startY: event.clientY,
      originX: mapViews[city].x,
      originY: mapViews[city].y,
    };
    viewport.classList.add("is-dragging");
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!state.draggingMap || state.draggingMap.city !== city) return;
    mapViews[city].x = state.draggingMap.originX + (event.clientX - state.draggingMap.startX);
    mapViews[city].y = state.draggingMap.originY + (event.clientY - state.draggingMap.startY);
    layer.style.transform = mapTransform(city);
  });

  const endDrag = () => {
    state.draggingMap = null;
    viewport.classList.remove("is-dragging");
  };
  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointerleave", endDrag);
}

function adjustMapView(action) {
  const city = state.mapCity;
  if (action === "zoom-in") mapViews[city].scale = clamp(mapViews[city].scale + 0.16, 0.9, 2.8);
  if (action === "zoom-out") mapViews[city].scale = clamp(mapViews[city].scale - 0.16, 0.9, 2.8);
  if (action === "reset") mapViews[city] = city === "Bangkok" ? { scale: 1.08, x: 0, y: 0 } : { scale: 1.15, x: 0, y: 0 };
  renderMap(getFilteredPlaces());
}

function mapTransform(city) {
  return `translate(${mapViews[city].x}px, ${mapViews[city].y}px) scale(${mapViews[city].scale})`;
}

function renderMapBackground(city) {
  if (city === "Bangkok") {
    return `
      <svg viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
        <rect width="1000" height="700" fill="var(--map-land)"></rect>
        <path d="M0 210 C170 160 250 175 360 220 C450 258 520 248 620 210 C720 171 810 170 1000 228 L1000 700 L0 700 Z" fill="rgba(212, 201, 190, 0.35)"></path>
        <path d="M0 405 C160 360 230 376 320 418 C405 457 530 456 645 415 C777 368 882 370 1000 430" stroke="var(--map-road)" stroke-width="18" fill="none" stroke-linecap="round"></path>
        <path d="M120 80 C220 170 290 260 320 370 C335 430 340 492 325 590" stroke="rgba(184, 170, 155, 0.65)" stroke-width="72" fill="none" stroke-linecap="round"></path>
        <path d="M200 118 C420 130 564 190 742 288 C820 332 886 392 948 484" stroke="rgba(154, 135, 116, 0.25)" stroke-width="10" fill="none" stroke-linecap="round"></path>
        <path d="M250 540 C420 470 570 455 760 482 C840 494 896 514 965 552" stroke="rgba(154, 135, 116, 0.22)" stroke-width="8" fill="none" stroke-linecap="round"></path>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
      <rect width="1000" height="700" fill="var(--map-land)"></rect>
      <path d="M0 460 C160 430 245 410 345 372 C445 332 585 300 670 264 C792 213 872 175 1000 118 L1000 700 L0 700 Z" fill="rgba(210, 201, 191, 0.42)"></path>
      <path d="M160 190 C300 252 360 332 420 452 C470 552 552 612 668 610" stroke="rgba(183, 168, 153, 0.58)" stroke-width="58" fill="none" stroke-linecap="round"></path>
      <path d="M150 310 C332 304 475 318 604 360 C725 398 845 394 972 338" stroke="var(--map-road)" stroke-width="16" fill="none" stroke-linecap="round"></path>
      <path d="M355 160 C420 244 515 295 626 320 C735 344 832 336 934 286" stroke="rgba(154, 135, 116, 0.24)" stroke-width="9" fill="none" stroke-linecap="round"></path>
      <path d="M268 502 C373 474 470 450 565 462 C695 478 804 532 920 626" stroke="rgba(154, 135, 116, 0.22)" stroke-width="8" fill="none" stroke-linecap="round"></path>
    </svg>
  `;
}

function projectToMap(city, lat, lng) {
  const bounds = mapBounds[city];
  const left = ((lng - bounds.lngMin) / (bounds.lngMax - bounds.lngMin)) * 82 + 9;
  const top = (1 - (lat - bounds.latMin) / (bounds.latMax - bounds.latMin)) * 76 + 9;
  return {
    left: clamp(left, 8, 92),
    top: clamp(top, 8, 92),
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
  const porkNote =
    place.porkFriendly !== "Yes"
      ? `Pork note: ${place.porkFriendly}. ${place.doOrder || place.notes}`
      : `No-pork note: ${place.doOrder || "No specific dietary note added yet."}`;

  return `
    <article class="card" id="card-${escapeAttribute(place.id)}">
      <div class="card-header">
        <div>
          <h3 class="card-title">${escapeHtml(place.name)}</h3>
          <p class="card-subtitle">${escapeHtml(place.cityGroup)} · ${escapeHtml(place.neighborhood)}</p>
        </div>
        ${renderStatusPill(place.effectiveStatus)}
      </div>
      <div class="card-chips">
        <span class="chip priority">${escapeHtml(place.priority)}</span>
        <span class="chip">${escapeHtml(place.filterCategory)}</span>
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
        <div><strong>Neighborhood:</strong> ${escapeHtml(place.neighborhood)}</div>
        <div><strong>Area detail:</strong> ${escapeHtml(place.area || "—")}</div>
        <div><strong>Best for:</strong> ${escapeHtml(place.bestFor || "Flexible stop")}</div>
        <div><strong>Order / do:</strong> ${escapeHtml(place.doOrder || "Use the notes + source link")}</div>
        <div><strong>Reservation:</strong> ${escapeHtml(place.reservation)}</div>
        ${place.myRating ? `<div><strong>Your rating:</strong> ${escapeHtml(String(place.myRating))}</div>` : ""}
        ${place.wouldReturn ? `<div><strong>Would return:</strong> ${escapeHtml(place.wouldReturn)}</div>` : ""}
      </div>
      <p class="card-notes">${escapeHtml(place.notes)}</p>
      <p class="note-row">${escapeHtml(porkNote)}</p>
      ${place.personalNotes ? `<p class="note-row"><strong>Your notes:</strong> ${escapeHtml(place.personalNotes)}</p>` : ""}
      <div class="card-actions">
        <button class="card-button" type="button" data-edit-place="${escapeHtml(place.id)}">Edit fields</button>
        ${place.sourceUrl ? `<a class="card-button link" href="${escapeAttribute(place.sourceUrl)}" target="_blank" rel="noreferrer">Source</a>` : ""}
      </div>
    </article>
  `;
}

function openEditor(placeId) {
  const place = getPlaceView(getPlaceById(placeId));
  state.editingPlaceId = placeId;
  elements.modalTitle.textContent = place.name;
  elements.modalMeta.textContent = `${place.cityGroup} · ${place.neighborhood} · Default status: ${place.status}`;
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
    ["ID", "Name", "City", "Neighborhood", "Status", "Visited", "My Rating", "Review", "Would Return", "Notes"],
  ];

  getAllPlaces().forEach((place) => {
    rows.push([
      place.id,
      place.name,
      place.cityGroup,
      place.neighborhood,
      place.effectiveStatus,
      String(place.visited),
      place.myRating,
      place.review,
      place.wouldReturn,
      place.personalNotes,
    ]);
  });

  const csv = rows
    .map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
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
  populateFilterOptions();
  renderAll();
}

function populateStatusSelect(select, options) {
  select.innerHTML = options
    .map((option) => `<option value="${escapeAttribute(option)}">${escapeHtml(option)}</option>`)
    .join("");
}

function populateFilterOptions() {
  const allPlaces = getAllPlaces();
  const scopedPlaces =
    state.filters.city === "Bangkok" || state.filters.city === "Singapore"
      ? allPlaces.filter((place) => place.cityGroup === state.filters.city)
      : allPlaces;

  setSelectOptions(elements.filters.city, ["All", "Bangkok", "Singapore"], state.filters.city);
  setSelectOptions(
    elements.filters.area,
    ["All", ...uniqueValues(scopedPlaces, (place) => place.neighborhood)],
    state.filters.area
  );
  setSelectOptions(
    elements.filters.category,
    ["All", ...uniqueValues(allPlaces, (place) => place.filterCategory)],
    state.filters.category
  );
  setSelectOptions(
    elements.filters.mood,
    ["All", ...uniqueValues(allPlaces, (place) => place.mood)],
    state.filters.mood
  );
  setSelectOptions(
    elements.filters.price,
    ["All", ...uniqueValues(allPlaces, (place) => place.price)],
    state.filters.price
  );
  setSelectOptions(
    elements.filters.priority,
    ["All", ...uniqueValues(allPlaces, (place) => place.priority)],
    state.filters.priority
  );
  setSelectOptions(elements.filters.status, ["All", ...statusChoices], state.filters.status);

  if (![...elements.filters.area.options].some((option) => option.value === state.filters.area)) {
    state.filters.area = "All";
  }
}

function setSelectOptions(select, options, selectedValue) {
  const current = options.includes(selectedValue) ? selectedValue : "All";
  select.innerHTML = options
    .map((option) => `<option value="${escapeAttribute(option)}">${escapeHtml(option)}</option>`)
    .join("");
  select.value = current;
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

function uniqueValues(items, getter) {
  return [...new Set(items.map(getter).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function renderStatusPill(status) {
  const className = `status-pill status-${status.toLowerCase().replaceAll(" ", "-")}`;
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
