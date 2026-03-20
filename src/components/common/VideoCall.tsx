

"use client";
import { useEffect, useRef, useState } from "react";
import socket from "@/services/common/socketService";

interface VideoCallProps {
  roomId: string;
  role?: "admin" | "owner";
  myName?: string;
  otherName?: string;
  onClose?: () => void;
  isAdminOwner?: boolean;
}

export default function VideoCall({
  roomId,
  role,
  myName,
  otherName,
  onClose,
  isAdminOwner = false,
}: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const endingRef = useRef(false);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const [inCall, setInCall] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState<RTCSessionDescriptionInit | null>(null);
  const [calling, setCalling] = useState(false);
  const [localStreamReady, setLocalStreamReady] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const initializeLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setLocalStreamReady(true);
      } catch (err) {
        console.error("Media error:", err);
        alert("Cannot access camera/microphone. Please grant permissions.");
      }
    };

    initializeLocalStream();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    socket.emit("join-room", roomId);

    const handleOffer = async (data: { offer: RTCSessionDescriptionInit }) => {
      if (isAdminOwner && role !== "owner") {
        return;
      }
      
      setCalling(false);
      setIncomingOffer(data.offer);
      
      if (isAdminOwner && role === "owner") {
        await acceptCall(data.offer);
      }
    };

    const handleAnswer = async (data: { answer: RTCSessionDescriptionInit }) => {
      if (!peerRef.current) return;

      try {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );

        setCalling(false);
        setConnecting(false);
        setInCall(true);

        for (const candidate of pendingCandidatesRef.current) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidatesRef.current = [];
      } catch (err) {
        console.error("Error setting remote description:", err);
      }
    };

    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit }) => {
      if (peerRef.current && peerRef.current.remoteDescription) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      } else {
        pendingCandidatesRef.current.push(data.candidate);
      }
    };

    const handleRemoteEndCall = () => {
      endCall(false);
    };

    const handleCallDeclined = () => {
      setCalling(false);
      setIncomingOffer(null);
      alert("Call was declined");
    };

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("end-call", handleRemoteEndCall);
    socket.on("call-declined", handleCallDeclined);

    return () => {
      if (peerRef.current) {
        endCall(false);
      }
      socket.emit("leave-room", roomId);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("end-call", handleRemoteEndCall);
      socket.off("call-declined", handleCallDeclined);
    };
  }, [roomId, role, isAdminOwner]);

  const createPeer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    peer.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setCalling(false);
        setConnecting(false);
        setInCall(true);
      }
    };

    peer.onicecandidate = (event) => {
      if (!peer.localDescription) return;
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "failed" || peer.connectionState === "disconnected") {
        endCall();
      }
    };

    peer.oniceconnectionstatechange = () => {};

    return peer;
  };

  const startCall = async () => {
    const stream = localStreamRef.current;
    if (!stream) {
      alert("Please allow camera/microphone access first");
      return;
    }

    const peer = createPeer();
    peerRef.current = peer;

    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("offer", { roomId, offer });

    setCalling(true);
  };

  const acceptCall = async (offer?: RTCSessionDescriptionInit) => {
    const offerToUse = offer || incomingOffer;
    if (!offerToUse) return;

    const stream = localStreamRef.current;
    if (!stream) {
      alert("Please allow camera/microphone access first");
      return;
    }

    const peer = createPeer();
    peerRef.current = peer;

    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });

    await peer.setRemoteDescription(new RTCSessionDescription(offerToUse));

    for (const candidate of pendingCandidatesRef.current) {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
    pendingCandidatesRef.current = [];

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit("answer", { roomId, answer });

    setIncomingOffer(null);
    setConnecting(true);
  };

  const endCall = (emit = true) => {
    if (endingRef.current) return;
    endingRef.current = true;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    peerRef.current?.close();
    peerRef.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    pendingCandidatesRef.current = [];

    if (emit) {
      socket.emit("end-call", roomId);
    }

    setInCall(false);
    setCalling(false);
    setConnecting(false);
    setIncomingOffer(null);
    setLocalStreamReady(false);

    setTimeout(() => {
      endingRef.current = false;
    }, 1000);

    if (onClose) {
      onClose();
    }
  };

  if (isAdminOwner) {
    return (
      <div className="space-y-3">
        {role === "admin" && !inCall && !calling && (
          <button
            onClick={startCall}
            disabled={!localStreamReady}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
          >
            {localStreamReady ? "Start Verification Call" : "Loading camera..."}
          </button>
        )}

        {calling && (
          <div className="text-center text-sm text-gray-600">
            Connecting...
          </div>
        )}

        {inCall && (
          <button
            onClick={() => endCall()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            End Call
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <span className="absolute top-1 left-1 text-xs bg-black/70 text-white px-2 rounded z-10">
              {role === "admin" ? "Admin (You)" : "Owner (You)"}
            </span>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="rounded bg-black w-full h-60 object-cover"
            />
          </div>

          <div className="relative">
            <span className="absolute top-1 left-1 text-xs bg-black/70 text-white px-2 rounded z-10">
              {role === "admin" ? "Owner" : "Admin"}
            </span>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="rounded bg-black w-full h-60 object-cover"
            />
            {!inCall && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                Waiting for connection...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-5xl relative">
      <button
        onClick={() => endCall()}
        className="absolute top-4 right-4 text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded z-10"
      >
        Close
      </button>

      <h2 className="text-white text-2xl mb-6 text-center">
        Video Call with {otherName}
      </h2>

      {!inCall && !incomingOffer && !calling && (
        <div className="flex justify-center gap-6 mb-6">
          <button
            onClick={startCall}
            disabled={!localStreamReady}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg disabled:opacity-50"
          >
            {localStreamReady ? "Start Call" : "Loading camera..."}
          </button>
        </div>
      )}

      {calling && !inCall && !incomingOffer && (
        <div className="text-center mb-6">
          <p className="text-white text-xl mb-4">
            Calling {otherName}...
          </p>
          <div className="text-gray-400">Waiting for response...</div>
          <button
            onClick={() => endCall()}
            className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Cancel Call
          </button>
        </div>
      )}

      {incomingOffer && !inCall && (
        <div className="text-center mb-6">
          <p className="text-white text-xl mb-4">
             Incoming call from {otherName}...
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => acceptCall()}
              disabled={!localStreamReady}
              className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg disabled:opacity-50"
            >
              {localStreamReady ? "✓ Accept" : "Loading camera..."}
            </button>
            <button
              onClick={() => {
                setIncomingOffer(null);
                socket.emit("call-declined", roomId);
              }}
              className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-lg"
            >
              ✗ Decline
            </button>
          </div>
        </div>
      )}

      {connecting && !inCall && (
        <div className="text-center mb-6">
          <p className="text-white text-xl mb-4">
            Connecting to {otherName}...
          </p>
          <div className="text-gray-400">Establishing connection...</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <span className="absolute top-2 left-2 bg-black/60 text-white px-3 py-1 rounded text-sm z-10">
            You ({myName})
          </span>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-64 md:h-96 bg-black rounded-xl object-cover"
          />
        </div>

        <div className="relative">
          <span className="absolute top-2 left-2 bg-black/60 text-white px-3 py-1 rounded text-sm z-10">
            {otherName}
          </span>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-64 md:h-96 bg-black rounded-xl object-cover"
          />
          {!inCall && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-lg">
              {calling ? "Connecting..." : "Not connected"}
            </div>
          )}
        </div>
      </div>

      {inCall && (
        <div className="mt-6 text-center">
          <button
            onClick={() => endCall()}
            className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-lg"
          >
            End Call
          </button>
        </div>
      )}
    </div>
  );
}