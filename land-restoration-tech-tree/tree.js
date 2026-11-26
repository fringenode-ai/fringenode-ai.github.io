/* Progressive enhancement for the Land Restoration Tech Tree map.
   The page is a full document without this file. */
(function () {
  const root = document.documentElement;
  const map = document.getElementById("map");
  if (!map) return;

  const chips = Array.from(map.querySelectorAll('input[name="stage"]'));
  const showAll = map.querySelector("[data-show-all]");
  const countEl = map.querySelector("[data-count]");
  const nodes = Array.from(map.querySelectorAll(".tree-node"));
  const panel = map.querySelector(".tree-panel");
  const panelBody = map.querySelector(".panel-body");
  const panelTitle = map.querySelector(".panel-title");
  const panelClose = map.querySelector(".panel-close");
  const wide = () => window.matchMedia("(min-width: 900px)").matches;

  root.classList.add("map-enhanced");

  function stagesOn() {
    const on = chips.filter((c) => c.checked).map((c) => c.value);
    return on.length ? on : ["early", "mid", "late", "research"];
  }

  function applyFilter() {
    const on = stagesOn();
    let visible = 0;
    nodes.forEach((n) => {
      const show = on.includes(n.dataset.stage);
      n.classList.toggle("node-hidden", !show);
      if (!show && n.classList.contains("is-selected")) select(null, { silent: true });
      if (show) visible += 1;
    });
    document.querySelectorAll(".tree-subarea").forEach((s) => {
      const any = s.querySelector(".tree-node:not(.node-hidden)");
      s.hidden = !any;
    });
    document.querySelectorAll(".tree-area").forEach((s) => {
      const any = s.querySelector(".tree-node:not(.node-hidden)");
      s.hidden = !any;
    });
    if (countEl) {
      countEl.textContent =
        visible === nodes.length
          ? "35 parts shown"
          : visible + " of 35 parts shown";
    }
    if (showAll) showAll.hidden = visible === nodes.length;
  }

  function select(node, opts) {
    const silent = opts && opts.silent;
    nodes.forEach((n) => {
      n.classList.remove("is-selected");
      const btn = n.querySelector(".tree-open-btn");
      if (btn) {
        btn.setAttribute("aria-expanded", "false");
        btn.textContent = "Open this part";
      }
    });
    if (!node) {
      if (panel) {
        panel.classList.add("is-empty");
        if (panelTitle) panelTitle.textContent = "Part details";
        if (panelBody) panelBody.innerHTML = "";
      }
      return;
    }
    node.classList.add("is-selected");
    const btn = node.querySelector(".tree-open-btn");
    if (btn) {
      btn.setAttribute("aria-expanded", "true");
      btn.textContent = "This part is open";
    }
    const body = node.querySelector(".node-body");
    const title = node.querySelector(".node-title");
    if (panel && body) {
      panel.classList.remove("is-empty");
      if (panelTitle) panelTitle.textContent = title ? title.innerText : node.id;
      panelBody.innerHTML = body.innerHTML;
    }
    if (!silent) {
      if (history.replaceState) history.replaceState(null, "", "#" + node.id);
      const dest = wide() ? (panelTitle || panel) : node.querySelector("h4, .node-title") || node;
      if (dest && dest.focus) {
        dest.setAttribute("tabindex", "-1");
        dest.focus({ preventScroll: true });
      }
      if (!wide()) {
        const back = node.querySelector(".tree-back");
        if (back) back.hidden = false;
        node.scrollIntoView({ block: "start" });
      }
    }
  }

  nodes.forEach((n) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tree-open-btn";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "tree-panel");
    btn.textContent = "Open this part";
    n.querySelector(".node-badges")?.after(btn);
    btn.addEventListener("click", () => {
      const already = n.classList.contains("is-selected");
      select(already && !wide() ? null : n);
    });
    const back = document.createElement("a");
    back.href = "#map";
    back.className = "tree-back";
    back.textContent = "Back to the map";
    back.hidden = true;
    const body = n.querySelector(".node-body");
    if (body) body.prepend(back);
    back.addEventListener("click", (e) => {
      e.preventDefault();
      const b = n.querySelector(".tree-open-btn");
      select(null);
      if (b) b.focus();
    });
  });

  chips.forEach((c) => c.addEventListener("change", applyFilter));
  if (showAll) {
    showAll.addEventListener("click", () => {
      chips.forEach((c) => { c.checked = true; });
      applyFilter();
      showAll.focus();
    });
  }
  if (panelClose) {
    panelClose.addEventListener("click", () => {
      const current = map.querySelector(".tree-node.is-selected");
      select(null);
      const b = current && current.querySelector(".tree-open-btn");
      if (b) b.focus();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const current = map.querySelector(".tree-node.is-selected");
      if (!current) return;
      const b = current.querySelector(".tree-open-btn");
      select(null);
      if (b) b.focus();
    }
  });

  map.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#LR"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    const node = document.getElementById(id);
    if (!node || !node.classList.contains("tree-node") || node.classList.contains("node-hidden")) return;
    e.preventDefault();
    select(node);
    if (!wide()) node.scrollIntoView({ block: "nearest" });
  });

  applyFilter();
  if (location.hash && location.hash.startsWith("#LR")) {
    const node = document.getElementById(location.hash.slice(1));
    if (node && node.classList.contains("tree-node")) select(node, { silent: true });
  } else if (panel) {
    panel.classList.add("is-empty");
  }
})();
