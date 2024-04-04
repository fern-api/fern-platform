import { YouTubeEmbed } from "@next/third-parties/google";
import { FC } from "react";

export const YoutubeVideo: FC<{ videoId: string }> = ({ videoId }) => {
    return (
        <div className="bg-card aspect-video overflow-hidden rounded-lg">
            <YouTubeEmbed videoid={videoId} />
        </div>
    );
};
