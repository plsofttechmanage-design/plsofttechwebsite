import api from './client';

export const downloadsAPI = {
  getMyDownloads: async () => {
    const res = await api.get('/downloads/my-downloads/');
    return res.data;
  },

  downloadFile: async (entitlementId, templateTitle = 'template-package') => {
    // Binary file download
    const res = await api.get(`/downloads/file/${entitlementId}/`, {
      responseType: 'blob',
    });

    // Create a virtual download link in browser
    const blob = new Blob([res.data], { type: 'application/zip' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${templateTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-package.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};

