async function loadSection(name) {
  const out = document.getElementById(`${name}-out`);
  out.textContent = `Fetching /${name}/ …`;
  try {
    const res = await fetch(`/${name}/`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const json = await res.json();
    out.textContent = JSON.stringify(json, null, 2);
  } catch (err) {
    out.textContent = `Error: ${err.message}`;
  }
}

function openDocs(name) {
  window.open(`/${name}/docs`, '_blank');
}
