/// <reference types="vite/client" />

interface ImportMetaEnv {
    // "1" keeps the in-app testing aids in a production build, so the team can
    // walk the story without sitting through every clip. Vite inlines this at
    // build time, so changing it needs a rebuild, not a container restart.
    readonly VITE_DEV_TOOLS?: string;
}
