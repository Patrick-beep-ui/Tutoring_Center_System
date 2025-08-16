// Helper to manage multiple queries independently and handle errors gracefully in a single function

async function safeQuery(promise, fallback = null) {
    try {
      return await promise;
    } catch (err) {
      console.error('Query failed:', err);
      return fallback;
    }
  }

export default safeQuery;