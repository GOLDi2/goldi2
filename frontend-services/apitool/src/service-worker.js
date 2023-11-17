async function request(event) {
    try {
        console.log(event);
        const response = await fetch(event.request.clone());
        return response;
    } catch (error) {
        return new Response('Network error happened', {
            status: 400,
            headers: { 'Content-Type': 'text/plain' },
        });
    }
}

self.addEventListener('fetch', (event) => {
    const response = request(event);
    console.log(response);
    event.respondWith(response);
});
