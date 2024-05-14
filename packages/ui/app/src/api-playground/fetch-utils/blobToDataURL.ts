import urljoin from "url-join";

export async function blobToDataURL(environment: string, file: File): Promise<string> {
    // vercel edge function has a maximum request size of 4.5MB, so we need to upload large files to S3
    // if blob is larger than 1MB, we will upload it to S3 and return the URL
    // TODO: we should probably measure that the _entire_ request is less than 4.5MB
    if (file.size > 1024 * 1024) {
        const response = await fetch(urljoin(environment, `?file=${encodeURIComponent(file.name)}`), {
            method: "GET",
        });

        const { put, get } = (await response.json()) as { put: string; get: string };

        await fetch(put, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
            mode: "cors",
        });

        return get;
    }

    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
