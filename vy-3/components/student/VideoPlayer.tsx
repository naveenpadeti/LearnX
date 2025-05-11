"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, MessageSquare, Maximize, Minimize, X, Volume2, VolumeX } from "lucide-react";

interface VideoPlayerProps {
    videoUrl: string;
    isOpen: boolean;
    onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, isOpen, onClose }) => {
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const videoContainerRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const progressRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const checkFullscreen = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", checkFullscreen);

        // Auto-play when component mounts
        if (videoRef.current) {
            videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => console.error("Failed to autoplay:", err));
        }

        return () => document.removeEventListener("fullscreenchange", checkFullscreen);
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play().catch(err => console.error("Failed to play:", err));
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        if (videoContainerRef.current) {
            try {
                if (!document.fullscreenElement) {
                    videoContainerRef.current.requestFullscreen().catch(err => {
                        console.error(`Error attempting to enable fullscreen: ${err.message}`);
                    });
                } else {
                    document.exitFullscreen();
                }
            } catch (err) {
                console.error("Fullscreen API error:", err);
            }
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const dur = videoRef.current.duration;
            if (!isNaN(current) && !isNaN(dur)) {
                setCurrentTime(current);
                setDuration(dur);
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const dur = videoRef.current.duration;
            if (!isNaN(dur)) {
                setDuration(dur);
            }
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (progressRef.current && videoRef.current) {
            const rect = progressRef.current.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            videoRef.current.currentTime = pos * videoRef.current.duration;
        }
    };

    const handleSpeedChange = (speed: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
            setPlaybackSpeed(speed);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div
            ref={videoContainerRef}
            className="relative w-full aspect-video bg-black rounded-lg overflow-hidden"
            style={{ maxHeight: isFullscreen ? "100vh" : "none" }}
        >
            {videoUrl ? (
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onClick={togglePlay}
                    playsInline
                />
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-white">No video URL provided</p>
                </div>
            )}

            <div className="absolute inset-0 flex flex-col justify-end pointer-events-none">
                {/* Video controls */}
                <div className="bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-auto">
                    {/* Progress bar */}
                    <div
                        ref={progressRef}
                        className="w-full bg-gray-500/50 h-1.5 rounded-full cursor-pointer mb-2"
                        onClick={handleProgressClick}
                    >
                        <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                        ></div>
                    </div>

                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-4">
                            <button
                                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                                onClick={togglePlay}
                            >
                                {isPlaying ?
                                    <Pause className="h-5 w-5" /> :
                                    <Play className="h-5 w-5" />
                                }
                            </button>
                            <button
                                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                                onClick={toggleMute}
                            >
                                {isMuted ?
                                    <VolumeX className="h-5 w-5" /> :
                                    <Volume2 className="h-5 w-5" />
                                }
                            </button>
                            <span className="text-sm font-medium">
                                {formatTime(currentTime)} / {formatTime(duration || 0)}
                            </span>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="relative group">
                                <button className="p-1 hover:bg-white/10 rounded text-sm font-medium">
                                    {playbackSpeed}x
                                </button>
                                <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-black/90 rounded p-1 flex flex-col">
                                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                                            <button
                                                key={speed}
                                                onClick={() => handleSpeedChange(speed)}
                                                className={`px-3 py-1 hover:bg-white/10 rounded text-sm whitespace-nowrap ${playbackSpeed === speed ? 'text-blue-400' : ''}`}
                                            >
                                                {speed}x
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={toggleFullscreen}
                                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                            >
                                {isFullscreen ?
                                    <Minimize className="h-5 w-5" /> :
                                    <Maximize className="h-5 w-5" />
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;