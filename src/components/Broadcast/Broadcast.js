import React, { useRef } from "react";
import axios from "axios";

export default function Broadcast() {
  const button = useRef();
  const video = useRef();

  async function init() {
    console.log("inits");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      video.current.srcObject = stream;
      const peer = createPeer();
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    } catch (error) {
      console.log(error);
    }
  }

  function createPeer() {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org",
        },
      ],
    });
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer;
  }

  function endStream() {
    axios.post(
      "https://stayvirtual-chat-backend.herokuapp.com/api/endbroadcast"
    );
  }

  async function handleNegotiationNeededEvent(peer) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = {
      sdp: peer.localDescription,
    };

    const { data } = await axios.post(
      "https://stayvirtual-chat-backend.herokuapp.com/api/broadcast",
      payload
    );

    const desc = new RTCSessionDescription(data.sdp);
    peer
      .setRemoteDescription(desc)
      .catch((e) => console.log("there is an error", e));
  }

  return (
    <div
      style={{
        position: "absolute",
        top: "0",
        bottom: "0",
        right: "0",
        left: "0",
        zIndex: "10",
      }}
    >
      <button ref={button} id="my-button" onClick={init}>
        Start Stream
      </button>
      <button ref={button} id="my-button" onClick={endStream}>
        End Stream
      </button>

      <video ref={video} autoPlay controls id="video"></video>
    </div>
  );
}
