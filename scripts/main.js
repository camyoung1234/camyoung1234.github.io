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
  } else {
    strObj = atob(window.location.hash.slice(1))
    hashObj = JSON.parse(strObj);
    if (hashObj.type == 'offer') {
      window.localStorage.setItem('offer', strObj);
    } else if (hashObj.type == 'answer') {
      window.localStorage.setItem('answer', strObj);
    }
    offer.value = window.location.hash.slice(1);
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
      await pc.setLocalDescription(await pc.createOffer());
      pc.onicecandidate = ({candidate}) => {
        if (candidate) return;
        value = window.location.origin + "#" + btoa(JSON.stringify(pc.localDescription));
        copyToClipboard(value);
        offer.value = value;
        answer.placeholder = "Paste answer here";
      };
    } else {
      if (pc.signalingState != "stable") return;
      button.disabled = offer.disabled = true;
      await pc.setRemoteDescription(JSON.parse(atob(offer.value)));
      await pc.setLocalDescription(await pc.createAnswer());
      pc.onicecandidate = ({candidate}) => {
        if (candidate) return;
        answer.focus();
        answer.value = window.location.origin + "#" + btoa(JSON.stringify(pc.localDescription));
        answer.select();
        copyToClipboard(answer.value);
      };
    }
  }
		
  offer.onkeypress = async function(e) {
    if (e.keyCode != 13 || pc.signalingState != "stable") return;
    button.disabled = offer.disabled = true;
    await pc.setRemoteDescription(JSON.parse(atob(offer.value)));
    await pc.setLocalDescription(await pc.createAnswer());
    pc.onicecandidate = ({candidate}) => {
      if (candidate) return;
      answer.focus();
      answer.value = btoa(JSON.stringify(pc.localDescription));
      answer.select();
    };
  };

  answer.onkeypress = function(e) {
    if (e.keyCode != 13 || pc.signalingState != "have-local-offer") return;
    answer.disabled = true;
    pc.setRemoteDescription(JSON.parse(atob(answer.value)));
  };

  onHashChange();
}
		
window.onload = main;
window.onhashchange = onHashChange;
