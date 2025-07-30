// src/component/VoiceChatUI.jsx

import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VoiceChatUI = ({
    remoteStream,
    isMicMuted,
    onToggleMic,
    isSpeakerMuted,
    onToggleSpeaker
}) => {
    const remoteAudioRef = useRef(null);

    // This effect attaches the partner's audio stream to a hidden audio player
    useEffect(() => {
        const audioEl = remoteAudioRef.current;
        if (audioEl && remoteStream) {
            audioEl.srcObject = remoteStream;
            audioEl.play().catch(error => console.error("Audio play failed:", error));
        }
    }, [remoteStream]);

    return (
        <div className="flex items-center gap-2">
            {}
            <audio ref={remoteAudioRef} autoPlay playsInline muted={isSpeakerMuted} />
            
            {}
            <Button
                variant="ghost"
                size="icon"
                onClick={onToggleMic}
                className="text-white hover:bg-neutral-600/70"
            >
                {isMicMuted ? <MicOff className="h-5 w-5 text-red-400" /> : <Mic className="h-5 w-5" />}
            </Button>
            
            {}
             <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSpeaker}
                className="text-white hover:bg-neutral-600/70"
                disabled={!remoteStream}
            >
                {isSpeakerMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
        </div>
    );
};

export default VoiceChatUI;