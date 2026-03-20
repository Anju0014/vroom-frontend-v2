
"use client";

import { useEffect, useRef, useState } from "react";
import socket from "@/services/common/socketService";

interface Props {
  roomId: string;
  role: "admin" | "owner";
}

export default function VideoCallVerification({ roomId, role }: Props) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const endingRef = useRef(false); 

  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    socket.emit("join-room", roomId);

    // socket.on("offer", handleOffer);
    // socket.on("answer", handleAnswer);
    // socket.on("ice-candidate", handleIceCandidate);
    socket.on("offer", ({ offer }) => handleOffer(offer));
socket.on("answer", ({ answer }) => handleAnswer(answer));
socket.on("ice-candidate", ({ candidate }) => handleIceCandidate(candidate));

    socket.on("end-call", handleRemoteEndCall);

    return () => {
      endCall(false);
      socket.emit("leave-room", roomId);
      socket.off();
    };
  }, []);

  
  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    const peer = createPeer();
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
    peerRef.current = peer;

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit("offer", { roomId, offer });

    setInCall(true);
  };

  
  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (role !== "owner") return;

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    const peer = createPeer();
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
    peerRef.current = peer;

    await peer.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit("answer", { roomId, answer });

    setInCall(true);
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    await peerRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    await peerRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
  };


  const createPeer = () => {
    const peer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: event.candidate });
      }
    };

    return peer;
  };

  
  const endCall = (emit: boolean = true) => {
    if (endingRef.current) return;
    endingRef.current = true;

   
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;

 
    peerRef.current?.close();
    peerRef.current = null;


    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    if (emit) socket.emit("end-call", roomId);

    setInCall(false);
    endingRef.current = false;
  };

  const handleRemoteEndCall = () => {
    console.log("Remote ended the call");
    endCall(false); // Don't emit again
  };

  
  return (
    <div className="space-y-3">
   
      {role === "admin" && !inCall && (
        <button
          onClick={startCall}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Start Verification Call
        </button>
      )}

  
      {inCall && (
        <button
          onClick={() => endCall()}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          End Call
        </button>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Local Video */}
        <div className="relative">
          <span className="absolute top-1 left-1 text-xs bg-black/70 text-white px-2 rounded">
            {role === "admin" ? "Admin (You)" : "Owner (You)"}
          </span>
          <video ref={localVideoRef} autoPlay muted className="rounded bg-black w-full h-60" />
        </div>

        {/* Remote Video */}
        <div className="relative">
          <span className="absolute top-1 left-1 text-xs bg-black/70 text-white px-2 rounded">
            {role === "admin" ? "Owner" : "Admin"}
          </span>
          <video ref={remoteVideoRef} autoPlay className="rounded bg-black w-full h-60" />
        </div>
      </div>
    </div>
  );
}


