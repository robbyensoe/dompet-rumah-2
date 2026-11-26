// DompetRumah — the router. Hash routes keep every page reachable from the
// static files alone; the dashboard is the cover. After each render the
// page's controls are wired, the nav marks the page you are on, and the
// shell signals that a screenshot may be taken.

import {
  dashboardPage, goalsPage, guidePage, missingPage, mountDashboard,
  mountGoals, mountPlanner, plannerPage,
} from './views.js';

const ROUTES = {
  '/': { page: dashboardPage, mount: mountDashboard },
  '/planner': { page: plannerPage, mount: mountPlanner },
  '/goals': { page: goalsPage, mount: mountGoals },
  '/guide': { page: guidePage, mount: null },
};

function currentKey() {
  return location.hash.replace(/^#/, '') || '/';
}

function render() {
  const app = document.getElementById('app');
  const found = ROUTES[currentKey()];
  const r = found || { page: missingPage, mount: null };
  app.innerHTML = r.page();
  if (r.mount) r.mount();
  const key = currentKey();
  document.querySelectorAll('nav a').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === `#${key}`);
  });
  window.scrollTo(0, 0);
  // A screenshot is safe the moment the page has rendered.
  requestAnimationFrame(() => {
    window.__shotReady = true;
  });
}

window.addEventListener('hashchange', render);
render();
