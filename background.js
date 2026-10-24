// ResearchMate: background service worker
// Adds a right-click menu and saves every marked clip with its source.

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "rm-add-text",
    title: "Add to research",
    contexts: ["selection"],
  });
  chrome.contextMenus.create({
    id: "rm-add-image",
    title: "Add image to research",
    contexts: ["image"],
  });
});

async function updateBadge() {
  const { clips = [] } = await chrome.storage.local.get("clips");
  chrome.action.setBadgeBackgroundColor({ color: "#E5231F" });
  chrome.action.setBadgeText({ text: clips.length ? String(clips.length) : "" });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const isImage = info.menuItemId === "rm-add-image";
  const content = isImage ? info.srcUrl : (info.selectionText || "").trim();
  if (!content) return;

  const clip = {
    id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    type: isImage ? "image" : "text",
    content,
    source: {
      title: (tab && tab.title) || "Untitled page",
      url: info.pageUrl || (tab && tab.url) || "",
    },
    ts: Date.now(),
  };

  const { clips = [] } = await chrome.storage.local.get("clips");
  clips.push(clip);
  await chrome.storage.local.set({ clips });
  updateBadge();
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.clips) updateBadge();
});
chrome.runtime.onStartup.addListener(updateBadge);
