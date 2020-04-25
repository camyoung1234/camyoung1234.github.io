/* TODO
Really should have a button to add a user.
Clicking that button should copy a link with an offer.
When a user clicks that link they should be prompted to click to copy their verification code
They should text that back to the first user, who will input the verification code into a text field and press enter
That will establish the connection, and add a video element to display the video.
*/

const config = {
  iceServers: [
    {
      urls: "stun:stun.1.google.com:19302"
    }
  ]
};
const pc = new RTCPeerConnection(config);
const dc = pc.createDataChannel("chat", {negotiated: true, id: 0});
const log = msg => div.innerHTML += `<br>${msg}`;
dc.onopen = () => chat.select();
dc.onmessage = e => log(`> ${e.data}`);
pc.oniceconnectionstatechange = e => log(pc.iceConnectionState);

const constraints = {
  video: true,
  audio: true
};
navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => { video0.srcObject = stream });

const copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

// var db;
// var request = indexedDB.open("MyTestDatabase");
// var objectStore;

// request.onerror = function(event) {
//   console.log("Why didn't you allow my web app to use IndexedDB?!");
// };

// request.onsuccess = function(event) {
//   db = event.target.result;
//   db.onerror = function(event) {
//     // Generic error handler for all errors targeted at this database's
//     // requests!
//     console.error("Database error: " + event.target.errorCode);
//   };
//   objectStore = db.createObjectStore("connections");
// };

function onHashChange() {
  if (window.location.hash === "") {
    window.localStorage.clear();
    button.value = "Copy Invite Link";
  } else {
    strObj = atob(window.location.hash.slice(1))
    hashObj = JSON.parse(strObj);
    if (hashObj.type == 'offer') {
      window.localStorage.setItem('offer', strObj);
      button.value = "Copy Invite Link";
    } else if (hashObj.type == 'answer') {
      window.localStorage.setItem('answer', strObj);
      main_app.hidden = true;
      close_message.hidden = false;
    }
  }
}

onstorage = () => {
  console.log('localStorage.onstorage');
  answer = JSON.parse(window.localStorage.getItem('answer'));
  if (pc.signalingState != "have-local-offer") return;
  pc.setRemoteDescription(answer);
};

function main() {
  chat.onkeypress = function(e) {
    if (e.keyCode != 13) return;
    dc.send(chat.value);
    log(chat.value);
    chat.value = "";
  };

  button.onclick = async function() {
    button.disabled = true;
    if (localStorage.getItem('offer') === null) {
      console.log("creating offer");
      await pc.setLocalDescription(await pc.createOffer());
      pc.onicecandidate = ({candidate}) => {
        if (candidate) return;
        value = window.location.origin + "#" + btoa(JSON.stringify(pc.localDescription));
        copyToClipboard(value);
      };
    } else {
      console.log("creating answer");
      if (pc.signalingState != "stable") return;
      await pc.setRemoteDescription(JSON.parse(localStorage.getItem('offer')));
      await pc.setLocalDescription(await pc.createAnswer());
      pc.onicecandidate = ({candidate}) => {
        if (candidate) return;
        value = window.location.origin + "#" + btoa(JSON.stringify(pc.localDescription));
        copyToClipboard(value);
      };
    }
  }

  close_message.hidden = true;

  onHashChange();
}
		
window.onload = main;
window.onhashchange = onHashChange;
