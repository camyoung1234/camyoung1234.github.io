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
dc.onopen = () => console.log("dc.onopen");
dc.onmessage = e => console.log("dc.onmessage");
pc.oniceconnectionstatechange = e => console.log(pc.iceConnectionState);

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

onstorage = () => {
  console.log('localStorage.onstorage');
  answer = JSON.parse(window.localStorage.getItem('answer'));
  if (pc.signalingState != "have-local-offer") return;
  pc.setRemoteDescription(answer);
};

async function main() {
  answer_input.onkeypress = (event) => {
    if (event.keyCode != 13) return;
    answer_input.value = "";
  }

  button.onclick = async function() {
    console.log("creating offer");
    await pc.setLocalDescription(await pc.createOffer());
    pc.onicecandidate = ({candidate}) => {
      if (candidate) return;
      value = window.location.origin + "#" + btoa(JSON.stringify(pc.localDescription));
      copyToClipboard(value);
    };
  }

  if (window.location.hash !== "") {
    console.log("creating answer");
    if (pc.signalingState != "stable") return;
    offer = JSON.parse(atob(window.location.hash.slice(1)));
    await pc.setRemoteDescription(offer);
    await pc.setLocalDescription(await pc.createAnswer());
    pc.onicecandidate = ({candidate}) => {
      if (candidate) return;
      value = window.location.origin + "#" + btoa(JSON.stringify(pc.localDescription));
      answer_input.value = value;
      answer_input.focus();
      answer_input.select();
    };
  }
}
		
window.onload = main;