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

document.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
        event.preventDefault();
        return;
    }

    const target = event.target as HTMLElement;

    const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT";

    if (isTyping) {
        return;
    }

    if (event.key.toLowerCase() === "t") {
        event.preventDefault();
        toggleTheme();
        return;
    }

    if (event.key === "Escape") {
        event.preventDefault();
        window.location.href = "/";
        return;
    }
});

themeButton.addEventListener("click", (event) => {
    event.preventDefault();
});

loadTheme();