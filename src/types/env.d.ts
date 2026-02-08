declare namespace NodeJS {
    interface ProcessEnv {
        ICONIFY_API_IMAGE_URI?: string;
    }
}

declare const process: {
    env: NodeJS.ProcessEnv;
};