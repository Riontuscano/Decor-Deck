// Clerk authentication: loads Clerk, keeps the profile menu in sync and provides session tokens
const DEFAULT_PROFILE_IMG = "./img/default-profile.png";

function setDisplay(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.style.display = value;
}

function renderUser(user) {
  const loggedIn = Boolean(user);
  setDisplay("#profile-logout", loggedIn ? "flex" : "none");
  setDisplay("#profile-editprofile", loggedIn ? "flex" : "none");
  setDisplay("#profile-login", loggedIn ? "none" : "flex");
  setDisplay(".info-user", loggedIn ? "flex" : "none");
  setDisplay("#cartbtn", loggedIn ? "flex" : "none");
  setDisplay("#note", loggedIn ? "none" : "block");

  const picture = user?.imageUrl || DEFAULT_PROFILE_IMG;
  document.getElementById("profile-img")?.setAttribute("src", picture);
  document.getElementById("main-profile-img")?.setAttribute("src", picture);
  const profileName = document.getElementById("profile-name");
  if (profileName) {
    profileName.textContent = user
      ? user.fullName || user.username || user.primaryEmailAddress?.emailAddress || ""
      : "";
  }
}

// Load Clerk from the instance's Frontend API, which is encoded in the publishable key
const clerkReady = (async () => {
  const res = await fetch("/api/config");
  const { clerkPublishableKey } = await res.json();
  if (!clerkPublishableKey) throw new Error("Clerk is not configured");

  const frontendApi = atob(clerkPublishableKey.split("_")[2]).slice(0, -1);
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://${frontendApi}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-clerk-publishable-key", clerkPublishableKey);
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load Clerk"));
    document.head.appendChild(script);
  });

  await window.Clerk.load();
  renderUser(window.Clerk.user);
  window.Clerk.addListener(({ user }) => renderUser(user));
  return window.Clerk;
})();

renderUser(null);
clerkReady.catch((error) => console.error("Sign-in unavailable:", error));

async function getClerk() {
  try {
    return await clerkReady;
  } catch (error) {
    alert("Sign-in is currently unavailable. Please try again later.");
    return null;
  }
}

async function profilelogin() {
  (await getClerk())?.openSignIn();
}

async function profilelogout() {
  await (await getClerk())?.signOut();
}

document.getElementById("profile-editprofile")?.addEventListener("click", async (event) => {
  event.preventDefault();
  (await getClerk())?.openUserProfile();
});

// Session token for API calls; null when signed out or Clerk is unavailable
async function getAuthToken() {
  try {
    const clerk = await clerkReady;
    return clerk.session ? await clerk.session.getToken() : null;
  } catch (error) {
    return null;
  }
}
