const data = window.TRIP_DATA;

const tripLogStorageKey = "bangkokSingaporeTripDashboardEdits";
const scheduleStorageKey = "bangkokSingaporeScheduleEdits";
const statusChoices = ["Not Yet", "Planned Night", "Visited", "Maybe", "Closed", "Cut"];
const priorityOrder = {
  Legendary: 0,
  Must: 1,
  Strong: 2,
  Maybe: 3,
  Flexible: 4,
  Skip: 5,
};
const defaultResultsSummary =
  "Browse by city, neighborhood, category, mood, price, priority, and status.";
const atlasAspectRatio = 620 / 1000;
const defaultAtlasViewports = {
  Bangkok: { x: 0, y: 0, width: 1000, height: 620 },
  Singapore: { x: 0, y: 0, width: 1000, height: 620 },
};

const neighborhoodAtlas = {
  Bangkok: {
    regions: [
      { key: "Song Wat", label: "Song Wat", x: 250, y: 210, path: "M170 175 L310 158 L342 218 L286 270 L176 252 Z" },
      { key: "Talat Noi", label: "Talat Noi", x: 205, y: 265, path: "M130 235 L240 220 L274 280 L210 330 L128 305 Z" },
      { key: "Old Town / Chinatown", label: "Old Town", x: 250, y: 320, path: "M116 294 L286 272 L356 330 L280 430 L118 396 Z" },
      { key: "Sathorn / Silom", label: "Sathorn", x: 432, y: 336, path: "M320 262 L510 256 L574 340 L488 430 L332 404 Z" },
      { key: "Siam / Chit Lom", label: "Siam", x: 520, y: 232, path: "M432 174 L618 174 L662 248 L560 296 L434 266 Z" },
      { key: "Ari / Phaya Thai", label: "Ari", x: 410, y: 168, path: "M296 108 L452 112 L510 176 L432 240 L312 208 Z" },
      { key: "Asok", label: "Asok", x: 654, y: 266, path: "M592 202 L708 202 L744 274 L680 334 L592 310 Z" },
      { key: "Phrom Phong", label: "Phrom Phong", x: 710, y: 226, path: "M664 158 L790 162 L832 228 L742 286 L656 248 Z" },
      { key: "Thong Lo / Ekkamai", label: "Thong Lo", x: 824, y: 242, path: "M794 170 L932 186 L944 286 L846 334 L748 274 Z" },
      { key: "Sukhumvit", label: "Sukhumvit", x: 678, y: 348, path: "M560 290 L750 296 L872 364 L814 470 L600 450 L520 370 Z" },
      { key: "Bang Krachao", label: "Bang Krachao", x: 548, y: 518, path: "M430 448 L644 454 L704 568 L544 634 L396 560 Z" },
      { key: "Koh Larn / Pattaya", label: "Beach Day", x: 136, y: 548, path: "M60 502 L188 488 L232 570 L138 628 L52 596 Z" },
      { key: "Flexible Bangkok", label: "Flexible", x: 870, y: 470, path: "M808 344 L952 356 L976 520 L858 596 L752 480 Z" },
    ],
    water: "M54 34 C170 144 246 240 276 352 C300 442 292 546 268 640 C326 604 396 542 446 480 C500 408 526 314 518 214 C508 114 440 38 350 10 C254 -16 142 -8 54 34 Z",
    roads: [
      { className: "atlas-road-major", path: "M74 320 C224 284 320 288 438 326 C536 356 642 362 790 336 C876 320 924 322 972 336" },
      { className: "atlas-road-major", path: "M274 144 C416 152 560 182 674 236 C768 280 860 346 948 432" },
      { className: "atlas-road-minor", path: "M210 438 C346 394 486 392 634 426 C726 446 826 490 926 566" },
      { className: "atlas-road-minor", path: "M134 224 C210 260 250 298 286 356 C308 390 324 432 332 500" },
      { className: "atlas-road-minor", path: "M584 116 C654 168 696 224 736 302 C760 350 796 392 866 438" },
    ],
    parks: [
      { path: "M424 478 C466 442 536 438 582 474 C562 544 494 578 434 560 C396 548 392 510 424 478 Z" },
    ],
    labels: [
      { className: "atlas-water-label", x: 252, y: 366, rotate: -73, text: "Chao Phraya" },
      { className: "atlas-road-label", x: 672, y: 222, rotate: 0, text: "Sukhumvit Corridor" },
      { className: "atlas-road-label", x: 198, y: 354, rotate: 0, text: "Historic Core" },
    ],
  },
  Singapore: {
    regions: [
      { key: "Orchard", label: "Orchard", x: 286, y: 246, path: "M152 186 L332 160 L404 244 L306 336 L160 294 Z" },
      { key: "City Hall / Marina Bay", label: "City Hall", x: 496, y: 314, path: "M386 246 L566 230 L654 308 L564 402 L404 386 L348 312 Z" },
      { key: "Kampong Glam / Bugis", label: "Bugis", x: 612, y: 246, path: "M536 172 L700 172 L770 242 L708 330 L574 308 L510 230 Z" },
      { key: "Chinatown / CBD", label: "CBD", x: 414, y: 394, path: "M302 338 L472 324 L548 404 L480 490 L326 470 L270 396 Z" },
      { key: "Dempsey", label: "Dempsey", x: 198, y: 326, path: "M118 268 L250 254 L302 326 L234 404 L126 384 Z" },
      { key: "Tiong Bahru / River Valley", label: "Tiong Bahru", x: 280, y: 382, path: "M160 336 L308 322 L354 386 L290 456 L172 430 Z" },
      { key: "Joo Chiat / East Coast", label: "East Coast", x: 786, y: 292, path: "M686 210 L892 220 L944 332 L834 420 L690 372 L648 270 Z" },
      { key: "Sentosa", label: "Sentosa", x: 302, y: 520, path: "M212 468 L356 462 L404 536 L328 594 L214 568 Z" },
      { key: "Little India / Dhoby Ghaut", label: "Little India", x: 492, y: 210, path: "M402 160 L542 150 L596 216 L536 282 L412 258 Z" },
      { key: "Airport", label: "Airport", x: 930, y: 420, path: "M856 356 L980 376 L988 490 L896 530 L826 440 Z" },
      { key: "Flexible Singapore", label: "Flexible", x: 716, y: 450, path: "M574 376 L770 388 L848 484 L734 592 L566 548 L520 446 Z" },
    ],
    water: "M0 430 C126 406 218 392 324 350 C440 306 604 262 722 220 C846 174 930 132 1000 98 L1000 700 L0 700 Z",
    roads: [
      { className: "atlas-road-major", path: "M126 294 C280 292 422 302 568 332 C700 362 824 356 958 308" },
      { className: "atlas-road-major", path: "M172 172 C292 226 350 306 418 426 C466 510 562 576 680 582" },
      { className: "atlas-road-minor", path: "M340 140 C422 212 514 252 634 276 C732 296 846 284 944 230" },
      { className: "atlas-road-minor", path: "M248 470 C368 438 484 430 604 442 C720 454 818 494 918 578" },
      { className: "atlas-road-minor", path: "M456 180 C474 244 490 304 526 356 C558 404 614 430 708 442" },
    ],
    parks: [
      { path: "M670 458 C744 420 844 432 900 498 C860 566 756 600 688 572 C632 550 622 500 670 458 Z" },
    ],
    labels: [
      { className: "atlas-water-label", x: 784, y: 488, rotate: 0, text: "Marina + Coast" },
      { className: "atlas-road-label", x: 540, y: 322, rotate: 0, text: "City Core" },
      { className: "atlas-road-label", x: 236, y: 274, rotate: 0, text: "Orchard Axis" },
    ],
  },
};

const elements = {
  exportCsvButton: document.getElementById("exportCsvButton"),
  schedulePrevButton: document.getElementById("schedulePrevButton"),
  scheduleNextButton: document.getElementById("scheduleNextButton"),
  scheduleTabs: document.getElementById("scheduleTabs"),
  scheduleEditor: document.getElementById("scheduleEditor"),
  resultsSummary: document.getElementById("resultsSummary"),
  resetFiltersButton: document.getElementById("resetFiltersButton"),
  mapCityTabs: document.getElementById("mapCityTabs"),
  mapNeighborhoods: document.getElementById("mapNeighborhoods"),
  mapCanvas: document.getElementById("mapCanvas"),
  mapInspector: document.getElementById("mapInspector"),
  sectionsRoot: document.getElementById("sectionsRoot"),
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
  tripLogEdits: loadStorage(tripLogStorageKey),
  scheduleEdits: loadStorage(scheduleStorageKey),
  mapCity: "Bangkok",
  activePlaceId: null,
  editingPlaceId: null,
  selectedScheduleKey: "2026-07-09",
  atlasViewport: JSON.parse(JSON.stringify(defaultAtlasViewports)),
  atlasDrag: {
    active: false,
    moved: false,
    pointerId: null,
    startClientX: 0,
    startClientY: 0,
    startViewport: null,
    suppressClickUntil: 0,
  },
};

const baseSchedules = buildSchedules();

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
      if (key === "city" && (state.filters.city === "Bangkok" || state.filters.city === "Singapore")) {
        state.mapCity = state.filters.city;
      }
      populateFilterOptions();
      renderAll();
    });
  });

  elements.exportCsvButton.addEventListener("click", exportEditsCsv);
  elements.schedulePrevButton.addEventListener("click", () => shiftSchedule(-1));
  elements.scheduleNextButton.addEventListener("click", () => shiftSchedule(1));
  elements.resetFiltersButton.addEventListener("click", resetFilters);
  elements.closeModalButton.addEventListener("click", closeModal);
  elements.editorModal.addEventListener("click", (event) => {
    if (event.target.dataset.closeModal === "true") closeModal();
  });
  elements.editorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    savePlaceEdits();
  });
  elements.resetPlaceButton.addEventListener("click", resetPlaceEdits);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.editorModal.classList.contains("hidden")) {
      closeModal();
    }
  });

  document.addEventListener("click", (event) => {
    const scheduleTab = event.target.closest("[data-schedule-key]");
    if (scheduleTab) {
      state.selectedScheduleKey = scheduleTab.dataset.scheduleKey;
      renderScheduleWorkspace();
      return;
    }

    const scheduleReset = event.target.closest("[data-reset-schedule]");
    if (scheduleReset) {
      delete state.scheduleEdits[state.selectedScheduleKey];
      persistStorage(scheduleStorageKey, state.scheduleEdits);
      renderScheduleWorkspace();
      return;
    }

    const cityTab = event.target.closest("[data-map-city]");
    if (cityTab) {
      state.mapCity = cityTab.dataset.mapCity;
      renderMapExplorer(getFilteredPlaces());
      return;
    }

    const regionTrigger = event.target.closest("[data-map-region]");
    if (regionTrigger) {
      if (Date.now() < state.atlasDrag.suppressClickUntil) return;
      const nextNeighborhood = regionTrigger.dataset.mapRegion;
      state.filters.city = state.mapCity;
      state.filters.area = state.filters.area === nextNeighborhood ? "All" : nextNeighborhood;
      populateFilterOptions();
      renderAll();
      return;
    }

    const neighborhoodChip = event.target.closest("[data-neighborhood-filter]");
    if (neighborhoodChip) {
      const nextNeighborhood = neighborhoodChip.dataset.neighborhoodFilter;
      state.filters.city = state.mapCity;
      state.filters.area = nextNeighborhood;
      populateFilterOptions();
      renderAll();
      return;
    }

    const selectPlace = event.target.closest("[data-select-place]");
    if (selectPlace) {
      state.activePlaceId = selectPlace.dataset.selectPlace;
      renderMapExplorer(getFilteredPlaces());
      return;
    }

    const editPlace = event.target.closest("[data-edit-place]");
    if (editPlace) {
      openEditor(editPlace.dataset.editPlace);
      return;
    }

    const atlasZoom = event.target.closest("[data-atlas-zoom]");
    if (atlasZoom) {
      adjustAtlasZoom(atlasZoom.dataset.atlasZoom);
    }
  });

  document.addEventListener("input", (event) => {
    const field = event.target.closest("[data-schedule-field]");
    if (!field) return;
    updateScheduleField(
      field.dataset.scheduleKey,
      Number(field.dataset.itemIndex),
      field.dataset.scheduleField,
      field.value
    );
  });

  elements.mapCanvas.addEventListener("pointerdown", handleAtlasPointerDown);
  elements.mapCanvas.addEventListener("pointermove", handleAtlasPointerMove);
  elements.mapCanvas.addEventListener("pointerup", handleAtlasPointerUp);
  elements.mapCanvas.addEventListener("pointercancel", handleAtlasPointerUp);
  elements.mapCanvas.addEventListener(
    "wheel",
    (event) => {
      const map = event.target.closest(".atlas-map");
      if (!map) return;
      event.preventDefault();
      const rect = map.getBoundingClientRect();
      const viewport = getAtlasViewport();
      const anchorX = viewport.x + ((event.clientX - rect.left) / rect.width) * viewport.width;
      const anchorY = viewport.y + ((event.clientY - rect.top) / rect.height) * viewport.height;
      adjustAtlasZoom(event.deltaY < 0 ? "in" : "out", { x: anchorX, y: anchorY });
    },
    { passive: false }
  );
}

function buildSchedules() {
  const dailySchedules = data.dailyPlanner.map((entry) => {
    const key = String(entry.Date);
    const items = [
      { stamp: "Morning", content: entry.Morning, meta: entry.City, notes: "" },
      { stamp: "Workout", content: entry.Workout, meta: entry.Mood, notes: "" },
      { stamp: "Lunch", content: entry.Lunch, meta: "", notes: "" },
      { stamp: "Afternoon", content: entry.Afternoon, meta: "", notes: "" },
      { stamp: "Dinner", content: entry.Dinner, meta: "", notes: "" },
      { stamp: "Night", content: entry.Night, meta: "", notes: "" },
      { stamp: "Reservations", content: entry["Reservation Needed"], meta: "", notes: "" },
    ];
    return {
      key,
      dateLabel: key,
      city: entry.City,
      mood: entry.Mood,
      summary: entry.Notes || "",
      items,
    };
  });

  const dayOne = dailySchedules.find((schedule) => schedule.key === "2026-07-09");
  if (dayOne) {
    dayOne.items = data.day1.map((item) => ({
      stamp: item.Time,
      content: item.Plan,
      meta: `${item.Area} · ${item.Mood}`,
      notes: item.Notes,
    }));
  }

  return dailySchedules;
}

function getSchedules() {
  return baseSchedules.map((schedule) => getScheduleView(schedule));
}

function getScheduleView(schedule) {
  const edited = state.scheduleEdits[schedule.key];
  if (!edited) return cloneSchedule(schedule);
  return {
    key: schedule.key,
    dateLabel: edited.dateLabel || schedule.dateLabel,
    city: edited.city || schedule.city,
    mood: edited.mood || schedule.mood,
    summary: edited.summary ?? schedule.summary,
    items: (edited.items || schedule.items).map((item, index) => ({
      stamp: item.stamp ?? schedule.items[index]?.stamp ?? "",
      content: item.content ?? "",
      meta: item.meta ?? "",
      notes: item.notes ?? "",
    })),
  };
}

function cloneSchedule(schedule) {
  return {
    key: schedule.key,
    dateLabel: schedule.dateLabel,
    city: schedule.city,
    mood: schedule.mood,
    summary: schedule.summary,
    items: schedule.items.map((item) => ({ ...item })),
  };
}

function updateScheduleField(scheduleKey, index, field, value) {
  const current = getScheduleView(baseSchedules.find((item) => item.key === scheduleKey));
  const next = cloneSchedule(current);
  if (field === "summary") {
    next.summary = value;
  } else if (next.items[index]) {
    next.items[index][field] = value;
  }
  state.scheduleEdits[scheduleKey] = next;
  persistStorage(scheduleStorageKey, state.scheduleEdits);
}

function shiftSchedule(delta) {
  const schedules = getSchedules();
  const currentIndex = schedules.findIndex((schedule) => schedule.key === state.selectedScheduleKey);
  const nextIndex = (currentIndex + delta + schedules.length) % schedules.length;
  state.selectedScheduleKey = schedules[nextIndex].key;
  renderScheduleWorkspace();
}

function getPlaceById(id) {
  return data.places.find((place) => place.id === id);
}

function getPlaceView(place) {
  const edits = state.tripLogEdits[place.id] || {};
  const visited = edits.visited ?? place.defaults?.visited ?? false;
  const baseStatus = edits.status || place.status;
  return {
    ...place,
    neighborhood: deriveNeighborhood(place),
    filterCategory: deriveCategory(place),
    edits,
    visited,
    effectiveStatus: visited && !["Closed", "Cut"].includes(baseStatus) ? "Visited" : baseStatus,
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
  populateFilterOptions();
  syncFilterControls();
  renderScheduleWorkspace();
  const filtered = getFilteredPlaces();
  renderResultsSummary(filtered);
  renderMapExplorer(filtered);
  renderSections(filtered);
}

function renderScheduleWorkspace() {
  const schedules = getSchedules();
  const activeSchedule = schedules.find((schedule) => schedule.key === state.selectedScheduleKey) || schedules[0];
  state.selectedScheduleKey = activeSchedule.key;

  elements.scheduleTabs.innerHTML = schedules
    .map(
      (schedule) => `
        <button class="schedule-tab ${schedule.key === activeSchedule.key ? "active" : ""}" type="button" data-schedule-key="${escapeAttribute(schedule.key)}">
          ${escapeHtml(schedule.dateLabel)} · ${escapeHtml(schedule.mood)}
        </button>
      `
    )
    .join("");

  if (!activeSchedule) {
    elements.scheduleEditor.innerHTML = `<div class="schedule-empty">No schedule data loaded yet.</div>`;
    return;
  }

  elements.scheduleEditor.innerHTML = `
    <article class="schedule-day-card">
      <div class="schedule-day-header">
        <div>
          <p class="schedule-date">${escapeHtml(activeSchedule.dateLabel)} · ${escapeHtml(activeSchedule.city)}</p>
          <h3>${escapeHtml(activeSchedule.mood)}</h3>
        </div>
        <button class="button button-ghost" type="button" data-reset-schedule="true">Reset This Day</button>
      </div>
      <p class="schedule-help">This main schedule is editable. Changes save locally in this browser, and you can switch days anytime.</p>
      <div class="schedule-items">
        ${activeSchedule.items
          .map(
            (item, index) => `
              <article class="schedule-item">
                <div class="schedule-stamp">${escapeHtml(item.stamp)}</div>
                <div class="schedule-fields">
                  <label>
                    <span class="field-label">Plan</span>
                    <textarea class="schedule-textarea" data-schedule-key="${escapeAttribute(activeSchedule.key)}" data-item-index="${index}" data-schedule-field="content">${escapeHtml(item.content)}</textarea>
                  </label>
                  <div class="schedule-meta-row">
                    <label>
                      <span class="field-label">Area / Mood</span>
                      <input class="schedule-input" type="text" value="${escapeAttribute(item.meta)}" data-schedule-key="${escapeAttribute(activeSchedule.key)}" data-item-index="${index}" data-schedule-field="meta" />
                    </label>
                    <label>
                      <span class="field-label">Notes</span>
                      <textarea class="schedule-textarea notes" data-schedule-key="${escapeAttribute(activeSchedule.key)}" data-item-index="${index}" data-schedule-field="notes">${escapeHtml(item.notes)}</textarea>
                    </label>
                  </div>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
      <label class="schedule-summary">
        <span class="field-label">Day Summary / Notes</span>
        <textarea class="schedule-textarea" data-schedule-key="${escapeAttribute(activeSchedule.key)}" data-item-index="-1" data-schedule-field="summary">${escapeHtml(activeSchedule.summary)}</textarea>
      </label>
    </article>
  `;
}

function renderResultsSummary(filtered) {
  elements.resultsSummary.textContent =
    filtered.length === getAllPlaces().length
      ? defaultResultsSummary
      : `${filtered.length} places match the current filters.`;
}

function renderMapExplorer(filtered) {
  const cityPlaces = filtered.filter((place) => place.cityGroup === state.mapCity);
  renderMapCityTabs(filtered);
  renderNeighborhoodChips(cityPlaces);
  renderAtlasCanvas(cityPlaces);
  renderInspector(cityPlaces);
  syncAtlasViewport();
}

function renderMapCityTabs(filtered) {
  const counts = ["Bangkok", "Singapore"].map((city) => ({
    city,
    count: filtered.filter((place) => place.cityGroup === city).length,
  }));

  elements.mapCityTabs.innerHTML = counts
    .map(
      ({ city, count }) => `
        <button class="map-chip ${city === state.mapCity ? "active" : ""}" type="button" data-map-city="${city}">
          ${escapeHtml(city)} (${count})
        </button>
      `
    )
    .join("");
}

function renderNeighborhoodChips(cityPlaces) {
  const grouped = [["All neighborhoods", cityPlaces.length]]
    .concat(
      Object.entries(
        cityPlaces.reduce((acc, place) => {
          acc[place.neighborhood] = (acc[place.neighborhood] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => {
        const flexibleDelta = Number(isFlexibleNeighborhood(a[0])) - Number(isFlexibleNeighborhood(b[0]));
        if (flexibleDelta !== 0) return flexibleDelta;
        const countDelta = b[1] - a[1];
        if (countDelta !== 0) return countDelta;
        return a[0].localeCompare(b[0]);
      })
    );

  elements.mapNeighborhoods.innerHTML = grouped
    .map(([name, count]) => {
      const isAll = name === "All neighborhoods";
      const active = isAll ? state.filters.area === "All" : state.filters.area === name;
      const value = isAll ? "All" : name;
      return `
        <button class="map-chip ${active ? "active" : ""}" type="button" data-neighborhood-filter="${escapeAttribute(value)}">
          ${escapeHtml(name)}${isAll ? "" : ` (${count})`}
        </button>
      `;
    })
    .join("");
}

function renderAtlasCanvas(cityPlaces) {
  const atlas = neighborhoodAtlas[state.mapCity];
  if (!cityPlaces.length) {
    elements.mapCanvas.innerHTML = `
      <div class="atlas-shell">
        <div class="atlas-help">
          <span>No visible places in ${escapeHtml(state.mapCity)} for the current filters.</span>
          <span>Try clearing a neighborhood or city filter.</span>
        </div>
      </div>
    `;
    return;
  }

  const activeNeighborhood = state.filters.area !== "All" ? state.filters.area : null;
  const neighborhoodCounts = cityPlaces.reduce((acc, place) => {
    acc[place.neighborhood] = (acc[place.neighborhood] || 0) + 1;
    return acc;
  }, {});

  const regionMarkup = atlas.regions
    .map((region) => {
      const count = neighborhoodCounts[region.key] || 0;
      const hasPlaces = count > 0;
      const active = activeNeighborhood === region.key;
      return `
        <g data-map-region="${escapeAttribute(region.key)}">
          <path class="atlas-region ${active ? "active" : ""}" d="${region.path}" data-map-region="${escapeAttribute(region.key)}" opacity="${hasPlaces ? 1 : 0.45}"></path>
          <text class="atlas-region-label" x="${region.x}" y="${region.y}" text-anchor="middle">${escapeHtml(region.label)}</text>
          ${
            hasPlaces
              ? `
                <g class="atlas-count-badge" data-map-region="${escapeAttribute(region.key)}">
                  <circle cx="${region.x}" cy="${region.y + 28}" r="17"></circle>
                  <text x="${region.x}" y="${region.y + 34}" text-anchor="middle">${count}</text>
                </g>
              `
              : ""
          }
        </g>
      `;
    })
    .join("");

  const roadsMarkup = atlas.roads
    .map((road) => `<path class="${road.className}" d="${road.path}"></path>`)
    .join("");

  const parksMarkup = atlas.parks
    .map((park) => `<path class="atlas-park" d="${park.path}"></path>`)
    .join("");

  const labelsMarkup = atlas.labels
    .map(
      (label) =>
        `<text class="${label.className}" x="${label.x}" y="${label.y}" transform="rotate(${label.rotate} ${label.x} ${label.y})">${escapeHtml(label.text)}</text>`
    )
    .join("");

  elements.mapCanvas.innerHTML = `
    <div class="atlas-shell">
      <div class="atlas-help">
        <span>Drag to pan. Use the controls or your trackpad to zoom. Tap neighborhoods to focus the shortlist.</span>
        <span>${escapeHtml(state.mapCity)} · ${cityPlaces.length} visible places</span>
      </div>
      <div class="atlas-toolbar">
        <button class="atlas-tool" type="button" data-atlas-zoom="in" aria-label="Zoom in">+</button>
        <button class="atlas-tool" type="button" data-atlas-zoom="out" aria-label="Zoom out">−</button>
        <button class="atlas-tool wide" type="button" data-atlas-zoom="reset">Reset view</button>
      </div>
      <div class="atlas-map">
        <svg class="atlas-svg" viewBox="0 0 1000 620" aria-hidden="true">
          <rect width="1000" height="620" fill="var(--atlas-land)"></rect>
          <path class="atlas-water" d="${atlas.water}"></path>
          ${parksMarkup}
          ${roadsMarkup}
          ${regionMarkup}
          ${labelsMarkup}
        </svg>
      </div>
    </div>
  `;
}

function renderInspector(cityPlaces) {
  if (!cityPlaces.length) {
    elements.mapInspector.innerHTML = `<p class="atlas-help">No visible places to inspect yet.</p>`;
    return;
  }

  const grouped = Object.entries(
    cityPlaces.reduce((acc, place) => {
      acc[place.neighborhood] = (acc[place.neighborhood] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => {
    const flexibleDelta = Number(isFlexibleNeighborhood(a[0])) - Number(isFlexibleNeighborhood(b[0]));
    if (flexibleDelta !== 0) return flexibleDelta;
    const countDelta = b[1] - a[1];
    if (countDelta !== 0) return countDelta;
    return a[0].localeCompare(b[0]);
  });

  const focusedNeighborhood =
    state.filters.area !== "All" && grouped.some(([name]) => name === state.filters.area)
      ? state.filters.area
      : grouped[0][0];

  const neighborhoodPlaces = cityPlaces
    .filter((place) => place.neighborhood === focusedNeighborhood)
    .sort(sortPlaces);

  const activePlace =
    neighborhoodPlaces.find((place) => place.id === state.activePlaceId) || neighborhoodPlaces[0];
  state.activePlaceId = activePlace.id;

  const related = neighborhoodPlaces.filter((place) => place.id !== activePlace.id).slice(0, 6);

  const porkCopy =
    activePlace.porkFriendly === "Yes"
      ? "No-pork friendly"
      : `Dietary note: ${activePlace.porkFriendly}`;

  elements.mapInspector.innerHTML = `
    <div class="card-chips">
      ${renderStatusPill(activePlace.effectiveStatus)}
      <span class="chip">${escapeHtml(activePlace.filterCategory)}</span>
      <span class="chip">${escapeHtml(focusedNeighborhood)}</span>
    </div>
    <p class="eyebrow">Focused Neighborhood</p>
    <h3>${escapeHtml(focusedNeighborhood)}</h3>
    <p class="card-subtitle">${escapeHtml(state.mapCity)} · ${neighborhoodPlaces.length} visible place${neighborhoodPlaces.length === 1 ? "" : "s"}</p>
    <div class="inspector-neighborhood-summary">
      <p><strong>Featured place:</strong> ${escapeHtml(activePlace.name)}</p>
      <p>${escapeHtml(activePlace.bestFor || activePlace.notes)}</p>
      <p>Use the atlas to narrow the area, then hop through the neighborhood picks here without losing the broader shortlist below.</p>
    </div>
    <div class="card-meta" style="margin-top:14px;">
      <div><strong>Best for:</strong> ${escapeHtml(activePlace.bestFor || "Flexible pick")}</div>
      <div><strong>Priority:</strong> ${escapeHtml(activePlace.priority)}</div>
      <div><strong>Mood:</strong> ${escapeHtml(activePlace.mood)}</div>
      <div><strong>Dietary:</strong> ${escapeHtml(porkCopy)}</div>
      <div><strong>What to do:</strong> ${escapeHtml(activePlace.doOrder || "Use notes + source")}</div>
    </div>
    <p class="card-notes" style="margin-top:14px;">${escapeHtml(activePlace.notes)}</p>
    ${
      activePlace.personalNotes
        ? `<p class="note-row"><strong>Your notes:</strong> ${escapeHtml(activePlace.personalNotes)}</p>`
        : ""
    }
    <div class="inspector-actions" style="margin-top:16px;">
      <a class="card-button link" href="#card-${escapeAttribute(activePlace.id)}">Jump to card</a>
      <button class="card-button" type="button" data-edit-place="${escapeAttribute(activePlace.id)}">Edit fields</button>
      ${activePlace.sourceUrl ? `<a class="card-button link" href="${escapeAttribute(activePlace.sourceUrl)}" target="_blank" rel="noreferrer">Open source</a>` : ""}
    </div>
    <div class="inspector-related">
      <strong>${escapeHtml(focusedNeighborhood)} picks</strong>
      <button type="button" data-select-place="${escapeAttribute(activePlace.id)}">${escapeHtml(activePlace.name)}</button>
      ${related
        .map(
          (place) => `
            <button type="button" data-select-place="${escapeAttribute(place.id)}">${escapeHtml(place.name)}</button>
          `
        )
        .join("")}
    </div>
  `;
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
        <button class="card-button" type="button" data-edit-place="${escapeAttribute(place.id)}">Edit fields</button>
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
  state.tripLogEdits[state.editingPlaceId] = {
    status: elements.editStatus.value,
    visited: elements.editVisited.checked,
    myRating: elements.editRating.value,
    review: elements.editReview.value,
    wouldReturn: elements.editWouldReturn.value,
    notes: elements.editNotes.value,
  };
  persistStorage(tripLogStorageKey, state.tripLogEdits);
  closeModal();
  renderAll();
}

function resetPlaceEdits() {
  if (!state.editingPlaceId) return;
  delete state.tripLogEdits[state.editingPlaceId];
  persistStorage(tripLogStorageKey, state.tripLogEdits);
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
    ["All", ...getNeighborhoodOptions(scopedPlaces)],
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

function renderStatusPill(status) {
  const className = `status-pill status-${status.toLowerCase().replaceAll(" ", "-")}`;
  return `<span class="${className}">${escapeHtml(status)}</span>`;
}

function uniqueValues(items, getter) {
  return [...new Set(items.map(getter).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function getNeighborhoodOptions(places) {
  return [...new Set(places.map((place) => place.neighborhood).filter(Boolean))].sort(compareNeighborhoods);
}

function compareNeighborhoods(a, b) {
  const flexibleDelta = Number(isFlexibleNeighborhood(a)) - Number(isFlexibleNeighborhood(b));
  if (flexibleDelta !== 0) return flexibleDelta;
  return a.localeCompare(b);
}

function isFlexibleNeighborhood(name) {
  return String(name).toLowerCase().includes("flexible");
}

function loadStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

function persistStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getAtlasViewport(city = state.mapCity) {
  return state.atlasViewport[city] || { ...defaultAtlasViewports[city] };
}

function setAtlasViewport(city, nextViewport) {
  const minWidth = 380;
  const maxWidth = 1000;
  const width = clamp(nextViewport.width, minWidth, maxWidth);
  const height = width * atlasAspectRatio;
  const x = clamp(nextViewport.x, 0, 1000 - width);
  const y = clamp(nextViewport.y, 0, 620 - height);
  state.atlasViewport[city] = { x, y, width, height };
}

function syncAtlasViewport() {
  const svg = elements.mapCanvas.querySelector(".atlas-svg");
  if (!svg) return;
  const viewport = getAtlasViewport();
  svg.setAttribute(
    "viewBox",
    `${viewport.x.toFixed(2)} ${viewport.y.toFixed(2)} ${viewport.width.toFixed(2)} ${viewport.height.toFixed(2)}`
  );
}

function adjustAtlasZoom(direction, anchor = { x: 500, y: 310 }) {
  const city = state.mapCity;
  const current = getAtlasViewport(city);
  const factor = direction === "in" ? 0.84 : direction === "out" ? 1.2 : 1;
  if (direction === "reset") {
    state.atlasViewport[city] = { ...defaultAtlasViewports[city] };
    syncAtlasViewport();
    return;
  }

  const nextWidth = clamp(current.width * factor, 380, 1000);
  const scaleRatio = nextWidth / current.width;
  const nextHeight = nextWidth * atlasAspectRatio;
  const nextX = anchor.x - (anchor.x - current.x) * scaleRatio;
  const nextY = anchor.y - (anchor.y - current.y) * scaleRatio;
  setAtlasViewport(city, { x: nextX, y: nextY, width: nextWidth, height: nextHeight });
  syncAtlasViewport();
}

function handleAtlasPointerDown(event) {
  const map = event.target.closest(".atlas-map");
  if (!map || event.button !== 0) return;
  const viewport = getAtlasViewport();
  state.atlasDrag = {
    active: true,
    moved: false,
    pointerId: event.pointerId,
    startClientX: event.clientX,
    startClientY: event.clientY,
    startViewport: { ...viewport },
    suppressClickUntil: state.atlasDrag.suppressClickUntil,
  };
  map.setPointerCapture(event.pointerId);
}

function handleAtlasPointerMove(event) {
  if (!state.atlasDrag.active || event.pointerId !== state.atlasDrag.pointerId) return;
  const map = elements.mapCanvas.querySelector(".atlas-map");
  if (!map || !state.atlasDrag.startViewport) return;
  const rect = map.getBoundingClientRect();
  const deltaX = event.clientX - state.atlasDrag.startClientX;
  const deltaY = event.clientY - state.atlasDrag.startClientY;
  if (Math.abs(deltaX) + Math.abs(deltaY) > 4) {
    state.atlasDrag.moved = true;
    map.classList.add("dragging");
  }

  const svgDeltaX = (deltaX / rect.width) * state.atlasDrag.startViewport.width;
  const svgDeltaY = (deltaY / rect.height) * state.atlasDrag.startViewport.height;
  setAtlasViewport(state.mapCity, {
    x: state.atlasDrag.startViewport.x - svgDeltaX,
    y: state.atlasDrag.startViewport.y - svgDeltaY,
    width: state.atlasDrag.startViewport.width,
    height: state.atlasDrag.startViewport.height,
  });
  syncAtlasViewport();
}

function handleAtlasPointerUp(event) {
  if (!state.atlasDrag.active || event.pointerId !== state.atlasDrag.pointerId) return;
  const map = elements.mapCanvas.querySelector(".atlas-map");
  if (map) {
    try {
      map.releasePointerCapture(event.pointerId);
    } catch {}
    map.classList.remove("dragging");
  }
  state.atlasDrag.suppressClickUntil = state.atlasDrag.moved ? Date.now() + 120 : 0;
  state.atlasDrag.active = false;
  state.atlasDrag.pointerId = null;
  state.atlasDrag.startViewport = null;
  state.atlasDrag.moved = false;
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
