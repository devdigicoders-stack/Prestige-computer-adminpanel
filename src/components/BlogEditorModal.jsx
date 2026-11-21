import { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { createBlog, updateBlog, uploadImage } from '../services/blogService';

export default function BlogEditorModal({ isOpen, onClose, blog, onSuccess }) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    category: 'General',
    tags: '',
    status: 'draft',
    isFeatured: false,
    readTime: '5 min read',
  });

  useEffect(() => {
    if (blog) {
      setForm({
        title: blog.title || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        coverImage: blog.coverImage || '',
        category: blog.category || 'General',
        tags: (blog.tags || []).join(', '),
        status: blog.status || 'draft',
        isFeatured: blog.isFeatured || false,
        readTime: blog.readTime || '5 min read',
      });
      if (quillRef.current) {
        quillRef.current.root.innerHTML = blog.content || '';
      }
    } else {
      setForm({
        title: '',
        excerpt: '',
        content: '',
        coverImage: '',
        category: 'General',
        tags: '',
        status: 'draft',
        isFeatured: false,
        readTime: '5 min read',
      });
      if (quillRef.current) {
        quillRef.current.root.innerHTML = '';
      }
    }
  }, [blog, isOpen]);

  useEffect(() => {
    if (!isOpen || !editorRef.current) return;

    if (!quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Write your blog content here...',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean'],
          ],
        },
      });
    }

    return () => {
      // Cleanup if needed
    };
  }, [isOpen]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageLoading(true);
    const result = await uploadImage(file);
    setImageLoading(false);

    if (result.success) {
      setForm((prev) => ({ ...prev, coverImage: result.url }));
    } else {
      alert('Image upload failed: ' + result.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Title is required');
      return;
    }

    const content = quillRef.current?.root.innerHTML || form.content;
    if (!content.trim() || content === '<p><br></p>') {
      alert('Content is required');
      return;
    }

    setLoading(true);
    const payload = {
      ...form,
      content,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const result = blog
      ? await updateBlog(blog._id, payload)
      : await createBlog(payload);

    setLoading(false);

    if (result.success) {
      alert(result.message || 'Blog saved successfully');
      onSuccess?.();
      onClose();
    } else {
      alert('Error: ' + result.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{blog ? 'Edit Blog' : 'Create Blog'}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Blog title"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-semibold mb-1">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Short summary of the blog"
              rows="2"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-semibold mb-1">Cover Image</label>
            <div className="flex gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={imageLoading}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              {imageLoading && <span className="text-sm text-gray-500">Uploading...</span>}
            </div>
            {form.coverImage && (
              <div className="mt-2">
                <img
                  src={form.coverImage}
                  alt="Cover"
                  className="h-32 w-full object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Gaming, Laptops"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g., GPU, RTX, Gaming"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Read Time */}
          <div>
            <label className="block text-sm font-semibold mb-1">Read Time</label>
            <input
              type="text"
              value={form.readTime}
              onChange={(e) => setForm((prev) => ({ ...prev, readTime: e.target.value }))}
              placeholder="e.g., 5 min read"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-semibold mb-1">Content *</label>
            <div
              ref={editorRef}
              className="border rounded-lg bg-white"
              style={{ minHeight: '300px' }}
            />
          </div>

          {/* Status & Featured */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold">Featured</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
