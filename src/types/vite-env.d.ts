/// <reference types="vite/client" />

declare const __COMMIT_HASH__: string;
declare const __BUILD_TIME__: string;

interface ImportMetaEnv {
    readonly VITE_SITE_URL?: string;
    readonly VITE_GITHUB_URL?: string;
}
