import { useEffect, useRef, useState } from 'react';

const CustomVideoPlayer = ({ videoUrl, title, onVideoReady, courseId, lessonId }) => {
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef(null);

  // Extract YouTube video ID
  const extractVideoId = (url) => {
    if (!url) return null;
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([^&?#]+)/);
    if (watchMatch) return watchMatch[1];
    const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
    if (shortMatch) return shortMatch[1];
    const embedMatch = url.match(/youtube\.com\/embed\/([^?&#]+)/);
    if (embedMatch) return embedMatch[1];
    return null;
  };

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) return;

    const initializePlayer = () => {
      if (window.YT && window.YT.Player && iframeRef.current) {
        // Destroy existing player if any
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch (e) {
            // Player already destroyed
          }
        }

        playerRef.current = new window.YT.Player(iframeRef.current, {
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 0, // Hide all YouTube controls completely
            modestbranding: 1, // Minimize YouTube logo
            rel: 0, // No related videos
            showinfo: 0, // Hide video info
            iv_load_policy: 3, // Hide annotations
            fs: 1, // Allow fullscreen (we'll handle it custom)
            disablekb: 1, // Disable keyboard controls
            playsinline: 1, // Play inline on mobile
            cc_load_policy: 0, // Hide captions by default
            enablejsapi: 1, // Enable API
            origin: window.location.origin,
            // Additional parameters to minimize branding
            widget_referrer: window.location.origin,
            hl: 'en' // Set language
          },
          events: {
            onReady: (event) => {
              try {
                setDuration(event.target.getDuration());
                if (onVideoReady) onVideoReady(event.target);
              } catch (e) {
                console.error('Error getting video duration:', e);
              }
            },
            onStateChange: (event) => {
              // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
              setIsPlaying(event.data === 1);
              
              if (event.data === 0) {
                // Video ended
                setIsPlaying(false);
                setCurrentTime(event.target.getDuration());
              }
            }
          }
        });
      } else {
        window.onYouTubeIframeAPIReady = initializePlayer;
      }
    };

    if (window.YT && window.YT.Player) {
      initializePlayer();
    } else {
      window.onYouTubeIframeAPIReady = initializePlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [videoUrl, onVideoReady]);

  // Update current time
  useEffect(() => {
    if (!playerRef.current || !duration || duration === 0) return;

    const interval = setInterval(() => {
      if (playerRef.current) {
        try {
          const time = playerRef.current.getCurrentTime();
          if (time !== currentTime) {
            setCurrentTime(time);
          }
        } catch (e) {
          // Player not ready
        }
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [duration, currentTime]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying, currentTime]);

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const handleSeek = (e) => {
    if (playerRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else {
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch((err) => {
          console.error('Error entering fullscreen:', err);
        });
      } else if (containerRef.current.webkitRequestFullscreen) {
        // Safari
        containerRef.current.webkitRequestFullscreen();
        setIsFullscreen(true);
      } else if (containerRef.current.msRequestFullscreen) {
        // IE/Edge
        containerRef.current.msRequestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch((err) => {
          console.error('Error exiting fullscreen:', err);
        });
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
        setIsFullscreen(false);
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-lg shadow-xl overflow-hidden group"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => {
        if (!isPlaying) setShowControls(true);
        else setShowControls(false);
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* YouTube iframe - completely hidden controls */}
      <div className="aspect-video relative">
        <div
          ref={iframeRef}
          className="absolute inset-0 w-full h-full"
          style={{
            // Hide YouTube branding via CSS
            filter: 'brightness(1)',
          }}
        ></div>

        {/* Overlays to block and hide YouTube UI elements */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Block top-right share button area */}
          <div 
            className="absolute top-0 right-0 w-40 h-24 pointer-events-auto"
            style={{
              background: 'transparent',
            }}
          ></div>
          
          {/* Brand logo overlay - Replaces YouTube logo */}
          <div 
            className="absolute bottom-0 right-0 pointer-events-auto flex items-center justify-end pr-4 pb-3"
            style={{
              zIndex: 15,
            }}
          >
            {/* Brand Logo - Replace with image if available */}
            <div 
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md shadow-lg"
              style={{
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Option 1: Use logo image if available (uncomment and add path) */}
              {/* <img 
                src="/logo.png" 
                alt="GuruJI Classes" 
                className="h-8 w-auto"
              /> */}
              
              {/* Option 2: Text-based logo */}
              <span className="text-white font-bold text-sm">GURU</span>
              <span className="text-orange-500 font-bold text-sm">JI</span>
              <span className="text-white font-bold text-xs ml-0.5">CLASSES</span>
            </div>
          </div>
        </div>

        {/* Custom Controls Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Center Play/Pause Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-20 h-20 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all duration-200 flex items-center justify-center group/btn"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Bottom Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
            {/* Progress Bar */}
            <div
              className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer group/progress"
              onClick={handleSeek}
              onMouseMove={(e) => {
                if (e.buttons === 1) handleSeek(e);
              }}
            >
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-100 relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-indigo-400 transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-indigo-400 transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                      </svg>
                    ) : volume < 50 ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                      </svg>
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* Time Display */}
                <div className="text-white text-sm font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-indigo-400 transition-colors"
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;

