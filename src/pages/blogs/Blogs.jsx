import { useEffect, useState } from 'react';
import { getAdminBlogs, deleteBlog } from '../../services/blogService';
import BlogEditorModal from '../../components/BlogEditorModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import {
  PlusIcon,
  SearchIcon,
  ChevronDownIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  StarIcon,
} from '../../components/common/Icons';

const ITEMS_PER_PAGE = 10;

function StatusBadge({ status }) {
  const styles =
    status === 'published'
      ? 'bg-[#dcfce7] text-[#15803d]'
      : 'bg-[#fef9c3] text-[#854d0e]';
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11.5px] font-semibold whitespace-nowrap ${styles}`}
    >
      {status === 'published' ? 'Published' : 'Draft'}
    </span>
  );
}

function StatCard({ label, value, color = 'text-[#111827]' }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl px-5 py-4 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
      <p className="text-[12px] font-medium text-[#6b7280] mb-1">{label}</p>
      <p className={`text-[26px] font-bold leading-none ${color}`}>{value}</p>
    </div>
  );
}

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState({});

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchBlogs = async () => {
    setLoading(true);
    const data = await getAdminBlogs({ status, search, page, limit: ITEMS_PER_PAGE });
    setBlogs(data.blogs || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setStatusCounts(data.statusCounts || {});
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, [page, status, search]);

  const handleCreate = () => {
    setSelectedBlog(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setIsEditorOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const result = await deleteBlog(deleteConfirm._id);
    if (result.success) {
      setDeleteConfirm(null);
      fetchBlogs();
    } else {
      alert('Error: ' + result.message);
    }
  };

  const handleSuccess = () => {
    setPage(1);
    fetchBlogs();
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight">
            Blog Management
          </h1>
          <p className="mt-0.5 text-[12.5px] sm:text-[13px] font-normal text-[#525866]">
            Create, edit, and manage your blog posts.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] active:scale-[0.99] text-white text-[13px] font-medium shadow-[0_6px_16px_-4px_rgba(208,12,12,0.5)] transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusIcon className="w-[17px] h-[17px]" />
          <span>New Blog</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Total Blogs" value={statusCounts.all ?? 0} />
        <StatCard label="Published" value={statusCounts.published ?? 0} color="text-[#15803d]" />
        <StatCard label="Drafts" value={statusCounts.draft ?? 0} color="text-[#854d0e]" />
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Search */}
        <div className="w-full lg:max-w-[380px]">
          <div className="flex items-center gap-2.5 bg-white border border-[#d6dae2] rounded-lg px-3.5 py-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus-within:border-[#dc1414] focus-within:ring-2 focus-within:ring-[#dc1414]/15 transition-all">
            <SearchIcon className="w-4 h-4 text-[#4b5563] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search blogs..."
              className="w-full bg-transparent text-[12.5px] text-[#111827] placeholder:text-[#6b7280] focus:outline-none"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2.5">
          <label className="text-[12.5px] font-medium text-[#1f2937] whitespace-nowrap">
            Status:
          </label>
          <div className="relative w-[160px]">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full appearance-none rounded-lg border border-[#d6dae2] bg-white pl-3.5 pr-9 py-2.5 text-[12.5px] font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus:border-[#dc1414] focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <ChevronDownIcon className="w-4 h-4 text-[#4b5563] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0_1px_3px_rgba(16,24,40,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px] border-collapse">
            <thead>
              <tr className="border-b border-[#eef0f4] bg-[#f8f9fb] text-[#4b5563] font-medium">
                <th className="py-3.5 pl-5 pr-3">Blog</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-3 text-center">Featured</th>
                <th className="py-3.5 px-3 text-center">Views</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f4]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6b7280]">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#dc1414] border-t-transparent rounded-full animate-spin" />
                      <span>Loading blogs...</span>
                    </div>
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[13px] text-[#6b7280]">
                    No blogs match your current filters.
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog._id} className="transition-colors hover:bg-[#fafbfc]">
                    {/* Blog Title + Image */}
                    <td className="py-3.5 pl-5 pr-3">
                      <div className="flex items-center gap-3.5">
                        {blog.coverImage ? (
                          <img
                            src={blog.coverImage}
                            alt={blog.title}
                            className="w-12 h-9 rounded-lg border border-[#e5e7eb] object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-9 rounded-lg border border-[#e5e7eb] bg-[#f8f9fb] flex items-center justify-center shrink-0 text-[#9ca3af]">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                              <rect x="3" y="4" width="18" height="12" rx="2" />
                              <path d="M7 20h10M12 16v4" strokeLinecap="round" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-[#111827] truncate max-w-[260px]">
                            {blog.title}
                          </p>
                          <p className="text-[11.5px] text-[#6b7280] truncate max-w-[260px]">
                            {blog.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3 font-medium text-[#374151]">
                      {blog.category || '—'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center">
                      <StatusBadge status={blog.status} />
                    </td>

                    {/* Featured */}
                    <td className="py-3.5 px-3 text-center">
                      {blog.isFeatured ? (
                        <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <StarIcon className="w-3 h-3" />
                          Yes
                        </span>
                      ) : (
                        <span className="text-[#9ca3af] text-[12px]">—</span>
                      )}
                    </td>

                    {/* Views */}
                    <td className="py-3.5 px-3 text-center font-medium text-[#111827]">
                      {blog.views ?? 0}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 text-[#6b7280]">
                      {new Date(blog.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pl-3 pr-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(blog)}
                          aria-label={`Edit ${blog.title}`}
                          className="p-1.5 rounded-lg text-[#374151] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(blog)}
                          aria-label={`Delete ${blog.title}`}
                          className="p-1.5 rounded-lg text-[#dc1414] hover:text-[#a30b0b] hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <TrashIcon />
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

      {/* Pagination */}
      {pages > 1 && (
        <Pagination
          currentPage={page}
          totalItems={total}
          pageSize={ITEMS_PER_PAGE}
          onPageChange={setPage}
          itemName="blogs"
        />
      )}

      {/* Modals */}
      <BlogEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        blog={selectedBlog}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Blog?"
        message={`Are you sure you want to permanently delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
