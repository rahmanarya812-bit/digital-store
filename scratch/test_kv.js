try {
  const key = 'digital_store_rahman_1234';
  const url = `https://keyvalue.immanent.co/api/key/${key}`;
  
  const postRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([{ id: 1, name: 'test_product' }])
  });
  console.log('Post status:', postRes.status);
  const postData = await postRes.text();
  console.log('Post body:', postData);
  
  const getRes = await fetch(url);
  const data = await getRes.json();
  console.log('Get data:', data);
} catch (err) {
  console.error('KV error:', err);
}
