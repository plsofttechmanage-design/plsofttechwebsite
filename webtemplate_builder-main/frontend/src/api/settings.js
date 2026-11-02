import client from './client';

export const settingsAPI = {
  getSiteSettings: async () => {
    const response = await client.get('/settings/');
    return response.data;
  },
  updateSiteSettings: async (settingsData) => {
    const response = await client.put('/settings/', settingsData);
    return response.data;
  },
  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await client.post('/settings/upload-logo/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
