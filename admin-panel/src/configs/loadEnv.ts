let { VITE_SITE_NAME } = import.meta.env;


const siteName = VITE_SITE_NAME || 'My App';

export const envConfig = {
    siteName
};