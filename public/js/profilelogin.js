//login
const GOOGLE_CLIENT_ID = "771114475204-olqejspffto4g9kikfqqcmbn3bakqd78.apps.googleusercontent.com";
const DEFAULT_PROFILE_IMG = "./img/default-profile.png";

function profilelogin(){
  let oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth";

  // Random state protects against a forged redirect (checked when Google sends the user back)
  const state = crypto.getRandomValues(new Uint32Array(4)).join("-");
  sessionStorage.setItem("oauthState", state);

  let form = document.createElement("form");
  form.setAttribute("method", "GET");
  form.setAttribute("action",oauth2Endpoint);

  let params ={
    "client_id": GOOGLE_CLIENT_ID,
    // Must be listed under "Authorized redirect URIs" for this client in Google Cloud Console
    "redirect_uri": window.location.origin + "/",
    "response_type":"token",
    "scope":"https://www.googleapis.com/auth/userinfo.profile",
    "include_granted_scopes":"true",
    "state": state,
  }
  for (var key in params) {
    let input = document.createElement("input");
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', key);
    input.setAttribute('value', params[key]);
    form.appendChild(input);
  }
  document.body.appendChild(form);

  form.submit()
}

// Google returns the token in the URL fragment: #state=...&access_token=...&expires_in=...
function readTokenFromRedirect() {
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  if (!hashParams.has("access_token") && !hashParams.has("error")) return;

  const expectedState = sessionStorage.getItem("oauthState");
  sessionStorage.removeItem("oauthState");
  if (hashParams.has("access_token") && expectedState && hashParams.get("state") === expectedState) {
    const expiresIn = parseInt(hashParams.get("expires_in"), 10) || 3600;
    localStorage.setItem("authinfo", JSON.stringify({
      access_token: hashParams.get("access_token"),
      expires_at: Date.now() + expiresIn * 1000,
    }));
  }
  // Remove the token from the address bar and history
  window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
}

function getStoredAuth() {
  try {
    const auth = JSON.parse(localStorage.getItem("authinfo"));
    if (auth?.access_token && (!auth.expires_at || auth.expires_at > Date.now())) return auth;
  } catch (e) {
    // fall through to clearing invalid data
  }
  localStorage.removeItem("authinfo");
  return null;
}

function setDisplay(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.style.display = value;
}

function setLoggedIn(loggedIn) {
  setDisplay("#profile-logout", loggedIn ? "flex" : "none");
  setDisplay("#profile-editprofile", loggedIn ? "flex" : "none");
  setDisplay("#profile-login", loggedIn ? "none" : "flex");
  setDisplay(".info-user", loggedIn ? "flex" : "none");
  setDisplay("#cartbtn", loggedIn ? "flex" : "none");
  setDisplay("#note", loggedIn ? "none" : "block");
  if (!loggedIn) {
    document.getElementById("main-profile-img")?.setAttribute("src", DEFAULT_PROFILE_IMG);
  }
}

function showProfile(user) {
  const [first = "", last = ""] = (user.name || "").split(" ");
  const firstname = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  const profileName = document.getElementById("profile-name");
  if (profileName) profileName.textContent = `${firstname} ${last}`.trim();

  const picture = user.picture || DEFAULT_PROFILE_IMG;
  document.getElementById("profile-img")?.setAttribute("src", picture);
  document.getElementById("main-profile-img")?.setAttribute("src", picture);
  setLoggedIn(true);
}

readTokenFromRedirect();
let info = getStoredAuth();

if (info) {
  fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { 'Authorization': `Bearer ${info.access_token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error(`userinfo failed: ${res.status}`);
      return res.json();
    })
    .then(showProfile)
    .catch((error) => {
      console.error(error);
      localStorage.removeItem("authinfo");
      info = null;
      setLoggedIn(false);
    });
} else {
  setLoggedIn(false);
}


function profilelogout() {
  const token = info?.access_token;
  localStorage.removeItem("authinfo");
  info = null;
  setLoggedIn(false);

  if (token) {
    fetch("https://oauth2.googleapis.com/revoke?token=" + encodeURIComponent(token), {
      method: 'POST',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      }
    }).catch((error) => {
      console.error('Token revoke failed:', error);
    });
  }
}
