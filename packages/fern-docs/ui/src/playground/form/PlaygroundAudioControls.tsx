import { FernButton, FernButtonGroup } from "@fern-docs/components";
import { Download, Play, Pause } from "iconoir-react";
import { useEffect, useRef, useState } from "react";

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
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsLoaded(false);
  }, [audioUrl]);

  useEffect(() => {
    if (!audioUrl) return;

    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleLoadedMetadata = () => {
      const audioDuration = audio.duration;
      if (!isNaN(audioDuration) && isFinite(audioDuration)) {
        setDuration(Math.round(audioDuration));
        setIsLoaded(true);
      }
    };
    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      if (!isNaN(currentTime) && isFinite(currentTime)) {
        setCurrentTime(Math.round(currentTime));
      }
    };

    audio.load();

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [audioUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return mins === "00" ? `${secs}s` : `${mins}:${secs}`;
  };

  const handlePlayPause = async () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    }
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
          icon={isPlaying ? <Pause /> : <Play />}
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
