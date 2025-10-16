export const HitApi = async (data, url, method = 'POST') => {
  try {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    };

    const response = await fetch(url, config);
    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};