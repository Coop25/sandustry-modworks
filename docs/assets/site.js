const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = document.querySelector("[data-nav-links]");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll("pre").forEach((pre) => {
  if (pre.closest(".terminal") || pre.parentElement?.classList.contains("code-wrap")) return;
  const wrap = document.createElement("div");
  wrap.className = "code-wrap";
  pre.parentNode.insertBefore(wrap, pre);
  wrap.appendChild(pre);

  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "copy-button";
  copy.textContent = "Copy";
  copy.setAttribute("aria-label", "Copy code example");
  copy.addEventListener("click", async () => {
    await navigator.clipboard.writeText(pre.innerText);
    copy.textContent = "Copied";
    window.setTimeout(() => { copy.textContent = "Copy"; }, 1400);
  });
  wrap.appendChild(copy);
});
