//login
function profilelogin(){
  let oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth";

  let form = document.createElement("form");
  form.setAttribute("method", "POST");
  form.setAttribute("action",oauth2Endpoint);

  let params ={
    "client_id":"771114475204-olqejspffto4g9kikfqqcmbn3bakqd78.apps.googleusercontent.com",
    "redirect_uri":"http://localhost:3000",
    "response_type":"token",
    "scope":"https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/youtube.readonly",
    "include_granted_scopes":"true",
    "state":"pass-through-value",
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

let profileparams={};

let regex = /([^&=]+)=([^&]*)/g,m

while(m= regex.exec(location.href)){
  profileparams[decodeURIComponent(m[1])] = decodeURIComponent(m[2])
}

if(Object.keys(profileparams).length >0){
  localStorage.setItem('authinfo',JSON.stringify(profileparams))
}

//hide the access token

window.history.pushState({},document.title)

let info = JSON.parse(localStorage.getItem('authinfo'))
// console.log(JSON.parse(localStorage.getItem('authinfo')))
// console.log(info['access_token'])
// console.log(info['expires_in'])

fetch("https://www.googleapis.com/oauth2/v3/userinfo",{
  headers: { 
    'Authorization':`Bearer ${info['access_token']}`, 
}
})
.then((data)=>data.json())
.then((info)=> {
    // console.log(info)
 
    document.getElementById("profile-name").innerHTML += info.name;
    document.getElementById("profile-img").setAttribute('src',info.picture);
    if(info.picture){
    document.getElementById("main-profile-img").setAttribute('src',info.picture);
    }else{
      document.getElementById("main-profile-img").setAttribute('src',"./img/default-profile.png");
    }
    if(info.name!=undefined){
      document.getElementById("profile-logout").style.display="flex";
      document.getElementById("profile-editprofile").style.display="flex";
      document.getElementById("profile-login").style.display="none";
      document.querySelector(".info-user").style.display="flex";
      document.getElementById("cartbtn").style.display="flex";
      document.getElementById("note").style.display="none";

    }
    else{
      document.getElementById("profile-logout").style.display="none";
      document.querySelector(".info-user").style.display="none";
      document.getElementById("profile-editprofile").style.display="none";
      document.getElementById("profile-login").style.display="flex";
      document.getElementById("cartbtn").style.display="none";
      document.getElementById("note").style.display="block";
    }
})

function profilelogout() {
  fetch("https://oauth2.googleapis.com/revoke?token=" + info['access_token'], {
    method: 'POST',
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    }
  })
  .then((data) => {
    // Update the UI after successful logout
    document.getElementById("profile-logout").style.display = "none";
    document.querySelector(".info-user").style.display = "none";
    document.getElementById("profile-editprofile").style.display = "none";
    document.getElementById("profile-login").style.display = "flex";
    document.getElementById("cartbtn").style.display="none";
    document.getElementById("note").style.display="block";
    document.getElementById("main-profile-img").setAttribute('src',"./img/default-profile.png");
    // location.href = "http://localhost:3000"; // Redirect if needed
  })
  .catch((error) => {
    console.error('Logout failed:', error);
  });
}
