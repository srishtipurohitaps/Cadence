const themeButton = document.getElementById("themeButton");
const backLink = document.querySelector(".about-back a");
const aboutControls = [themeButton, backLink];
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
function returnToCadence(action) {
    sessionStorage.setItem("cadence-keyboard-action", action);
    window.location.href = "/";
}
function focusAboutControl(direction) {
    const currentIndex = aboutControls.indexOf(document.activeElement);
    if (currentIndex === -1) {
        aboutControls[direction > 0 ? 0 : aboutControls.length - 1].focus();
        return;
    }
    const nextIndex = (currentIndex + direction + aboutControls.length) %
        aboutControls.length;
    aboutControls[nextIndex].focus();
}
document.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
        event.preventDefault();
        return;
    }
    const target = event.target;
    const isOwnControl = aboutControls.includes(target);
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
    const isTyping = target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT";
    if (event.key === "PageDown" && !isTyping) {
        event.preventDefault();
        window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
        return;
    }
    if (event.key === "PageUp" && !isTyping) {
        event.preventDefault();
        window.scrollBy({ top: -window.innerHeight * 0.85, behavior: "smooth" });
        return;
    }
    if (event.key === "Home" && !isTyping) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }
    if (event.key === "End" && !isTyping) {
        event.preventDefault();
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        return;
    }
    if (event.key === " " && !isTyping && target.tagName !== "BUTTON") {
        event.preventDefault();
        window.scrollBy({
            top: event.shiftKey ? -window.innerHeight * 0.85 : window.innerHeight * 0.85,
            behavior: "smooth"
        });
        return;
    }
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
        focusAboutControl(event.key === "ArrowDown" ? 1 : -1);
        return;
    }
    if (event.key === "Enter" && target === themeButton) {
        event.preventDefault();
        toggleTheme();
        return;
    }
    if (event.key === "Enter" && target === backLink) {
        event.preventDefault();
        window.location.href = "/";
        return;
    }
    if (event.key === "Enter" && !isOwnControl) {
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
export {};
