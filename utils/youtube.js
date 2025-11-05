export function extractYouTubeId(url) {
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.hostname === 'youtu.be') {
            return parsedUrl.pathname.slice(1);
        }
        return parsedUrl.searchParams.get('v');
    } catch (e) {
        console.error('Ongeldige URL:', url);
        return null;
    }
}