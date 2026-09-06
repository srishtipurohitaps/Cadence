const themeButton = document.getElementById("themeButton") as HTMLButtonElement;

function toggleTheme(): void {
    document.body.classList.toggle("light");

    localStorage.setItem(
        "cadence-theme",
        document.body.classList.contains("light")
            ? "light"
            : "dark"
    );
}

function loadTheme(): void {
    const savedTheme = localStorage.getItem("cadence-theme");

    if (savedTheme === "light") {
        document.body.classList.add("light");
    }
}

function returnToCadence(action: string): void {
    sessionStorage.setItem("cadence-keyboard-action", action);
    window.location.href = "/";
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
        event.preventDefault();
        return;
    }

    const target = event.target as HTMLElement;

    if (event.altKey && event.key.toLowerCase() === "t") {
        event.preventDefault();
        toggleTheme();
        return;
    }

    if (event.altKey && event.key.toLowerCase() === "h") {
        event.preventDefault();
        window.location.href = "/";
        return;
    }

    const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT";

    if (isTyping) {
        return;
    }

    if (event.key === "/") {
        event.preventDefault();
        returnToCadence("search");
        return;
    }

    if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        returnToCadence("new");
        return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        returnToCadence(event.key === "ArrowUp" ? "up" : "down");
        return;
    }

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        window.location.href = "/";
        return;
    }

    if (event.key === "ArrowRight") {
        event.preventDefault();
        toggleTheme();
        return;
    }

    if (event.key === "Enter") {
        event.preventDefault();
        returnToCadence("confirm");
        return;
    }

    if (event.key >= "1" && event.key <= "5") {
        event.preventDefault();
        returnToCadence(`rate:${event.key}`);
        return;
    }

    if (event.key.toLowerCase() === "t") {
        event.preventDefault();
        toggleTheme();
        return;
    }

    if (event.key.toLowerCase() === "h") {
        event.preventDefault();
        window.location.href = "/";
        return;
    }

    if (event.key === "Escape") {
        event.preventDefault();
        window.location.href = "/";
        return;
    }
});

for (const eventName of [
    "click",
    "dblclick",
    "auxclick",
    "pointerdown",
    "pointerup",
    "pointermove",
    "contextmenu",
    "dragstart",
    "touchstart",
    "touchmove",
    "touchend"
]) {
    document.addEventListener(eventName, (event) => {
        event.preventDefault();
    }, { capture: true, passive: false });
}

document.addEventListener("wheel", (event) => {
    event.preventDefault();
}, { capture: true, passive: false });

loadTheme();