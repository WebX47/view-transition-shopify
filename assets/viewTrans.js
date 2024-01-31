console.log("hi");

async function getPageContent(url) {
  // This is a really scrappy way to do this.
  // Don't do this in production!
  const response = await fetch(url);
  const text = await response.text();
  return text;
}

function isBackNavigation(navigateEvent) {
  if (
    navigateEvent.navigationType === "push" ||
    navigateEvent.navigationType === "replace"
  ) {
    return false;
  }
  if (
    navigateEvent.destination.index !== -1 &&
    navigateEvent.destination.index < navigation.currentEntry.index
  ) {
    return true;
  }
  return false;
}

async function onLinkNavigate(callback) {
  navigation.addEventListener("navigate", (event) => {
    const toUrl = new URL(event.destination.url);

    if (location.origin !== toUrl.origin) return;

    const fromPath = location.pathname;
    const isBack = isBackNavigation(event);

    event.intercept({
      async handler() {
        if (event.info === "ignore") return;

        await callback({
          toPath: toUrl.pathname,
          fromPath,
          isBack,
        });
      },
    });
  });
}

onLinkNavigate(async ({ toPath }) => {
  const content = await getPageContent(toPath);

  startViewTransition(() => {
    // This is a pretty heavy-handed way to update page content.
    // innerHTML is used here just to keep the DOM update super simple.
    document.body.innerHTML = content;
  });
});

// A little helper function like this is really handy
// to handle progressive enhancement.
function startViewTransition(callback) {
  if (!document.startViewTransition) {
    callback();
    return;
  }

  document.startViewTransition(callback);
}

// This is a pretty bad way to do this, but let's do whatever takes to experminet fast
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("a[id^='CardLink-template']").forEach((linkEl) => {
    linkEl.addEventListener("click", (e) => {
      console.log("hi");
      e.target
        .closest(".card--media")
        .querySelector(".card__inner")
        .classList.add("prod-img");
    });
  });
});
