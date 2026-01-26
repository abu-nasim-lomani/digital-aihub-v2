
try {
    await import('./src/server.js');
    console.log("Server module imported successfully");
} catch (err) {
    console.error("CRITICAL ERROR IMPORTING SERVER:");
    console.error(err);
}
