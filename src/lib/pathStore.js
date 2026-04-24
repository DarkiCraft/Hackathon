const KEY = "skillgraph_paths";

export function loadPaths() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function savePath(path) {
  // path = { id, goal, knownSkills, missingSkills, learningPlan, savedAt }
  const paths = loadPaths();
  const existing = paths.findIndex(p => p.id === path.id);
  if (existing >= 0) paths[existing] = path;
  else paths.unshift(path); // newest first
  localStorage.setItem(KEY, JSON.stringify(paths));
  return path;
}

export function deletePath(id) {
  const paths = loadPaths().filter(p => p.id !== id);
  localStorage.setItem(KEY, JSON.stringify(paths));
}