import { BreadcrumbHeader } from "@/components/sdks/BreadcrumbHeader";
import { getIconForSdk } from "@/components/sdks/SdkContextCard";
import { DummyApis } from "@/components/sdks/mock-data/Api";
import { DummyGroups } from "@/components/sdks/mock-data/Sdk";
import { FernButton, RemoteFontAwesomeIcon } from "@fern-ui/components";
import { Navigate, createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/sdk/$sdkId/job/$jobId")({
    component: () => <JobTracker />,
});

enum JobStatus {
    SUCCESS,
    FAILURE,
    WARNING,
    IN_PROGRESS,
    PENDING,
}

interface JobStep {
    id: string;
    name: string;
    status: JobStatus;
    startTime?: number;
    endTime?: number;
}

interface Job {
    id: string;
    status: JobStatus;
    fromVersion: string;
    toVersion: string;
    steps: JobStep[];
    startTime?: number;
    endTime?: number;
}

function getIconForJobStatus(status: JobStatus): JSX.Element {
    switch (status) {
        case JobStatus.SUCCESS:
            return <RemoteFontAwesomeIcon size={4} icon="circle-check" />;
        case JobStatus.FAILURE:
            return <RemoteFontAwesomeIcon size={4} icon="circle-exclamation" />;
        case JobStatus.WARNING:
            return <RemoteFontAwesomeIcon size={4} icon="triangle-exclamation" />;
        case JobStatus.IN_PROGRESS:
            return <RemoteFontAwesomeIcon size={4} icon="arrows-rotate" className="motion-safe:animate-spin-slow" />;
        case JobStatus.PENDING:
            return <RemoteFontAwesomeIcon size={4} icon="spinner" className="motion-safe:animate-spin-slow" />;
    }
}

const DummyJob: Job = {
    id: "job-1",
    fromVersion: "1.0.0",
    toVersion: "1.0.1",
    status: JobStatus.IN_PROGRESS,
    startTime: new Date().getTime() - 60000,
    steps: [
        {
            id: "step-1",
            name: "Validate OpenAPI Spec",
            status: JobStatus.SUCCESS,
            startTime: new Date().getTime() - 60000,
            endTime: new Date().getTime(),
        },
        {
            id: "step-2",
            name: "Building SDK",
            status: JobStatus.IN_PROGRESS,
        },
        {
            id: "step-3",
            name: "Publishing to NPM",
            status: JobStatus.PENDING,
        },
    ],
};

const getTimeDiff = (start: number, end: number = new Date().getTime()): string => {
    const diffMs = end - start;
    const diffDays = Math.floor(diffMs / 86400000);
    const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
    const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
    const diffSec = Math.round((((diffMs % 86400000) % 3600000) % 60000) / 60000);

    let diffStr = `${diffSec}s`;
    if (diffMins > 0) {
        diffStr = `${diffMins}m ${diffStr}`;
    }
    if (diffHrs > 0) {
        diffStr = `${diffHrs}h ${diffStr}`;
    }
    if (diffDays > 0) {
        diffStr = `${diffDays}d ${diffStr}`;
    }

    return diffStr;
};

const getTimePercentage = (
    job: Job,
    end: number = new Date().getTime(),
    start?: number,
): { percentStepStart?: number; percentStepTotal?: number; percentPostStep?: number } => {
    if (start == null || job.startTime == null) {
        return {};
    }
    const jobEnd = job.endTime ?? new Date().getTime();
    const totalJobTime = jobEnd - job.startTime;
    const startStepDiff = start - job.startTime;
    const stepTime = end - start;

    // Idle time before the job started
    const percentStartTime = startStepDiff / totalJobTime;
    const percentStepTime = stepTime / totalJobTime;

    return {
        percentStepStart: percentStartTime * 100,
        percentStepTotal: percentStepTime * 100,
        percentPostStep: (1 - (percentStartTime + percentStepTime)) * 100,
    };
};

const JobTracker = () => {
    const { sdkId, jobId } = Route.useParams();
    // [Data] TODO: get the SDK and job data
    const api = DummyApis[0];
    const sdk = DummyGroups[0].sdks.find((sdk) => sdk.id === sdkId);

    return api != null && sdk != null ? (
        <>
            <BreadcrumbHeader
                entries={[
                    { name: api.name, path: `/api/${api.id}` },
                    { name: sdk.name, path: `/sdk/${sdk.id}` },
                ]}
            />
            <div className="h-[calc(100vh-4rem)] relative top-16">
                <div className="flex flex-col gap-y-6 overflow-hidden shadow-sm p-6">
                    <div className="flex flex-row justify-between items-center px-8">
                        <div className="flex flex-row gap-x-4 items-center">
                            <RemoteFontAwesomeIcon size={10} icon={getIconForSdk(sdk.language)} />
                            <h2>Publish {sdk.name}</h2>
                        </div>
                        <FernButton icon="minimize" disabled>
                            Return to API Overview
                        </FernButton>
                    </div>
                </div>
                <div className="flex flex-col p-12 gap-y-6">
                    <div className="flex flex-row p-4 border rounded-sm justify-between">
                        <div className="flex flex-row gap-x-4 items-center">
                            {getIconForJobStatus(DummyJob.status)}
                            <h3>
                                Publishing {sdk.name} @ {DummyJob.toVersion}
                            </h3>
                        </div>
                        <FernButton
                            variant="outlined"
                            icon={<RemoteFontAwesomeIcon size={5} icon="fa-brands fa-github" />}
                            onClick={() => {
                                return () => {
                                    window.open("#TODO: Link Fern config repo", "_blank", "noopener");
                                };
                            }}
                            disabled
                        />
                    </div>
                    <div className="p-4 border rounded-sm">
                        <table className="table-fixed gap-y-3">
                            <tbody>
                                {DummyJob.steps.map((step) => (
                                    <tr key={step.id}>
                                        <td className="p-2 max-w-44 w-fit truncate text-right">{step.name}</td>
                                        <td className="p-2 w-full">
                                            <div className="h-2 w-full rounded-full">
                                                <div
                                                    className="bg-black"
                                                    style={{
                                                        width: getTimePercentage(DummyJob, step.startTime, step.endTime)
                                                            .percentStepStart,
                                                    }}
                                                />
                                                <div
                                                    className="bg-green"
                                                    style={{
                                                        width: getTimePercentage(DummyJob, step.startTime, step.endTime)
                                                            .percentStepTotal,
                                                    }}
                                                />
                                                <div
                                                    className="bg-black"
                                                    style={{
                                                        width: getTimePercentage(DummyJob, step.startTime, step.endTime)
                                                            .percentPostStep,
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td className="p-2 w-fit truncate text-left">
                                            {step.startTime == null ? "--" : getTimeDiff(step.startTime, step.endTime)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    ) : (
        <Navigate to="/" />
    );
};
