try {
  const bucketId = 'TrGsuVsYSA5a9ND6UmtCJH';
  
  const postRes = await fetch(`https://kvdb.io/${bucketId}/products`, {
    method: 'PUT',
    body: JSON.stringify([{ id: 1, name: 'test_product' }])
  });
  console.log('Put status:', postRes.status);
  
  const getRes = await fetch(`https://kvdb.io/${bucketId}/products`);
  const data = await getRes.json();
  console.log('Get data:', data);
} catch (err) {
  console.error('KVDB error:', err);
}
