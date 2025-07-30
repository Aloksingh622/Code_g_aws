// hooks/useVoiceChat.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useVoiceChat = (sessionId, currentUserId, isHost) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  
  const localStream = useRef(null);
  const remoteStream = useRef(null);
  const peerConnection = useRef(null);
  const sessionDocRef = useRef(null);
  const iceCandidateQueue = useRef([]);
  
  // Initialize WebRTC configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Initialize peer connection
  const initializePeerConnection = useCallback(() => {
    if (peerConnection.current) return;
    
    peerConnection.current = new RTCPeerConnection(rtcConfig);
    
    // Handle incoming remote stream
    peerConnection.current.ontrack = (event) => {
      remoteStream.current = event.streams[0];
      setIsConnected(true);
      setIsConnecting(false);
    };
    
    // Handle ICE candidates
    peerConnection.current.onicecandidate = async (event) => {
      if (event.candidate && sessionDocRef.current) {
        try {
          const sessionDoc = await sessionDocRef.current.get();
          const currentCandidates = sessionDoc.data()?.webrtc_ice_candidates || [];
          
          await updateDoc(sessionDocRef.current, {
            webrtc_ice_candidates: [
              ...currentCandidates,
              {
                candidate: event.candidate,
                userId: currentUserId,
                timestamp: Date.now()
              }
            ]
          });
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      }
    };
   
    peerConnection.current.onconnectionstatechange = () => {
      const state = peerConnection.current.connectionState;

      
      if (state === 'connected') {
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
      } else if (state === 'disconnected' || state === 'failed') {
        setIsConnected(false);
        setIsConnecting(false);
        if (state === 'failed') {
          setError('Voice connection failed. Please try reconnecting.');
        }
      }
    };
  }, [currentUserId]);

 
  const getUserMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });
      
      localStream.current = stream;
      return stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Could not access microphone. Please check permissions.');
      throw error;
    }
  }, []);

  // Start voice chat
  const startVoiceChat = useCallback(async () => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      // Get user media
      const stream = await getUserMedia();
      
      // Initialize peer connection
      initializePeerConnection();
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, stream);
      });
      
      if (isHost) {
        // Host creates offer
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        
        // Save offer to Firestore
        await updateDoc(sessionDocRef.current, {
          webrtc_offer: {
            sdp: offer,
            userId: currentUserId,
            timestamp: Date.now()
          }
        });
      }
    } catch (error) {
      console.error('Error starting voice chat:', error);
      setError('Failed to start voice chat. Please try again.');
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, isHost, currentUserId, getUserMedia, initializePeerConnection]);

  // Stop voice chat
  const stopVoiceChat = useCallback(async () => {
    // Stop local stream
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    
    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    // Clear signaling data
    if (sessionDocRef.current) {
      try {
        await updateDoc(sessionDocRef.current, {
          webrtc_offer: null,
          webrtc_answer: null,
          webrtc_ice_candidates: []
        });
      } catch (error) {
        console.error('Error clearing signaling data:', error);
      }
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  // Handle signaling data from Firestore
  useEffect(() => {
    if (!sessionId) return;
    
    sessionDocRef.current = doc(db, 'pair_sessions', sessionId);
    
    const unsubscribe = onSnapshot(sessionDocRef.current, async (doc) => {
      if (!doc.exists()) return;
      
      const data = doc.data();
      
      // Handle incoming offer (for non-host)
      if (!isHost && data.webrtc_offer && data.webrtc_offer.userId !== currentUserId) {
        try {
          if (!peerConnection.current) {
            const stream = await getUserMedia();
            initializePeerConnection();
            stream.getTracks().forEach(track => {
              peerConnection.current.addTrack(track, stream);
            });
          }
          
          await peerConnection.current.setRemoteDescription(data.webrtc_offer.sdp);
          
          // Create and send answer
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          
          await updateDoc(sessionDocRef.current, {
            webrtc_answer: {
              sdp: answer,
              userId: currentUserId,
              timestamp: Date.now()
            }
          });
        } catch (error) {
          console.error('Error handling offer:', error);
          setError('Failed to establish voice connection.');
        }
      }
      
      // Handle incoming answer (for host)
      if (isHost && data.webrtc_answer && data.webrtc_answer.userId !== currentUserId) {
        try {
          if (peerConnection.current && peerConnection.current.remoteDescription === null) {
            await peerConnection.current.setRemoteDescription(data.webrtc_answer.sdp);
          }
        } catch (error) {
          console.error('Error handling answer:', error);
        }
      }
      
      // Handle ICE candidates
      if (data.webrtc_ice_candidates) {
        const newCandidates = data.webrtc_ice_candidates.filter(
          candidate => candidate.userId !== currentUserId &&
          !iceCandidateQueue.current.some(queued => 
            queued.timestamp === candidate.timestamp
          )
        );
        
        for (const candidateData of newCandidates) {
          iceCandidateQueue.current.push(candidateData);
          
          if (peerConnection.current && peerConnection.current.remoteDescription) {
            try {
              await peerConnection.current.addIceCandidate(candidateData.candidate);
            } catch (error) {
              console.error('Error adding ICE candidate:', error);
            }
          }
        }
      }
    });
    
    return () => {
      unsubscribe();
      stopVoiceChat();
    };
  }, [sessionId, currentUserId, isHost, getUserMedia, initializePeerConnection, stopVoiceChat]);

  return {
    isConnected,
    isMuted,
    isConnecting,
    error,
    startVoiceChat,
    stopVoiceChat,
    toggleMute
  };
};