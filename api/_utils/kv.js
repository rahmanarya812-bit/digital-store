// Force redeploy to apply Vercel KV environment variables
export async function kvCall(command, args = []) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([command, ...args])
    });
    const data = await res.json();
    return data ? data.result : null;
  } catch (err) {
    console.error(`KV Error executing ${command}:`, err);
    return null;
  }
}
