'use strict';

let peer = new Peer();
let conn

const picker = document.getElementById('picker')
picker.onchange = (event) => {
  const files = event.target.files
  const file = files[0]
  const blob = new Blob(files, { type: file.type })
  conn.send({
    file: blob,
    filename: file.name,
    filetype: file.type
  })
}

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  const clickHandler = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      this.removeEventListener('click', clickHandler);
    }, 150);
  };
  a.addEventListener('click', clickHandler, false);
  a.click();
}

const connected = () => {
  console.log('connected')
  picker.disabled = false
}

let debug_data
const conn_data = (data) => {
  debug_data = data
  const blob = new Blob([data.file])
  downloadBlob(blob, data.filename)
}

const hash = window.location.hash.substr(1)
if (hash === '') {
  peer.on('open', () => {
    navigator.clipboard.writeText(window.location.origin + '/#' + peer.id)
  })
  peer.on('connection', (_) => {
    conn = _
    conn.on('open', connected)
    conn.on('data', conn_data)
  })
} else {
  console.log(`connecting to ${hash}`)
  peer.on('open', () => {
    conn = peer.connect(hash)
    conn.on('open', connected)
    conn.on('data', conn_data)
  })
}

//console.log = (x) => {
//  let node = document.createElement('p')
//  node.innerText = x
//  document.body.appendChild(node)
//}
//
//const config = {
//  iceServers: [
//    {
//      urls: [
//        "stun:stun.l.google.com:19302",
//        "stun:stun1.l.google.com:19302",
//        "stun:stun2.l.google.com:19302",
//        "stun:stun3.l.google.com:19302",
//        "stun:stun4.l.google.com:19302",
//      ]
//    }
//  ]
//};
//const pc = new RTCPeerConnection(config);
//const dc = pc.createDataChannel("chat", {negotiated: true, id: 0});
//dc.onopen = () => {
//  console.log("dc.onopen");
//  alert("connected!")
//}
//dc.onmessage = e => console.log("dc.onmessage");
//pc.oniceconnectionstatechange = e => console.log(pc.iceConnectionState);
//pc.onicecandidate = ({candidate}) => {
//  if (candidate === null) {
//    navigator.clipboard.writeText(window.location.origin + "/#" + btoa(JSON.stringify(pc.localDescription)));
//    console.log('clipboard updated')
//  } else {
//    console.log(candidate)
//  }
//};
//
////const constraints = {
////  video: true,
////  audio: true
////};
////navigator.mediaDevices.getUserMedia(constraints)
////    .then((stream) => { video0.srcObject = stream });
//
//onstorage = async () => {
//  console.log('localStorage.onstorage');
//  if (pc.signalingState != "have-local-offer") return;
//  pc.setRemoteDescription(JSON.parse(window.localStorage.getItem('answer')));
//};
//
//onhashchange = async () => {
//  console.log('onhashchange')
//  const hash = window.location.hash.substr(1)
//  if (hash === '') {
//    console.log('clearing localStorage')
//    localStorage.clear()
//    await pc.setLocalDescription(await pc.createOffer());
//  } else {
//    console.log(`hash: ${hash}`)
//    try {
//      let obj_str = atob(hash)
//      let obj = JSON.parse(obj_str)
//      if (obj.type === 'offer') {
//        console.log(`offer: ${obj}`)
//        await pc.setRemoteDescription(obj);
//        await pc.setLocalDescription(await pc.createAnswer());
//      } else if (obj.type === 'answer') {
//        console.log(`answer: ${obj}`)
//        localStorage.setItem('answer', obj_str)
//        onstorage()
//      } else {
//        console.log('invalid hash')
//      }
//    } catch (err) {
//      console.log(err)
//    }
//  }
//}
//
//async function main() {
//  const hash = window.location.hash.substr(1)
//  if (hash === '') {
//    console.log('clearing localStorage')
//    localStorage.clear()
//    await pc.setLocalDescription(await pc.createOffer());
//  } else {
//    console.log(`hash: ${hash}`)
//    try {
//      let obj_str = atob(hash)
//      let obj = JSON.parse(obj_str)
//      if (obj.type === 'offer') {
//        console.log(`offer: ${obj}`)
//        await pc.setRemoteDescription(obj);
//        await pc.setLocalDescription(await pc.createAnswer());
//      } else if (obj.type === 'answer') {
//        console.log(`answer: ${obj}`)
//        localStorage.setItem('answer', obj_str)
//        window.close()
//      } else {
//        console.log('invalid hash')
//      }
//    } catch (err) {
//      console.log(err)
//    }
//  }
//}
//
//onload = main;
