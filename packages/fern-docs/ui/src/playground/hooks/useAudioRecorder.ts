import { useCallback, useEffect, useRef, useState } from "react";
import fixWebmDuration from "webm-duration-fix";

interface AudioRecorderState {
  isRecording: boolean;
  elapsedTime: number;
  volume: number;
  audioUrl: string | null;
}

interface AudioRecorderControls {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

export function useAudioRecorder(
  onAudioData?: (audioData: { base64: string; file: File; url: string }) => void
): [Omit<AudioRecorderState, "audioUrl">, AudioRecorderControls] {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [volume, setVolume] = useState(0.2);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const chunksRef = useRef<Blob[]>([]);
  const mimeType = "audio/webm;codecs=opus";

  const startRecording = useCallback(async () => {
    try {
      setElapsedTime(0);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType,
      });

      // for animation only:
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      const updateVolume = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const average =
          dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        const normalizedVolume = Math.min(average / 20, 1);
        setVolume(normalizedVolume);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      recorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        const fixedBlob = await fixWebmDuration(
          new Blob([...chunksRef.current], {
            type: mimeType,
          })
        );
        const file = new File([fixedBlob], `recording-${Date.now()}.webm`, {
          type: mimeType,
        });

        const url = URL.createObjectURL(file);

        const toBase64 = (file: File) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
          });
        const base64 = await toBase64(file);

        onAudioData?.({ base64: base64 as string, file, url });
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  }, [onAudioData]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setMediaRecorder(null);
      setIsRecording(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      analyserRef.current = null;
      setVolume(0.2);
      chunksRef.current = [];
    }
  }, [mediaRecorder]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      clearInterval(interval);
      if (mediaRecorder) {
        stopRecording();
      }
    };
  }, [isRecording, mediaRecorder, stopRecording]);

  return [
    { isRecording, elapsedTime, volume },
    { startRecording, stopRecording },
  ];
}
