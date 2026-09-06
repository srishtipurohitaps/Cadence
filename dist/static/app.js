let media = [];
let selectedIndex = -1;
let chart = null;
const mediaList = document.getElementById("mediaList");
const emptyState = document.getElementById("empty");
const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");
const mediaForm = document.getElementById("mediaForm");
const titleInput = document.getElementById("title");
const mediaType = document.getElementById("mediaType");
const genreInput = document.getElementById("genre");
const ratingInput = document.getElementById("rating");
const streakElement = document.getElementById("streak");
const totalElement = document.getElementById("total");
const longestElement = document.getElementById("longest");
const calendar = document.getElementById("calendar");
const activityText = document.getElementById("activityText");
const themeButton = document.getElementById("themeButton");
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
        const matchesFilter = filter === "All" || item.type === filter;
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
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().slice(0, 10);
        const count = counts.get(dateString) || 0;
        const day = document.createElement("div");
        day.className = "day";
        if (count > 0) {
            day.classList.add("active");
        }
        if (count > 1 && count < maxCount) {
            day.classList.add("high");
        }
        if (count === maxCount && count > 0) {
            day.classList.add("highest");
        }
        day.title = `${formatDate(dateString)} · ${count} finished`;
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
        article.tabIndex = -1;
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
                    class="delete"
                    data-id="${item.id}"
                    aria-label="Delete ${escapeHtml(item.title)}"
                    tabindex="-1"
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
        entries[selectedIndex].focus({
            preventScroll: true
        });
        entries[selectedIndex].scrollIntoView({
            block: "nearest"
        });
    }
}
function renderChart() {
    const canvas = document.getElementById("chart");
    if (!canvas || typeof Chart === "undefined") {
        return;
    }
    const monthlyCounts = new Map();
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - i);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlyCounts.set(key, 0);
    }
    for (const item of media) {
        const date = new Date(item.finished_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyCounts.has(key)) {
            monthlyCounts.set(key, (monthlyCounts.get(key) || 0) + 1);
        }
    }
    const labels = Array.from(monthlyCounts.keys()).map((key) => {
        const [year, month] = key.split("-");
        return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", {
            month: "short"
        });
    });
    const values = Array.from(monthlyCounts.values());
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
                    pointRadius: 3,
                    pointHoverRadius: 5
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
    const response = await fetch(`/api/media/${id}`, {
        method: "DELETE"
    });
    if (!response.ok) {
        return;
    }
    media = media.filter((item) => item.id !== id);
    selectedIndex = -1;
    updateStats();
    renderCalendar();
    renderMedia();
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
}
function focusSearch() {
    searchInput.focus();
    searchInput.select();
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
        const response = await fetch(`/api/media/${selected.id}/rating`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ rating })
        });
        if (response.ok) {
            const updated = await response.json();
            media = media.map((item) => item.id === updated.id ? updated : item);
            renderMedia();
            renderChart();
        }
    }
}
function focusNextFormField() {
    const fields = [
        titleInput,
        mediaType,
        genreInput,
        ratingInput
    ];
    const currentIndex = fields.indexOf(document.activeElement);
    const nextIndex = currentIndex === -1
        ? 0
        : (currentIndex + 1) % fields.length;
    fields[nextIndex].focus();
}
function focusPreviousFormField() {
    const fields = [
        titleInput,
        mediaType,
        genreInput,
        ratingInput
    ];
    const currentIndex = fields.indexOf(document.activeElement);
    const previousIndex = currentIndex <= 0
        ? fields.length - 1
        : currentIndex - 1;
    fields[previousIndex].focus();
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
    if (event.key === "Tab") {
        event.preventDefault();
        return;
    }
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
    const isTyping = target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT";
    if (event.key === "/" && !isTyping) {
        event.preventDefault();
        focusSearch();
        return;
    }
    if (event.key.toLowerCase() === "n" && !isTyping) {
        event.preventDefault();
        focusNewEntry();
        return;
    }
    if (event.key.toLowerCase() === "a" && !isTyping) {
        event.preventDefault();
        window.location.href = "/about";
        return;
    }
    if (event.key === "Escape") {
        event.preventDefault();
        if (isTyping) {
            target.blur();
        }
        else {
            window.location.href = "/";
        }
        return;
    }
    if (event.key === "ArrowDown") {
        event.preventDefault();
        moveSelection(1);
        return;
    }
    if (event.key === "ArrowUp") {
        event.preventDefault();
        moveSelection(-1);
        return;
    }
    if (event.key.toLowerCase() === "t" && !isTyping) {
        event.preventDefault();
        toggleTheme();
        return;
    }
    if (event.key === "Enter" && selectedIndex >= 0 && !isTyping) {
        event.preventDefault();
        const selected = getFilteredMedia()[selectedIndex];
        if (selected) {
            await deleteMedia(selected.id);
        }
        return;
    }
    if (event.key === "Delete" &&
        selectedIndex >= 0 &&
        !isTyping) {
        event.preventDefault();
        const selected = getFilteredMedia()[selectedIndex];
        if (selected) {
            await deleteMedia(selected.id);
        }
        return;
    }
    if (event.key >= "1" &&
        event.key <= "5" &&
        selectedIndex >= 0 &&
        !isTyping) {
        event.preventDefault();
        const selected = getFilteredMedia()[selectedIndex];
        if (!selected) {
            return;
        }
        const rating = Number(event.key);
        const response = await fetch(`/api/media/${selected.id}/rating`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                rating
            })
        });
        if (response.ok) {
            const updated = await response.json();
            media = media.map((item) => item.id === updated.id
                ? updated
                : item);
            renderMedia();
            renderChart();
        }
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
    selectedIndex = -1;
    renderMedia();
});
document.addEventListener("pointerdown", (event) => {
    event.preventDefault();
}, { capture: true });
document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});
loadTheme();
loadMedia();
export {};
