import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  CheckCircle2,
  XCircle,
  Sparkles,
  Upload,
  X,
  FileCode,
  DollarSign,
  Edit3,
  Trash2,
  ExternalLink,
  Eye,
  AlertTriangle,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { catalogAPI } from '../../api/catalog';
import { useToast } from '../../components/Toast';

export const AdminTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // Create Modal & State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('49.00');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [compatibility, setCompatibility] = useState('React 18+, TailwindCSS');
  const [currentVersion, setCurrentVersion] = useState('1.0.0');
  const [previewUrl, setPreviewUrl] = useState('');
  const [status, setStatus] = useState('PUBLISHED');
  const [isFeatured, setIsFeatured] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [packageFile, setPackageFile] = useState(null);
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Edit Modal & State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPrice, setEditPrice] = useState('49.00');
  const [editShortDesc, setEditShortDesc] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCompatibility, setEditCompatibility] = useState('React 18+, TailwindCSS');
  const [editCurrentVersion, setEditCurrentVersion] = useState('1.0.0');
  const [editPreviewUrl, setEditPreviewUrl] = useState('');
  const [editStatus, setEditStatus] = useState('PUBLISHED');
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editThumbnailFile, setEditThumbnailFile] = useState(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState('');
  const [editPackageFile, setEditPackageFile] = useState(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Delete Modal & State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const fetchTemplates = () => {
    setLoading(true);
    catalogAPI
      .getAdminTemplates()
      .then((data) => setTemplates(data.results || data || []))
      .catch((err) => {
        console.error('Failed to load admin templates', err);
        addToast('Failed to load templates from server.', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTemplates();
    catalogAPI
      .getCategories()
      .then((data) => setCategories(data.results || data || []))
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  // Open Edit Modal
  const handleOpenEdit = (tpl) => {
    setEditingTemplate(tpl);
    setEditTitle(tpl.title || '');
    setEditCategory(tpl.category?.id || tpl.category || '');
    setEditPrice(tpl.price || '49.00');
    setEditShortDesc(tpl.short_description || '');
    setEditDescription(tpl.description || '');
    setEditCompatibility(tpl.compatibility || 'React 18+, TailwindCSS');
    setEditCurrentVersion(tpl.current_version || '1.0.0');
    setEditPreviewUrl(tpl.preview_url || '');
    setEditStatus(tpl.status || 'PUBLISHED');
    setEditIsFeatured(Boolean(tpl.is_featured));
    setEditThumbnailPreview(tpl.thumbnail || '');
    setEditThumbnailFile(null);
    setEditPackageFile(null);
    setEditModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (tpl) => {
    setDeletingTemplate(tpl);
    setDeleteModalOpen(true);
  };

  const handleTogglePublish = async (tpl) => {
    try {
      if (tpl.status === 'PUBLISHED') {
        await catalogAPI.unpublishTemplate(tpl.id);
        addToast(`"${tpl.title}" unpublished.`, 'info');
      } else {
        await catalogAPI.publishTemplate(tpl.id);
        addToast(`"${tpl.title}" published to marketplace!`, 'success');
      }
      fetchTemplates();
    } catch (err) {
      addToast('Failed to change template publication status.', 'error');
    }
  };

  const handleToggleFeatured = async (tpl) => {
    try {
      await catalogAPI.toggleFeaturedTemplate(tpl.id);
      addToast(`Updated featured status for "${tpl.title}".`, 'success');
      fetchTemplates();
    } catch (err) {
      addToast('Failed to toggle featured status.', 'error');
    }
  };

  // Submit Create
  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    if (!title || !price || !category) {
      addToast('Please fill title, category, and price.', 'error');
      return;
    }

    setSubmittingCreate(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('short_description', shortDesc);
    formData.append('description', description || shortDesc || title);
    formData.append('compatibility', compatibility);
    formData.append('current_version', currentVersion);
    formData.append('preview_url', previewUrl);
    formData.append('status', status);
    formData.append('is_featured', isFeatured ? 'true' : 'false');

    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }
    if (packageFile) {
      formData.append('package_file', packageFile);
    }

    try {
      await catalogAPI.createAdminTemplate(formData);
      addToast(`"${title}" template created successfully!`, 'success');
      setCreateModalOpen(false);
      // Reset form
      setTitle('');
      setCategory('');
      setPrice('49.00');
      setShortDesc('');
      setDescription('');
      setPreviewUrl('');
      setIsFeatured(false);
      setThumbnailFile(null);
      setPackageFile(null);
      fetchTemplates();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.preview_url?.[0] || 'Failed to create template.';
      addToast(msg, 'error');
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Submit Edit
  const handleUpdateTemplate = async (e) => {
    e.preventDefault();
    if (!editingTemplate) return;
    if (!editTitle || !editPrice || !editCategory) {
      addToast('Please fill all required fields.', 'error');
      return;
    }

    setSubmittingEdit(true);
    const formData = new FormData();
    formData.append('title', editTitle);
    formData.append('category', editCategory);
    formData.append('price', editPrice);
    formData.append('short_description', editShortDesc);
    formData.append('description', editDescription || editShortDesc || editTitle);
    formData.append('compatibility', editCompatibility);
    formData.append('current_version', editCurrentVersion);
    formData.append('preview_url', editPreviewUrl);
    formData.append('status', editStatus);
    formData.append('is_featured', editIsFeatured ? 'true' : 'false');

    if (editThumbnailFile) {
      formData.append('thumbnail', editThumbnailFile);
    }
    if (editPackageFile) {
      formData.append('package_file', editPackageFile);
    }

    try {
      await catalogAPI.updateAdminTemplate(editingTemplate.id, formData);
      addToast(`"${editTitle}" updated successfully!`, 'success');
      setEditModalOpen(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.preview_url?.[0] || 'Failed to update template.';
      addToast(msg, 'error');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Submit Delete
  const handleConfirmDelete = async () => {
    if (!deletingTemplate) return;
    setSubmittingDelete(true);
    try {
      await catalogAPI.deleteAdminTemplate(deletingTemplate.id);
      addToast(`"${deletingTemplate.title}" was permanently removed.`, 'success');
      setDeleteModalOpen(false);
      setDeletingTemplate(null);
      fetchTemplates();
    } catch (err) {
      console.error('Delete error', err);
      addToast('Failed to delete template.', 'error');
    } finally {
      setSubmittingDelete(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Template Catalogue Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create, edit, delete, publish, feature, and configure live demo links for marketplace templates.
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Template
        </button>
      </div>

      {/* Templates Table Container */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden glass-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-4 px-5">Template</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Version</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-center">Featured</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-500">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading templates...
                  </td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-500">
                    No templates found in catalogue. Click "Create New Template" to add one.
                  </td>
                </tr>
              ) : (
                templates.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Template Details with Thumbnail & Live Demo Link */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-9 rounded-xl bg-slate-950 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                          {tpl.thumbnail ? (
                            <img src={tpl.thumbnail} alt={tpl.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs sm:max-w-md">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm truncate">{tpl.title}</span>
                            {tpl.preview_url && (
                              <a
                                href={tpl.preview_url}
                                target="_blank"
                                rel="noreferrer"
                                title={`Open Live Demo: ${tpl.preview_url}`}
                                className="text-cyan-400 hover:text-cyan-300 p-0.5 rounded hover:bg-cyan-500/10 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 truncate">
                            <span className="text-indigo-400 font-medium">
                              {tpl.category_name || tpl.category?.name || 'Uncategorized'}
                            </span>
                            <span>•</span>
                            <span className="truncate">{tpl.short_description || tpl.description?.slice(0, 45)}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-bold text-indigo-400 text-sm whitespace-nowrap">
                      ${tpl.price}
                    </td>

                    <td className="py-4 px-4 font-mono text-slate-400 whitespace-nowrap">
                      v{tpl.current_version}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          tpl.status === 'PUBLISHED'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                            : tpl.status === 'DRAFT'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {tpl.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleFeatured(tpl)}
                        className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                          tpl.is_featured
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                            : 'bg-slate-800/80 text-slate-600 border-slate-700 hover:text-slate-400'
                        }`}
                        title={tpl.is_featured ? 'Featured Template (Click to remove)' : 'Mark as Featured'}
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </td>

                    {/* ACTIONS: Edit, Publish/Unpublish, Delete */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(tpl)}
                          className="py-1.5 px-3 rounded-xl text-xs font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Edit Template Details & Link"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Publish / Unpublish Toggle Button */}
                        <button
                          onClick={() => handleTogglePublish(tpl)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                            tpl.status === 'PUBLISHED'
                              ? 'bg-rose-950/30 text-rose-300 border-rose-800/50 hover:bg-rose-900/40'
                              : 'bg-emerald-950/30 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/40'
                          }`}
                        >
                          {tpl.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleOpenDelete(tpl)}
                          className="p-1.5 rounded-xl text-rose-400 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CREATE NEW TEMPLATE MODAL */}
      {/* ======================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create New Website Template</h3>
                  <p className="text-xs text-slate-400">Add a new theme with live demo link, pricing, and download file.</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prism Portfolio Theme"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Version</label>
                  <input
                    type="text"
                    value={currentVersion}
                    onChange={(e) => setCurrentVersion(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="UNPUBLISHED">Unpublished</option>
                  </select>
                </div>
              </div>

              {/* Live Demo / Preview Link (The user requested this!) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    Live Demo / Preview URL
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional live interactive preview</span>
                </label>
                <input
                  type="text"
                  placeholder="https://preview.yourdomain.com/theme-demo"
                  value={previewUrl}
                  onChange={(e) => setPreviewUrl(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Shown as the clickable address bar and Live Demo button on cards and product details.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Short Description</label>
                <input
                  type="text"
                  placeholder="One sentence summary for catalog cards"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed template features, sections, responsive breakdown..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Compatibility</label>
                <input
                  type="text"
                  value={compatibility}
                  onChange={(e) => setCompatibility(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Uploads Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Thumbnail image upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                    Cover / Thumbnail Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files[0])}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-indigo-300 hover:file:bg-indigo-600 hover:file:text-white cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, or WebP up to 5MB.</p>
                </div>

                {/* Package File (.zip) upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    Downloadable Package (.zip)
                  </label>
                  <input
                    type="file"
                    accept=".zip,.tar.gz"
                    onChange={(e) => setPackageFile(e.target.files[0])}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-indigo-300 hover:file:bg-indigo-600 hover:file:text-white cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Protected zip archive unlocked only after payment.</p>
                </div>
              </div>

              {/* Featured toggle */}
              <div className="pt-2 flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span className="font-semibold">Feature this template on marketplace hero / top shelf</span>
                </label>
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  {submittingCreate ? 'Creating Template...' : 'Save & Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT TEMPLATE MODAL */}
      {/* ======================================================== */}
      {editModalOpen && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Website Template</h3>
                  <p className="text-xs text-slate-400">Update details, price, live demo preview link, or assets.</p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTemplate} className="py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
                  <select
                    required
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Version</label>
                  <input
                    type="text"
                    value={editCurrentVersion}
                    onChange={(e) => setEditCurrentVersion(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="UNPUBLISHED">Unpublished</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              {/* Live Demo / Preview Link (The user requested this!) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    Live Demo / Preview URL
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Test link or demo preview</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="https://preview.yourdomain.com/theme-demo"
                    value={editPreviewUrl}
                    onChange={(e) => setEditPreviewUrl(e.target.value)}
                    className="w-full py-2.5 pl-3.5 pr-20 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                  {editPreviewUrl && (
                    <a
                      href={editPreviewUrl.startsWith('http') ? editPreviewUrl : `https://${editPreviewUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>Test Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  This URL will appear in the card's browser bar and power the "Live Demo" button.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Short Description</label>
                <input
                  type="text"
                  placeholder="One sentence summary for catalog cards"
                  value={editShortDesc}
                  onChange={(e) => setEditShortDesc(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Compatibility</label>
                <input
                  type="text"
                  value={editCompatibility}
                  onChange={(e) => setEditCompatibility(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Uploads Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Thumbnail image upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                      Replace Cover Image
                    </span>
                    {editThumbnailPreview && (
                      <span className="text-[10px] text-emerald-400">Has existing image</span>
                    )}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditThumbnailFile(e.target.files[0])}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-indigo-300 hover:file:bg-indigo-600 hover:file:text-white cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Leave empty to keep existing cover image.</p>
                </div>

                {/* Package File (.zip) upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    Replace Package (.zip)
                  </label>
                  <input
                    type="file"
                    accept=".zip,.tar.gz"
                    onChange={(e) => setEditPackageFile(e.target.files[0])}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-indigo-300 hover:file:bg-indigo-600 hover:file:text-white cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Leave empty to keep existing downloadable archive.</p>
                </div>
              </div>

              {/* Featured toggle */}
              <div className="pt-2 flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsFeatured}
                    onChange={(e) => setEditIsFeatured(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span className="font-semibold">Featured template on marketplace showcase</span>
                </label>
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  {submittingEdit ? 'Saving Changes...' : 'Save Template Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {deleteModalOpen && deletingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Template</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-white">{deletingTemplate.title}</div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Price: ${deletingTemplate.price}</span>
                <span>•</span>
                <span>Version: v{deletingTemplate.current_version}</span>
              </div>
              <p className="text-[11px] text-rose-300/90 pt-1">
                Are you sure you want to permanently remove this template from your store? Existing purchased order records will remain safely archived.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={submittingDelete}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                {submittingDelete ? 'Deleting...' : 'Yes, Delete Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
