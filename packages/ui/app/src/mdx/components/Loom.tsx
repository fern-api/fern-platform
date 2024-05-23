import { FC } from "react";

export interface LoomProps {
    videoId: string;
    sid?: string;
}

export const Loom: FC<LoomProps> = ({ videoId, sid }) => {
    const url = new URL(`https://www.loom.com/embed/${videoId}`);
    if (sid) {
        url.searchParams.set("sid", sid);
    }
    return (
        <div className="w-full aspect-video">
            <iframe src={url.toString()} width="100%" height="100%" allowFullScreen />
        </div>
    );
};
