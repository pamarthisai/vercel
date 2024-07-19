const socket = io();
let localStream;
let peerConnection;
const room = 'random-room'; // You can change this to a dynamic room name

document.getElementById('startButton').onclick = async () => {
    await startChat();
};

async function startChat() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById('localVideo').srcObject = localStream;

    socket.emit('join', room);

    socket.on('signal', async (data) => {
        if (!peerConnection) {
            createPeerConnection();
        }
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.signal));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('signal', { signal: answer, room });
    });
}

function createPeerConnection() {
    peerConnection = new RTCPeerConnection();
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('signal', { signal: event.candidate, room });
        }
    };

    peerConnection.ontrack = (event) => {
        document.getElementById('remoteVideo').srcObject = event.streams[0];
    };
}