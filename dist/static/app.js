let media = [];
let selectedIndex = -1;
let chart = null;
const aboutLink = (document.getElementById("aboutLink") ||
    document.querySelector(".about-link"));
const mediaList = document.getElementById("mediaList");
const emptyState = document.getElementById("empty");
const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");
const filterTabs = Array.from(document.querySelectorAll(".filter-tab"));
const mediaForm = document.getElementById("mediaForm");
const titleInput = document.getElementById("title");
const mediaType = document.getElementById("mediaType");
const genreInput = document.getElementById("genre");
const ratingInput = document.getElementById("rating");
const submitButton = mediaForm.querySelector(".submit-button");
const streakElement = document.getElementById("streak");
const totalElement = document.getElementById("total");
const longestElement = document.getElementById("longest");
const calendar = document.getElementById("calendar");
const activityText = document.getElementById("activityText");
const themeButton = document.getElementById("themeButton");
const analyticsSection = (document.getElementById("analyticsSection") ||
    document.querySelector(".panel.analytics"));
const chartContainer = document.getElementById("chartContainer");
const analyticsText = document.getElementById("analyticsText");
let activeDayIndex = 29;
let activeChartMonthIndex = 5;
let chartMonthlyData = [];
function getAnalyticsElement() {
    return analyticsSection || chartContainer;
}
function scrollIntoViewWithFooter(el) {
    const footer = document.querySelector("footer");
    const footerHeight = footer ? footer.offsetHeight + 24 : 80;
    const availableBottom = window.innerHeight - footerHeight;
    const rect = el.getBoundingClientRect();
    if (rect.bottom > availableBottom) {
        window.scrollBy({
            top: rect.bottom - availableBottom + 10,
            behavior: "instant"
        });
    }
    else if (rect.top < 20) {
        window.scrollBy({
            top: rect.top - 20,
            behavior: "instant"
        });
    }
}
function focusAnalytics() {
    const el = getAnalyticsElement();
    if (el) {
        el.focus({ preventScroll: true });
        scrollIntoViewWithFooter(el);
    }
}
function isAnalyticsFocused() {
    const el = getAnalyticsElement();
    const active = document.activeElement;
    return Boolean(el && active && (active === el || el.contains(active)));
}
function disableMouse() {
    const blockPointer = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    };
    const pointerEvents = [
        "pointerdown",
        "pointerup",
        "pointermove",
        "pointerover",
        "pointerout",
        "pointerenter",
        "pointerleave",
        "mousedown",
        "mouseup",
        "mousemove",
        "mouseover",
        "mouseout",
        "mouseenter",
        "mouseleave",
        "contextmenu",
        "dblclick",
        "wheel",
        "dragstart"
    ];
    for (const eventName of pointerEvents) {
        window.addEventListener(eventName, blockPointer, { capture: true, passive: false });
    }
    window.addEventListener("click", (e) => {
        const pe = e;
        if (pe.pointerType === "mouse" || pe.pointerType === "touch" || pe.pointerType === "pen" || e.detail > 0) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        }
    }, { capture: true });
}
function getActiveCalendarDay() {
    const days = calendar.querySelectorAll(".day");
    if (days.length === 0)
        return null;
    const idx = Math.max(0, Math.min(activeDayIndex, days.length - 1));
    return days[idx] || days[0];
}
function updateCalendarTabIndices() {
    const days = calendar.querySelectorAll(".day");
    days.forEach((d, idx) => {
        d.tabIndex = idx === activeDayIndex ? 0 : -1;
    });
}
function getActiveFilterTab() {
    return filterTabs.find((tab) => tab.classList.contains("active")) || filterTabs[0] || null;
}
function selectFilterTab(tab) {
    filterTabs.forEach((t) => {
        const isActive = t === tab;
        t.classList.toggle("active", isActive);
        t.setAttribute("aria-selected", isActive ? "true" : "false");
        t.tabIndex = isActive ? 0 : -1;
    });
    const filterVal = tab.dataset.filter || "All";
    if (filterSelect) {
        filterSelect.value = filterVal;
    }
    selectedIndex = -1;
    renderMedia();
    renderChart();
}
function selectFilterByIndex(index) {
    if (filterTabs.length === 0)
        return;
    const safeIdx = ((index % filterTabs.length) + filterTabs.length) % filterTabs.length;
    const targetTab = filterTabs[safeIdx];
    if (targetTab) {
        selectFilterTab(targetTab);
        targetTab.focus();
    }
}
function syncFilterTabsFromSelect() {
    const val = filterSelect.value;
    filterTabs.forEach((t) => {
        const isActive = t.dataset.filter === val;
        t.classList.toggle("active", isActive);
        t.setAttribute("aria-selected", isActive ? "true" : "false");
        t.tabIndex = isActive ? 0 : -1;
    });
}
function getPageControls() {
    const activeDay = getActiveCalendarDay();
    const controls = [
        aboutLink,
        themeButton,
        activeDay,
        titleInput,
        mediaType,
        genreInput,
        ratingInput,
        submitButton,
        searchInput,
        getActiveFilterTab()
    ];
    return controls.filter((el) => Boolean(el));
}
function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}
function getFilteredMedia() {
    const search = searchInput.value.trim().toLowerCase();
    const filter = filterSelect.value;
    return media.filter((item) => {
        const matchesSearch = !search ||
            item.title.toLowerCase().includes(search) ||
            item.genre?.toLowerCase().includes(search) ||
            item.type.toLowerCase().includes(search);
        const matchesFilter = filter === "All" ||
            item.type.toLowerCase() === filter.toLowerCase();
        return matchesSearch && matchesFilter;
    });
}
function calculateStreaks() {
    if (media.length === 0) {
        return {
            current: 0,
            longest: 0
        };
    }
    const dates = [
        ...new Set(media.map((item) => new Date(item.finished_at).toISOString().slice(0, 10)))
    ].sort();
    let longest = 1;
    let currentRun = 1;
    for (let i = 1; i < dates.length; i++) {
        const previous = new Date(`${dates[i - 1]}T00:00:00`);
        const current = new Date(`${dates[i]}T00:00:00`);
        const difference = (current.getTime() - previous.getTime()) /
            (1000 * 60 * 60 * 24);
        if (difference === 1) {
            currentRun++;
            longest = Math.max(longest, currentRun);
        }
        else {
            currentRun = 1;
        }
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().slice(0, 10);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().slice(0, 10);
    let current = 0;
    if (dates.includes(todayString) || dates.includes(yesterdayString)) {
        let checkDate = dates.includes(todayString)
            ? new Date(today)
            : new Date(yesterday);
        while (dates.includes(checkDate.toISOString().slice(0, 10))) {
            current++;
            checkDate.setDate(checkDate.getDate() - 1);
        }
    }
    return {
        current,
        longest
    };
}
function updateStats() {
    const streaks = calculateStreaks();
    streakElement.textContent = String(streaks.current);
    totalElement.textContent = String(media.length);
    longestElement.textContent = String(streaks.longest);
    if (media.length === 0) {
        activityText.textContent = "Start your cadence.";
    }
    else if (streaks.current > 0) {
        activityText.textContent = `${streaks.current} day rhythm. Keep going.`;
    }
    else {
        activityText.textContent = "Your rhythm is waiting.";
    }
}
function renderCalendar() {
    calendar.innerHTML = "";
    const counts = new Map();
    for (const item of media) {
        const date = new Date(item.finished_at)
            .toISOString()
            .slice(0, 10);
        counts.set(date, (counts.get(date) || 0) + 1);
    }
    const maxCount = Math.max(...counts.values(), 1);
    for (let i = 29; i >= 0; i--) {
        const dayIndex = 29 - i;
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().slice(0, 10);
        const count = counts.get(dateString) || 0;
        const day = document.createElement("div");
        day.className = "day";
        day.setAttribute("role", "button");
        day.dataset.dayIndex = String(dayIndex);
        day.tabIndex = dayIndex === activeDayIndex ? 0 : -1;
        if (count > 0) {
            day.classList.add("active");
        }
        if (count > 1 && count < maxCount) {
            day.classList.add("high");
        }
        if (count === maxCount && count > 0) {
            day.classList.add("highest");
        }
        const tooltip = `${formatDate(dateString)} · ${count} finished`;
        day.title = tooltip;
        day.setAttribute("aria-label", tooltip);
        day.addEventListener("focus", () => {
            activeDayIndex = dayIndex;
            updateCalendarTabIndices();
            activityText.textContent = tooltip;
        });
        day.addEventListener("blur", () => {
            setTimeout(() => {
                if (!calendar.contains(document.activeElement)) {
                    updateStats();
                }
            }, 50);
        });
        calendar.appendChild(day);
    }
}
function renderMedia() {
    const filteredMedia = getFilteredMedia();
    mediaList.innerHTML = "";
    if (filteredMedia.length === 0) {
        emptyState.style.display = "block";
        selectedIndex = -1;
        return;
    }
    emptyState.style.display = "none";
    filteredMedia.forEach((item, index) => {
        const article = document.createElement("article");
        article.className = "media";
        article.dataset.id = String(item.id);
        article.dataset.index = String(index);
        article.tabIndex = 0;
        article.setAttribute("role", "article");
        article.setAttribute("aria-label", `${item.title}, ${item.type}${item.genre ? ", " + item.genre : ""}, rating ${item.rating} of 5`);
        const stars = item.rating > 0
            ? "★".repeat(item.rating)
            : "—";
        article.innerHTML = `
            <div class="media-icon">
                ${escapeHtml(item.type.slice(0, 3).toUpperCase())}
            </div>

            <div>
                <div class="media-title">
                    ${escapeHtml(item.title)}
                </div>

                <div class="media-meta">
                    ${escapeHtml(item.type)}
                    ${item.genre ? ` · ${escapeHtml(item.genre)}` : ""}
                    · ${formatDate(item.finished_at)}
                </div>
            </div>

            <div class="media-actions">
                <span class="stars">${stars}</span>

                <button
                    type="button"
                    class="delete"
                    data-id="${item.id}"
                    aria-label="Delete ${escapeHtml(item.title)}"
                    tabindex="0"
                >
                    ×
                </button>
            </div>
        `;
        mediaList.appendChild(article);
    });
    updateSelectedMedia();
}
function updateSelectedMedia() {
    const entries = Array.from(mediaList.querySelectorAll(".media"));
    entries.forEach((entry, index) => {
        entry.style.outline =
            index === selectedIndex
                ? "2px solid var(--accent)"
                : "none";
        entry.style.outlineOffset =
            index === selectedIndex
                ? "2px"
                : "0";
    });
    if (selectedIndex >= 0 && entries[selectedIndex]) {
        if (!entries[selectedIndex].contains(document.activeElement)) {
            entries[selectedIndex].focus({
                preventScroll: true
            });
        }
        scrollIntoViewWithFooter(entries[selectedIndex]);
    }
}
function updateChartActiveMonth(index) {
    if (!chartMonthlyData.length)
        return;
    activeChartMonthIndex = Math.max(0, Math.min(index, chartMonthlyData.length - 1));
    const current = chartMonthlyData[activeChartMonthIndex];
    if (!current)
        return;
    if (analyticsText) {
        analyticsText.textContent = `${current.fullDate}: ${current.count} finished (${activeChartMonthIndex + 1}/${chartMonthlyData.length})`;
    }
    const label = `Monthly output chart: ${current.fullDate}, ${current.count} finished. Month ${activeChartMonthIndex + 1} of ${chartMonthlyData.length}. Use Left and Right arrow keys to inspect months.`;
    if (analyticsSection) {
        analyticsSection.setAttribute("aria-label", label);
    }
    if (chartContainer) {
        chartContainer.setAttribute("aria-label", label);
    }
    if (chart) {
        if (typeof chart.setActiveElements === "function") {
            try {
                chart.setActiveElements([
                    {
                        datasetIndex: 0,
                        index: activeChartMonthIndex
                    }
                ]);
            }
            catch { }
        }
        if (chart.tooltip && typeof chart.tooltip.setActiveElements === "function") {
            try {
                const meta = chart.getDatasetMeta ? chart.getDatasetMeta(0) : null;
                const point = meta && meta.data ? meta.data[activeChartMonthIndex] : null;
                const position = point ? { x: point.x, y: point.y } : { x: 0, y: 0 };
                chart.tooltip.setActiveElements([
                    {
                        datasetIndex: 0,
                        index: activeChartMonthIndex
                    }
                ], position);
            }
            catch { }
        }
        chart.update();
    }
}
function renderChart() {
    const canvas = document.getElementById("chart");
    if (!canvas || typeof Chart === "undefined") {
        return;
    }
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - i);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const label = date.toLocaleDateString("en-US", {
            month: "short"
        });
        const fullDate = date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });
        months.push({ key, label, fullDate, count: 0 });
    }
    for (const item of media) {
        const date = new Date(item.finished_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const entry = months.find((m) => m.key === key);
        if (entry) {
            entry.count += 1;
        }
    }
    chartMonthlyData = months.map(({ label, count, fullDate }) => ({
        label,
        count,
        fullDate
    }));
    const labels = chartMonthlyData.map((d) => d.label);
    const values = chartMonthlyData.map((d) => d.count);
    if (chart) {
        chart.destroy();
    }
    chart = new Chart(canvas, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    data: values,
                    borderWidth: 2,
                    tension: 0.35,
                    pointRadius: 4,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
    updateChartActiveMonth(activeChartMonthIndex);
}
async function loadMedia() {
    try {
        const response = await fetch("/api/media");
        if (!response.ok) {
            throw new Error("Failed to load media");
        }
        media = await response.json();
        updateStats();
        renderCalendar();
        renderMedia();
        renderChart();
        void applyPendingKeyboardAction();
    }
    catch {
        activityText.textContent = "Could not load your cadence.";
    }
}
async function addMedia() {
    const title = titleInput.value.trim();
    if (!title) {
        titleInput.focus();
        return;
    }
    const submitButton = mediaForm.querySelector(".submit-button");
    submitButton.disabled = true;
    try {
        const response = await fetch("/api/media", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                type: mediaType.value,
                genre: genreInput.value.trim(),
                rating: Number(ratingInput.value)
            })
        });
        if (!response.ok) {
            throw new Error("Failed to add media");
        }
        const newMedia = await response.json();
        media.unshift(newMedia);
        mediaForm.reset();
        updateStats();
        renderCalendar();
        renderMedia();
        renderChart();
        titleInput.focus();
    }
    finally {
        submitButton.disabled = false;
    }
}
async function deleteMedia(id) {
    const previousIndex = selectedIndex;
    const response = await fetch(`/api/media/${id}`, {
        method: "DELETE"
    });
    if (!response.ok) {
        return;
    }
    media = media.filter((item) => item.id !== id);
    updateStats();
    renderCalendar();
    const filtered = getFilteredMedia();
    if (filtered.length > 0) {
        selectedIndex = Math.min(Math.max(0, previousIndex), filtered.length - 1);
        renderMedia();
        const entries = Array.from(mediaList.querySelectorAll(".media"));
        entries[selectedIndex]?.focus();
    }
    else {
        selectedIndex = -1;
        renderMedia();
        const activeTab = getActiveFilterTab();
        if (activeTab) {
            activeTab.focus();
        }
        else {
            searchInput.focus();
        }
    }
    renderChart();
}
function moveSelection(direction) {
    const entries = getFilteredMedia();
    if (entries.length === 0) {
        return;
    }
    if (selectedIndex === -1) {
        selectedIndex = direction > 0 ? 0 : entries.length - 1;
    }
    else {
        selectedIndex += direction;
        if (selectedIndex < 0) {
            selectedIndex = entries.length - 1;
        }
        if (selectedIndex >= entries.length) {
            selectedIndex = 0;
        }
    }
    updateSelectedMedia();
}
function focusNewEntry() {
    titleInput.focus();
    titleInput.select();
    titleInput.scrollIntoView({ behavior: "smooth", block: "center" });
}
function focusSearch() {
    searchInput.focus();
    searchInput.select();
    searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
}
async function applyPendingKeyboardAction() {
    const action = sessionStorage.getItem("cadence-keyboard-action");
    if (!action) {
        return;
    }
    sessionStorage.removeItem("cadence-keyboard-action");
    if (action === "search") {
        focusSearch();
        return;
    }
    if (action === "new") {
        focusNewEntry();
        return;
    }
    if (action === "up") {
        moveSelection(-1);
        return;
    }
    if (action === "down") {
        moveSelection(1);
        return;
    }
    if (action === "confirm") {
        if (getFilteredMedia().length > 0) {
            selectedIndex = 0;
            updateSelectedMedia();
        }
        return;
    }
    if (action.startsWith("rate:") && getFilteredMedia().length > 0) {
        const rating = Number(action.slice(5));
        const selected = getFilteredMedia()[0];
        selectedIndex = 0;
        updateSelectedMedia();
        await setMediaRating(selected.id, rating);
    }
}
async function setMediaRating(id, rating) {
    const response = await fetch(`/api/media/${id}/rating`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ rating })
    });
    if (response.ok) {
        const updated = await response.json();
        media = media.map((item) => (item.id === updated.id ? updated : item));
        renderMedia();
        renderChart();
    }
}
function focusControl(direction) {
    const controls = getPageControls();
    const filtered = getFilteredMedia();
    const active = document.activeElement;
    if (isAnalyticsFocused()) {
        if (direction > 0) {
            window.scrollTo({ top: 0, behavior: "instant" });
            controls[0]?.focus();
        }
        else {
            if (filtered.length > 0) {
                selectedIndex = filtered.length - 1;
                updateSelectedMedia();
            }
            else {
                const activeFilter = getActiveFilterTab();
                if (activeFilter) {
                    activeFilter.focus();
                }
                else {
                    controls[controls.length - 1]?.focus();
                }
            }
        }
        return;
    }
    const isCalendar = calendar.contains(active);
    const activeDay = getActiveCalendarDay();
    const currentIndex = isCalendar && activeDay
        ? controls.indexOf(activeDay)
        : controls.indexOf(active);
    if (currentIndex !== -1) {
        if (direction > 0) {
            if (currentIndex < controls.length - 1) {
                controls[currentIndex + 1]?.focus();
            }
            else {
                if (filtered.length > 0) {
                    selectedIndex = 0;
                    updateSelectedMedia();
                }
                else if (getAnalyticsElement()) {
                    focusAnalytics();
                }
                else {
                    controls[0]?.focus();
                }
            }
        }
        else {
            if (currentIndex > 0) {
                controls[currentIndex - 1]?.focus();
            }
            else {
                if (getAnalyticsElement()) {
                    focusAnalytics();
                }
                else if (filtered.length > 0) {
                    selectedIndex = filtered.length - 1;
                    updateSelectedMedia();
                }
                else {
                    controls[controls.length - 1]?.focus();
                }
            }
        }
        return;
    }
    if (selectedIndex >= 0) {
        if (direction > 0) {
            if (selectedIndex < filtered.length - 1) {
                moveSelection(1);
            }
            else {
                selectedIndex = -1;
                updateSelectedMedia();
                if (getAnalyticsElement()) {
                    focusAnalytics();
                }
                else {
                    controls[0]?.focus();
                }
            }
        }
        else {
            if (selectedIndex > 0) {
                moveSelection(-1);
            }
            else {
                selectedIndex = -1;
                updateSelectedMedia();
                const activeFilter = getActiveFilterTab();
                if (activeFilter) {
                    activeFilter.focus();
                }
                else {
                    controls[controls.length - 1]?.focus();
                }
            }
        }
        return;
    }
    const deleteBtn = active ? active.closest(".delete") : null;
    if (deleteBtn) {
        const mediaArticle = deleteBtn.closest(".media");
        const currentIdx = mediaArticle ? Number(mediaArticle.dataset.index) : -1;
        if (direction < 0) {
            mediaArticle?.focus();
        }
        else {
            if (currentIdx < filtered.length - 1 && currentIdx >= 0) {
                selectedIndex = currentIdx + 1;
                updateSelectedMedia();
            }
            else {
                selectedIndex = -1;
                updateSelectedMedia();
                if (getAnalyticsElement()) {
                    focusAnalytics();
                }
                else {
                    controls[0]?.focus();
                }
            }
        }
        return;
    }
    if (direction > 0) {
        controls[0]?.focus();
    }
    else {
        if (getAnalyticsElement()) {
            focusAnalytics();
        }
        else if (filtered.length > 0) {
            selectedIndex = filtered.length - 1;
            updateSelectedMedia();
        }
        else {
            controls[controls.length - 1]?.focus();
        }
    }
}
function changeSelect(select, direction) {
    const nextIndex = (select.selectedIndex + direction + select.options.length) %
        select.options.length;
    select.selectedIndex = nextIndex;
    select.dispatchEvent(new Event("change", { bubbles: true }));
}
async function changeSelectedRating(direction) {
    const selected = getFilteredMedia()[selectedIndex];
    if (!selected) {
        return;
    }
    const rating = Math.max(0, Math.min(5, selected.rating + direction));
    if (rating === selected.rating) {
        return;
    }
    await setMediaRating(selected.id, rating);
}
function toggleTheme() {
    document.body.classList.toggle("light");
    localStorage.setItem("cadence-theme", document.body.classList.contains("light")
        ? "light"
        : "dark");
}
function loadTheme() {
    const savedTheme = localStorage.getItem("cadence-theme");
    if (savedTheme === "light") {
        document.body.classList.add("light");
    }
}
document.addEventListener("keydown", async (event) => {
    const target = event.target;
    if (event.altKey && event.key.toLowerCase() === "t") {
        event.preventDefault();
        toggleTheme();
        return;
    }
    if (event.altKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        window.location.href = "/about";
        return;
    }
    const isTextInput = target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA";
    const deleteBtn = target.closest(".delete");
    if (deleteBtn && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        const id = Number(deleteBtn.dataset.id);
        if (!isNaN(id)) {
            await deleteMedia(id);
        }
        return;
    }
    if (target.classList.contains("media") && event.key === "Enter") {
        event.preventDefault();
        const btn = target.querySelector(".delete");
        btn?.focus();
        return;
    }
    if (event.key === "Enter" && mediaForm.contains(target)) {
        event.preventDefault();
        await addMedia();
        return;
    }
    if (event.key === "Enter" && target === searchInput) {
        event.preventDefault();
        const filtered = getFilteredMedia();
        if (filtered.length > 0) {
            selectedIndex = 0;
            updateSelectedMedia();
        }
        return;
    }
    if (event.key === "Tab") {
        const controls = getPageControls();
        const first = controls[0];
        const filtered = getFilteredMedia();
        if (isAnalyticsFocused()) {
            event.preventDefault();
            if (event.shiftKey) {
                if (filtered.length > 0) {
                    const allMedia = mediaList.querySelectorAll(".media");
                    const lastEl = allMedia[allMedia.length - 1];
                    const lastDelete = lastEl?.querySelector(".delete");
                    (lastDelete || lastEl)?.focus();
                }
                else {
                    const activeFilter = getActiveFilterTab();
                    if (activeFilter) {
                        activeFilter.focus();
                    }
                    else {
                        controls[controls.length - 1]?.focus();
                    }
                }
            }
            else {
                first?.focus();
            }
            return;
        }
        if (event.shiftKey && target === first) {
            event.preventDefault();
            if (getAnalyticsElement()) {
                focusAnalytics();
            }
            else if (filtered.length > 0) {
                const allMedia = mediaList.querySelectorAll(".media");
                const lastEl = allMedia[allMedia.length - 1];
                const lastDelete = lastEl?.querySelector(".delete");
                (lastDelete || lastEl)?.focus();
            }
            else {
                controls[controls.length - 1]?.focus();
            }
            return;
        }
        if (!event.shiftKey) {
            const allDeleteBtns = mediaList.querySelectorAll(".delete");
            const lastDelete = allDeleteBtns[allDeleteBtns.length - 1];
            const allMedia = mediaList.querySelectorAll(".media");
            const lastMedia = allMedia[allMedia.length - 1];
            const lastEl = lastDelete || lastMedia;
            if (lastEl && target === lastEl) {
                event.preventDefault();
                if (getAnalyticsElement()) {
                    focusAnalytics();
                }
                else {
                    first?.focus();
                }
                return;
            }
        }
        const activeFilter = getActiveFilterTab();
        if (target === activeFilter && !event.shiftKey) {
            if (filtered.length > 0) {
                event.preventDefault();
                selectedIndex = 0;
                updateSelectedMedia();
                return;
            }
            else {
                event.preventDefault();
                if (getAnalyticsElement()) {
                    focusAnalytics();
                }
                else {
                    first?.focus();
                }
                return;
            }
        }
    }
    if (target.classList.contains("filter-tab")) {
        const currentIdx = filterTabs.indexOf(target);
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            selectFilterByIndex(currentIdx - 1);
            return;
        }
        if (event.key === "ArrowRight") {
            event.preventDefault();
            selectFilterByIndex(currentIdx + 1);
            return;
        }
        if (event.key === "Home") {
            event.preventDefault();
            selectFilterByIndex(0);
            return;
        }
        if (event.key === "End") {
            event.preventDefault();
            selectFilterByIndex(filterTabs.length - 1);
            return;
        }
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectFilterTab(target);
            return;
        }
    }
    if (isAnalyticsFocused()) {
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            updateChartActiveMonth(activeChartMonthIndex - 1);
            return;
        }
        if (event.key === "ArrowRight") {
            event.preventDefault();
            updateChartActiveMonth(activeChartMonthIndex + 1);
            return;
        }
        if (event.key === "Home") {
            event.preventDefault();
            updateChartActiveMonth(0);
            return;
        }
        if (event.key === "End") {
            event.preventDefault();
            updateChartActiveMonth(chartMonthlyData.length - 1);
            return;
        }
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        focusControl(event.key === "ArrowDown" ? 1 : -1);
        return;
    }
    if (target === aboutLink && event.key === "ArrowRight") {
        event.preventDefault();
        themeButton.focus();
        return;
    }
    if (target === themeButton && event.key === "ArrowLeft") {
        event.preventDefault();
        aboutLink.focus();
        return;
    }
    if (calendar.contains(target) && target.classList.contains("day")) {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            const days = Array.from(calendar.querySelectorAll(".day"));
            const currentIdx = days.indexOf(target);
            if (currentIdx !== -1) {
                const step = event.key === "ArrowRight" ? 1 : -1;
                const nextIdx = Math.max(0, Math.min(days.length - 1, currentIdx + step));
                days[nextIdx]?.focus();
            }
            return;
        }
    }
    if (target instanceof HTMLSelectElement) {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            changeSelect(target, event.key === "ArrowRight" ? 1 : -1);
        }
        return;
    }
    if ((event.key === "ArrowLeft" || event.key === "ArrowRight") &&
        selectedIndex >= 0 &&
        !isTextInput) {
        event.preventDefault();
        await changeSelectedRating(event.key === "ArrowRight" ? 1 : -1);
        return;
    }
    if ((event.key === "/" && !isTextInput) ||
        ((event.altKey || event.ctrlKey) && event.key === "/")) {
        event.preventDefault();
        focusSearch();
        return;
    }
    if ((event.key.toLowerCase() === "n" && !isTextInput && !(target instanceof HTMLSelectElement)) ||
        (event.altKey && event.key.toLowerCase() === "n")) {
        event.preventDefault();
        focusNewEntry();
        return;
    }
    if ((event.key.toLowerCase() === "a" && !isTextInput && !(target instanceof HTMLSelectElement)) ||
        (event.altKey && event.key.toLowerCase() === "a")) {
        event.preventDefault();
        window.location.href = "/about";
        return;
    }
    if ((event.key.toLowerCase() === "t" && !isTextInput && !(target instanceof HTMLSelectElement)) ||
        (event.altKey && event.key.toLowerCase() === "t")) {
        event.preventDefault();
        toggleTheme();
        return;
    }
    if ((event.key.toLowerCase() === "h" && !isTextInput && !(target instanceof HTMLSelectElement)) ||
        (event.altKey && event.key.toLowerCase() === "h")) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        focusNewEntry();
        return;
    }
    if (event.key === "Escape") {
        event.preventDefault();
        if (target === searchInput && searchInput.value) {
            searchInput.value = "";
            selectedIndex = -1;
            renderMedia();
        }
        else if (deleteBtn) {
            const mediaArticle = deleteBtn.closest(".media");
            mediaArticle?.focus();
        }
        else if (selectedIndex >= 0) {
            selectedIndex = -1;
            updateSelectedMedia();
            target.blur();
        }
        else {
            target.blur();
        }
        return;
    }
    if ((event.key === "Delete" || event.key === "Backspace") &&
        !isTextInput) {
        if (deleteBtn) {
            event.preventDefault();
            const id = Number(deleteBtn.dataset.id);
            if (!isNaN(id)) {
                await deleteMedia(id);
            }
            return;
        }
        if (selectedIndex >= 0) {
            event.preventDefault();
            const selected = getFilteredMedia()[selectedIndex];
            if (selected) {
                await deleteMedia(selected.id);
            }
            return;
        }
    }
    if (event.key >= "1" &&
        event.key <= "5" &&
        selectedIndex >= 0 &&
        !isTextInput &&
        !(target instanceof HTMLSelectElement)) {
        event.preventDefault();
        const selected = getFilteredMedia()[selectedIndex];
        if (selected) {
            await setMediaRating(selected.id, Number(event.key));
        }
        return;
    }
});
mediaForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await addMedia();
});
searchInput.addEventListener("input", () => {
    selectedIndex = -1;
    renderMedia();
});
filterSelect.addEventListener("change", () => {
    syncFilterTabsFromSelect();
    selectedIndex = -1;
    renderMedia();
});
filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        selectFilterTab(tab);
    });
});
if (themeButton) {
    themeButton.addEventListener("click", () => {
        toggleTheme();
    });
}
const searchSymbol = document.querySelector(".search-symbol");
if (searchSymbol) {
    searchSymbol.addEventListener("click", () => {
        focusSearch();
    });
}
mediaList.addEventListener("click", async (event) => {
    const target = event.target;
    const deleteButton = target.closest(".delete");
    if (deleteButton) {
        event.preventDefault();
        event.stopPropagation();
        const id = Number(deleteButton.dataset.id);
        if (!isNaN(id)) {
            await deleteMedia(id);
        }
        return;
    }
    const mediaArticle = target.closest(".media");
    if (mediaArticle) {
        const index = Number(mediaArticle.dataset.index);
        if (!isNaN(index)) {
            selectedIndex = index;
            updateSelectedMedia();
        }
    }
});
mediaList.addEventListener("focusin", (event) => {
    const target = event.target;
    const mediaArticle = target.closest(".media");
    if (mediaArticle) {
        const index = Number(mediaArticle.dataset.index);
        if (!isNaN(index) && index !== selectedIndex) {
            selectedIndex = index;
            const entries = Array.from(mediaList.querySelectorAll(".media"));
            entries.forEach((entry, idx) => {
                entry.style.outline =
                    idx === selectedIndex ? "2px solid var(--accent)" : "none";
                entry.style.outlineOffset =
                    idx === selectedIndex ? "2px" : "0";
            });
        }
    }
});
document.addEventListener("focusin", (event) => {
    const target = event.target;
    if (!mediaList.contains(target) && selectedIndex !== -1) {
        selectedIndex = -1;
        updateSelectedMedia();
    }
});
const analyticsEl = getAnalyticsElement();
if (analyticsEl) {
    analyticsEl.addEventListener("focus", () => {
        updateChartActiveMonth(activeChartMonthIndex);
    });
}
loadTheme();
loadMedia();
focusNewEntry();
disableMouse();
export {};
