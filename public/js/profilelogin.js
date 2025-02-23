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
    "scope":"https://www.googleapis.com/auth/userinfo.profile",
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


window.history.pushState({},document.title)

let info = JSON.parse(localStorage.getItem('authinfo'))
// console.log(JSON.parse(localStorage.getItem('authinfo')))
// console.log(info['access_token'])
// console.log(info['expires_in'])
try {
  fetch("https://www.googleapis.com/oauth2/v3/userinfo",{
    headers: { 
      'Authorization':`Bearer ${info['access_token']}`, 
  }
  })
  .then((data)=>data.json())
  .then((info)=> {
  
      // console.log(info.email)
   

      const demoname = info.name.split(" ")[0].toLowerCase();
      const firstname = demoname.charAt(0).toUpperCase() + demoname.slice(1).toLowerCase()
      const lastname = info.name.split(" ")[1]
      
      document.getElementById("profile-name").innerHTML += `${firstname} ${lastname}`;
      if(info.picture){
      document.getElementById("profile-img").setAttribute('src',info.picture != undefined ? info.picture :`https://avatar.iran.liara.run/username?username=[${firstname}+${lastname}]`);
      document.getElementById("main-profile-img").setAttribute('src',info.picture != undefined ? info.picture :`https://avatar.iran.liara.run/username?username=[${firstname}+${lastname}]`);
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
} catch (error) {
  document.getElementById("cartbtn").style.display="none";
}


function profilelogout() {
  fetch("https://oauth2.googleapis.com/revoke?token=" + info['access_token'], {
    method: 'POST',
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    }
  })
  .then((data) => {

    document.getElementById("profile-logout").style.display = "none";
    document.querySelector(".info-user").style.display = "none";
    document.getElementById("profile-editprofile").style.display = "none";
    document.getElementById("profile-login").style.display = "flex";
    document.getElementById("cartbtn").style.display="none";
    document.getElementById("note").style.display="block";
    document.getElementById("main-profile-img").setAttribute('src',"./img/default-profile.png");

  })
  .catch((error) => {
    console.error('Logout failed:', error);
  });
}
