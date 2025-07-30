// components/VoiceChat.jsx
import React from 'react';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { useVoiceChat } from '../hooks/useVoiceChat';

const VoiceChat = ({ sessionId, currentUserId, isHost, className = '' }) => {
  const {
    isConnected,
    isMuted,
    isConnecting,
    error,
    startVoiceChat,
    stopVoiceChat,
    toggleMute
  } = useVoiceChat(sessionId, currentUserId, isHost);

  return (
    <div className={`voice-chat-container ${className}`}>
      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {}
        <div className="flex items-center gap-2 flex-1">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 
            isConnecting ? 'bg-yellow-500 animate-pulse' : 
            'bg-gray-400'
          }`} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isConnected ? 'Voice Connected' : 
             isConnecting ? 'Connecting...' : 
             'Voice Disconnected'}
          </span>
        </div>

        {}
        <div className="flex items-center gap-1">
          {!isConnected && !isConnecting ? (
            <button
              onClick={startVoiceChat}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium transition-colors"
              title="Start voice chat"
            >
              <Phone size={16} />
              <span className="hidden sm:inline">Start Voice</span>
            </button>
          ) : (
            <>
              {}
              <button
                onClick={toggleMute}
                className={`p-1.5 rounded-md transition-colors ${
                  isMuted 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
                disabled={isConnecting}
              >
                {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              {}
              <button
                onClick={stopVoiceChat}
                className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                title="End voice chat"
                disabled={isConnecting}
              >
                <PhoneOff size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {}
      {error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {}
      {!isConnected && !isConnecting && !error && (
        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <Volume2 size={16} />
            <span className="text-sm">
              Click "Start Voice" to enable real-time voice communication with your pair programming partner.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceChat;