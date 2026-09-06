const themeButton = document.getElementById("themeButton") as HTMLButtonElement | null;
const backLink = (document.getElementById("backLink") ||
    document.querySelector(".about-back a")) as HTMLAnchorElement | null;

const aboutControls: HTMLElement[] = [];
if (themeButton) aboutControls.push(themeButton);
if (backLink) aboutControls.push(backLink);

function disableMouse(): void {
    const blockPointer = (e: Event) => {
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

    window.addEventListener(
        "click",
        (e: MouseEvent) => {
            const pe = e as PointerEvent;
            if (pe.pointerType === "mouse" || pe.pointerType === "touch" || pe.pointerType === "pen" || e.detail > 0) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        },
        { capture: true }
    );
}

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

function returnToCadence(action?: string): void {
    if (action) {
        sessionStorage.setItem("cadence-keyboard-action", action);
    }
    window.location.href = "/";
}

function focusAboutControl(direction: number): void {
    if (aboutControls.length === 0) return;

    const current = document.activeElement as HTMLElement;
    const currentIndex = aboutControls.indexOf(current);

    if (currentIndex === -1) {
        aboutControls[direction > 0 ? 0 : aboutControls.length - 1]?.focus();
        return;
    }

    const nextIndex =
        (currentIndex + direction + aboutControls.length) % aboutControls.length;
    aboutControls[nextIndex]?.focus();
}

if (themeButton) {
    themeButton.addEventListener("click", () => {
        toggleTheme();
    });
}

document.addEventListener("keydown", (event) => {
    const target = event.target as HTMLElement;

    if (event.altKey && event.key.toLowerCase() === "t") {
        event.preventDefault();
        toggleTheme();
        return;
    }

    if (event.altKey && event.key.toLowerCase() === "h") {
        event.preventDefault();
        returnToCadence();
        return;
    }

    const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT";

    if (isTyping) {
        return;
    }

    if (event.key === "Tab") {
        const first = aboutControls[0];
        const last = aboutControls[aboutControls.length - 1];
        if (event.shiftKey && target === first) {
            event.preventDefault();
            last?.focus();
            return;
        }
        if (!event.shiftKey && target === last) {
            event.preventDefault();
            first?.focus();
            return;
        }
    }

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        focusAboutControl(event.key === "ArrowDown" ? 1 : -1);
        return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        if (target === themeButton) {
            event.preventDefault();
            toggleTheme();
            return;
        }
        if (target === backLink && event.key === "ArrowLeft") {
            event.preventDefault();
            returnToCadence();
            return;
        }
    }

    if (event.key === "Enter") {
        if (target === themeButton) {
            event.preventDefault();
            toggleTheme();
            return;
        }
        if (target === backLink) {
            event.preventDefault();
            returnToCadence();
            return;
        }
        event.preventDefault();
        returnToCadence("confirm");
        return;
    }

    if (event.key === " ") {
        if (target === themeButton) {
            event.preventDefault();
            toggleTheme();
            return;
        }
        if (target === backLink) {
            event.preventDefault();
            returnToCadence();
            return;
        }
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
        returnToCadence();
        return;
    }

    if (event.key === "Escape") {
        event.preventDefault();
        returnToCadence();
        return;
    }
});

loadTheme();
disableMouse();