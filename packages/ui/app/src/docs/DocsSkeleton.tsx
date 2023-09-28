import { type PropsWithChildren } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function SkeletonWrapper({ children }: PropsWithChildren<unknown>) {
    return (
        <div
            style={{
                display: "block",
                marginBottom: 10,
            }}
        >
            {children}
        </div>
    );
}

export declare namespace DocsSkeleton {}

export const DocsSkeleton: React.FC = () => {
    return (
        <div className="max-w-8xl fixed inset-x-0 bottom-10 top-16 z-10 mx-auto flex pb-10 pt-8">
            <div className="hidden h-full w-72 pl-6 pr-4 md:block">
                <Skeleton count={1} wrapper={SkeletonWrapper} height={48} />
                <div className="h-3" />
                <Skeleton count={4} wrapper={SkeletonWrapper} height={40} />
                <div className="h-3" />
                <Skeleton count={4} wrapper={SkeletonWrapper} height={40} />
                <div className="h-3" />
                <Skeleton count={4} wrapper={SkeletonWrapper} height={40} />
                <div className="h-3" />
                <Skeleton count={4} wrapper={SkeletonWrapper} height={40} />
            </div>

            <div className="flex h-full w-full">
                <div className="flex-1 px-6">
                    <Skeleton count={1} wrapper={SkeletonWrapper} height={116} />
                    <div className="h-6" />
                    <Skeleton count={5} wrapper={SkeletonWrapper} height={54} />
                    <div className="h-4" />
                    <Skeleton count={5} wrapper={SkeletonWrapper} height={54} />
                    <div className="h-4" />
                    <Skeleton count={5} wrapper={SkeletonWrapper} height={54} />
                </div>

                <div className="hidden h-full flex-1 px-4 lg:block">
                    <Skeleton count={1} height="100%" />
                </div>
            </div>
        </div>
    );
};
