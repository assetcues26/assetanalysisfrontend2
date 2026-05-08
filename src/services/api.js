const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const submitAuditSession = async (sessionId, pairs) => {
  const formData = new FormData();
  
  const pairsMetadata = pairs.map((pair, index) => ({
    pair_index: index,
    barcode_skipped: pair.barcode_skipped
  }));

  formData.append('session_metadata', JSON.stringify({
    session_id: sessionId,
    pairs_metadata: pairsMetadata
  }));

  // Append images
  for (let i = 0; i < pairs.length; i++) {
    const assetBlob = await (await fetch(pairs[i].asset)).blob();
    formData.append('images', assetBlob, `asset_${i}.jpg`);
    
    if (!pairs[i].barcode_skipped && pairs[i].barcode) {
      const barcodeBlob = await (await fetch(pairs[i].barcode)).blob();
      formData.append('images', barcodeBlob, `barcode_${i}.jpg`);
    }
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/audit/session`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to submit audit session');
  }

  return await response.json();
};
