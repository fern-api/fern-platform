import clsx from "clsx";
import {
  Forward,
  Pause,
  Play,
  Restart,
  Rewind,
  SoundHigh,
  SoundOff,
} from "iconoir-react";
import moment from "moment";
import { ReactElement, createRef, useEffect, useState } from "react";
import { FernButton, FernButtonGroup } from "./FernButton";

export interface FernAudioPlayerProps {
  /** The URL of the audio file to play */
  src: string;
  /** The title of the audio file */
  title?: string;
  author?: string;
  /** The author of the audio file */
  autoPlay?: boolean;
  className?: string;
}

export function FernAudioPlayer(props: FernAudioPlayerProps): ReactElement {
  const ref = createRef<HTMLAudioElement>();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);

  return (
    <div className={clsx("fern-audio-player", props.className)}>
      <audio
        ref={ref}
        preload="metadata"
        autoPlay={props.autoPlay}
        className="hidden"
        onLoadedMetadata={(event: React.SyntheticEvent<HTMLAudioElement>) => {
          const audio = event.target as HTMLAudioElement;
          audio.volume = 1;
          setDuration(audio.duration);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onVolumeChange={() => setIsMuted(ref.current?.muted ?? false)}
      >
        <source src={props.src} type="audio/mpeg" />
      </audio>
      <div className="relative flex flex-1 flex-col justify-center gap-1">
        <p className="m-0 inline-flex justify-center gap-2 text-center">
          {props.title != null && (
            <span className="t-accent max-w-[40vw] truncate">
              {props.title}
            </span>
          )}
          {props.author && (
            <>
              <span>&mdash;</span>
              <span className="t-muted max-w-[20vw] truncate">
                {props.author}
              </span>
            </>
          )}
        </p>
        <FernAudioProgress duration={duration} audioRef={ref} />

        <div className="mr-1 flex h-full items-center justify-center">
          <FernButtonGroup className="items-center">
            <FernButton
              variant="minimal"
              size="normal"
              intent="none"
              icon={<Restart />}
              onClick={() => {
                if (ref.current) {
                  ref.current.currentTime = 0;
                }
              }}
            />
            <FernButton
              icon={<Rewind />}
              variant="minimal"
              size="normal"
              onClick={() => {
                if (ref.current) {
                  ref.current.currentTime -= 10;
                  if (ref.current.currentTime <= 0) {
                    ref.current.currentTime = 0;
                  }
                }
              }}
            />
            <FernButton
              icon={
                isPlaying ? (
                  <Pause />
                ) : (
                  <Play className="fill-accent-contrast -mr-0.5" />
                )
              }
              variant="filled"
              intent="primary"
              rounded
              size="large"
              onClick={() => {
                if (ref.current?.paused) {
                  void ref.current.play();
                } else {
                  ref.current?.pause();
                }
              }}
            />
            <FernButton
              icon={<Forward />}
              variant="minimal"
              size="normal"
              onClick={() => {
                if (ref.current) {
                  ref.current.currentTime += 10;
                  if (ref.current.currentTime >= ref.current.duration) {
                    ref.current.pause();
                    ref.current.currentTime = ref.current.duration;
                  }
                }
              }}
            />
            <FernButton
              variant="minimal"
              size="normal"
              intent="none"
              icon={isMuted ? <SoundOff /> : <SoundHigh />}
              onClick={() => {
                if (ref.current) {
                  ref.current.muted = !ref.current.muted;
                }
              }}
            />
          </FernButtonGroup>
        </div>
      </div>
    </div>
  );
}

function FernAudioProgress({
  duration,
  audioRef,
}: {
  duration: number;
  audioRef: React.RefObject<HTMLAudioElement>;
}) {
  const [currentTime, setCurrentTime] = useState<number>(0);

  const from = moment.utc(currentTime * 1000).format("mm:ss");
  const to = moment.utc(duration * 1000).format("mm:ss");

  const progress = duration > 0 ? currentTime / duration : 0;

  useEffect(() => {
    const { current } = audioRef;
    if (!current) {
      return;
    }
    const handleTimeUpdate = () => {
      setCurrentTime(current.currentTime);
    };
    current.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      current.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [audioRef]);

  return (
    <div className="flex items-center gap-3">
      <time
        className="select-none text-end font-mono text-xs"
        style={{
          width: `${from.length}ch`,
        }}
      >
        {from}
      </time>
      <div role="button" className="pointer relative flex h-[10px] flex-1">
        <div className="pointer-events-none absolute top-[3px] h-1 w-full overflow-hidden rounded-full">
          <div className="absolute inset-0 bg-current opacity-15"></div>
          <div
            className="pointer-events-none absolute inset-0 origin-left bg-current"
            style={{
              transform: `scaleX(${progress}) translateZ(0px)`,
            }}
          />
        </div>
        <div
          className="pointer-events-none absolute top-px h-2 w-0.5 rounded-full bg-current"
          style={{
            transform: "translateX(0px) scale(1) translateZ(0)",
            left: `${progress * 100}%`,
          }}
        ></div>
      </div>
      <time
        className="select-none text-start font-mono text-xs"
        style={{
          width: `${to.length}ch`,
        }}
      >
        {to}
      </time>
    </div>
  );
}
