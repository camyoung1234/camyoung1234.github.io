const config = {iceServers: [{urls: "stun:stun.1.google.com:19302"}]};
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
		
async function createOffer() {
  button.disabled = true;
  await pc.setLocalDescription(await pc.createOffer());
  pc.onicecandidate = ({candidate}) => {
    if (candidate) return;
    offer.value = btoa(JSON.stringify(pc.localDescription));
    copyToClipboard(offer.value);
    offer.select();
    answer.placeholder = "Paste answer here";
  };
}

function main() {
chat.onkeypress = function(e) {
  if (e.keyCode != 13) return;
  dc.send(chat.value);
  log(chat.value);
  chat.value = "";
};
		
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
	//if (window.location.hash == "") {
	//	createOffer();
	//} else {
	//	offer.value = atob(window.location.hash.slice(1))
	//}
}
		
window.onload = main;
