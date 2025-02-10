import { useEffect, useRef, useState } from "react";

import { Download, Octagon, Play } from "lucide-react";

import { FernButton, FernButtonGroup } from "@fern-docs/components";

interface PlaygroundAudioControlsProps {
  audioUrl: string | null;
  fileName?: string;
}

export function PlaygroundAudioControls({
  audioUrl,
  fileName = "recording.webm",
}: PlaygroundAudioControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onloadedmetadata = () => {
        const audioDuration = audioRef.current?.duration;
        if (audioDuration && !isNaN(audioDuration) && isFinite(audioDuration)) {
          setDuration(Math.round(audioDuration));
          setIsLoaded(true);
        }
      };
      audioRef.current.ontimeupdate = () => {
        const currentTime = audioRef.current?.currentTime;
        if (currentTime && !isNaN(currentTime) && isFinite(currentTime)) {
          setCurrentTime(Math.round(currentTime));
        }
      };
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handlePlayPause = async () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    } else {
      await audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!audioUrl) return null;

  return (
    <div className="flex items-center gap-2">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      {isLoaded && (
        <span className="font-mono text-xs">
          {`${formatTime(currentTime)}/${formatTime(duration)}`}
        </span>
      )}
      <FernButtonGroup>
        <FernButton
          icon={isPlaying ? <Octagon /> : <Play />}
          onClick={handlePlayPause}
          size="small"
          variant="minimal"
          disabled={!audioUrl}
        />
        <FernButton
          icon={<Download />}
          onClick={handleDownload}
          size="small"
          variant="minimal"
          disabled={!audioUrl}
        />
      </FernButtonGroup>
    </div>
  );
}
