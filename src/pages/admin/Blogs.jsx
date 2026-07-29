import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Plus, Pencil, Trash2, BookOpen, User, Tag, Calendar, Image as ImageIcon, ChevronDown, ChevronUp, Star, Eye, Globe } from 'lucide-react'
import {
  useGetBlogsQuery,
  useGetBlogCategoriesQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} from '../../services/blogService'
import { PageHeader, Button, Field, inputCls, EmptyState, Spinner } from '../../components/Common'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import Badge from '../../components/Badge'
import RichTextEditor from '../../components/RichTextEditor'
import { formatDateTime } from '../../utils/status'

const emptyForm = {
  category_id: '',
  author_id: '',
  title: '',
  slug: '',
  short_description: '',
  content: '',
  status: 'draft',
  is_featured: false,
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  published_at: '',
}

export default function Blogs() {
  const user = useSelector((s) => s.auth.user)
  const { data: blogs = [], isLoading: isBlogsLoading } = useGetBlogsQuery()
  const { data: categories = [], isLoading: isCategoriesLoading } = useGetBlogCategoriesQuery()
  
  const [createBlog] = useCreateBlogMutation()
  const [updateBlog] = useUpdateBlogMutation()
  const [deleteBlog] = useDeleteBlogMutation()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSeo, setShowSeo] = useState(false)

  // Image Upload States
  const [featuredImageFile, setFeaturedImageFile] = useState(null)
  const [featuredImagePreview, setFeaturedImagePreview] = useState('')
  const [bannerImageFile, setBannerImageFile] = useState(null)
  const [bannerImagePreview, setBannerImagePreview] = useState('')

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setFeaturedImageFile(null)
    setFeaturedImagePreview('')
    setBannerImageFile(null)
    setBannerImagePreview('')
    setShowSeo(false)
    setModalOpen(true)
  }

  const openEdit = (blog) => {
    setEditing(blog)
    
    // Format published_at for datetime-local input (YYYY-MM-DDThh:mm)
    let formattedPubDate = ''
    if (blog.published_at) {
      const date = new Date(blog.published_at)
      formattedPubDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    }

    setForm({
      category_id: blog.category_id || '',
      author_id: blog.author_id || '',
      title: blog.title || '',
      slug: blog.slug || '',
      short_description: blog.short_description || '',
      content: blog.content || '',
      status: blog.status || 'draft',
      is_featured: !!blog.is_featured,
      meta_title: blog.meta_title || '',
      meta_description: blog.meta_description || '',
      meta_keywords: blog.meta_keywords || '',
      published_at: formattedPubDate,
    })

    setFeaturedImageFile(null)
    setFeaturedImagePreview(blog.featured_image || '')
    setBannerImageFile(null)
    setBannerImagePreview(blog.banner_image || '')
    setShowSeo(false)
    setModalOpen(true)
  }

  const handleTitleChange = (e) => {
    const titleVal = e.target.value
    const slugVal = titleVal
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove special characters
      .replace(/\s+/g, '-')         // replace spaces with hyphens
      .replace(/-+/g, '-')          // replace multiple hyphens with single hyphen
      .trim()

    setForm((prev) => ({
      ...prev,
      title: titleVal,
      slug: slugVal,
    }))
  }

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files?.[0]
    if (file) {
      setFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this blog post?')) {
      try {
        await deleteBlog(id).unwrap()
      } catch (err) {
        alert(err?.data?.message || 'Failed to delete blog post')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Prepare Multipart FormData Payload
    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('slug', form.slug)
    formData.append('short_description', form.short_description)
    formData.append('content', form.content)
    formData.append('status', form.status)
    formData.append('is_featured', String(form.is_featured))

    if (form.category_id) {
      formData.append('category_id', "c6f58eee-4732-41e7-8b38-e896def1c75d")
    }
    
    // Check if author_id is a valid integer before appending (UUIDs will be ignored to prevent DB crash)
    if (editing) {
      if (form.author_id && !isNaN(Number(form.author_id))) {
        formData.append('author_id', form.author_id)
      }
    } else {
      if (user?.id && !isNaN(Number(user.id))) {
        formData.append('author_id', user.id)
      }
    }
    if (form.published_at) {
      formData.append('published_at', new Date(form.published_at).toISOString())
    }
    if (form.meta_title) {
      formData.append('meta_title', form.meta_title)
    }
    if (form.meta_description) {
      formData.append('meta_description', form.meta_description)
    }
    if (form.meta_keywords) {
      formData.append('meta_keywords', form.meta_keywords)
    }

    if (featuredImageFile) {
      formData.append('featured_image', featuredImageFile)
    }
    if (bannerImageFile) {
      formData.append('banner_image', bannerImageFile)
    }

    try {
      if (editing) {
        await updateBlog({ id: editing.id, formData }).unwrap()
      } else {
        await createBlog(formData).unwrap()
      }
      setModalOpen(false)
    } catch (err) {
      alert(err?.data?.message || 'Failed to save blog post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'featured_image',
      header: 'Cover',
      render: (r) => (
        r.featured_image ? (
          <img
            src={r.featured_image}
            alt=""
            className="h-10 w-16 rounded-lg object-cover border border-dusk-100 bg-canvas-alt shadow-sm"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=150&auto=format&fit=crop&q=60'
            }}
          />
        ) : (
          <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-canvas-alt border border-dusk-50 text-ink-soft">
            <BookOpen size={16} />
          </div>
        )
      ),
    },
    {
      key: 'title',
      header: 'Article Title',
      render: (r) => (
        <div className="max-w-xs md:max-w-md">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink line-clamp-1">{r.title}</span>
            {r.is_featured && (
              <span className="flex items-center gap-0.5 rounded bg-marigold-100 px-1 py-0.2 text-[9px] font-bold text-marigold-800 uppercase tracking-wide">
                <Star size={8} fill="currentColor" /> Featured
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-ink-soft line-clamp-1">{r.short_description || 'No description provided.'}</p>
        </div>
      ),
    },
    {
      key: 'category_id',
      header: 'Category',
      render: (r) => {
        const cat = categories.find((c) => String(c.id) === String(r.category_id))
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-dusk-50 px-2.5 py-0.5 text-xs font-medium text-ink-soft">
            <Tag size={11} />
            {cat ? cat.name : (r.category_id ? `Cat ID: ${r.category_id}` : 'Uncategorized')}
          </span>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge tone={r.status === 'published' ? 'approved' : 'neutral'}>
          {r.status === 'published' ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'views',
      header: 'Views',
      render: (r) => (
        <span className="flex items-center gap-1 text-xs text-ink-soft">
          <Eye size={13} />
          {r.views ?? 0}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Date Created',
      render: (r) => (
        <span className="flex items-center gap-1.5 text-xs text-ink-soft">
          <Calendar size={13} />
          {formatDateTime(r.created_at || r.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEdit(r)}
            className="rounded-lg p-1.5 text-ink-soft hover:bg-dusk-50 hover:text-ink transition-colors cursor-pointer"
            title="Edit Post"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => handleDelete(r.id)}
            className="rounded-lg p-1.5 text-ink-soft hover:bg-rose-100 hover:text-rose-700 transition-colors cursor-pointer"
            title="Delete Post"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blogs"
        subtitle="Manage blog posts, articles, short descriptions, images, and SEO tags."
        action={
          <Button onClick={openAdd}>
            <Plus size={16} /> Write Article
          </Button>
        }
      />

      {!isBlogsLoading && blogs.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No articles found"
          message="Start by writing your first article and publishing it to seekers."
        />
      ) : (
        <DataTable
          columns={columns}
          data={blogs}
          isLoading={isBlogsLoading}
          emptyMessage="No blog articles found."
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Blog Article' : 'Write Blog Article'}
        width="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Blog Title">
              <input
                required
                className={inputCls}
                value={form.title}
                onChange={handleTitleChange}
                placeholder="e.g. Understanding Inner Child Healing"
              />
            </Field>

            <Field label="Slug URL Path">
              <input
                required
                className={inputCls}
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="e.g. understanding-inner-child-healing"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Blog Category">
              <select
                className={inputCls}
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status">
              <select
                className={inputCls}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Publish Date" hint="Schedule post release date and time">
              <input
                type="datetime-local"
                className={inputCls}
                value={form.published_at}
                onChange={(e) => setForm({ ...form, published_at: e.target.value })}
              />
            </Field>

            <div className="flex items-center pt-8">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-dusk-100 text-dusk-700 focus:ring-dusk-500 h-4.5 w-4.5 cursor-pointer"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                />
                <span className="text-sm font-medium text-ink">Feature this article on dashboard</span>
              </label>
            </div>
          </div>

          {/* Image Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">Featured Image (Cover Photo)</span>
              <label className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-dusk-200 bg-canvas hover:bg-dusk-50/50 overflow-hidden transition-all relative">
                {featuredImagePreview ? (
                  <img
                    src={featuredImagePreview}
                    alt="Featured Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center p-3">
                    <ImageIcon size={22} className="mx-auto text-ink-soft mb-1" />
                    <span className="mt-1 block text-xs text-ink font-medium">Upload Featured Image</span>
                    <span className="block text-[10px] text-ink-soft mt-0.5">JPG, PNG or WEBP</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setFeaturedImageFile, setFeaturedImagePreview)}
                />
              </label>
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">Banner Image (Inside Page Header)</span>
              <label className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-dusk-200 bg-canvas hover:bg-dusk-50/50 overflow-hidden transition-all relative">
                {bannerImagePreview ? (
                  <img
                    src={bannerImagePreview}
                    alt="Banner Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center p-3">
                    <ImageIcon size={22} className="mx-auto text-ink-soft mb-1" />
                    <span className="mt-1 block text-xs text-ink font-medium">Upload Banner Image</span>
                    <span className="block text-[10px] text-ink-soft mt-0.5">JPG, PNG or WEBP</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setBannerImageFile, setBannerImagePreview)}
                />
              </label>
            </div>
          </div>

          <Field label="Short Description" hint="Brief summary shown on grids and lists">
            <textarea
              rows={2}
              className={`${inputCls} resize-y`}
              value={form.short_description}
              onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              placeholder="e.g. A comprehensive guide exploring self-care methods and somatic exercises..."
            />
          </Field>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink">Blog Content</span>
            <RichTextEditor
              value={form.content}
              onChange={(val) => setForm({ ...form, content: val })}
              placeholder="Write the full post contents here..."
            />
          </div>

          {/* Collapsible SEO Metadata */}
          <div className="border border-dusk-50 rounded-xl overflow-hidden bg-canvas/30">
            <button
              type="button"
              onClick={() => setShowSeo(!showSeo)}
              className="w-full flex items-center justify-between px-4 py-3 bg-canvas-alt font-medium text-sm text-ink cursor-pointer hover:bg-canvas-alt/80 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Globe size={15} className="text-ink-soft" />
                SEO Search Engine Optimization (Optional)
              </span>
              {showSeo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showSeo && (
              <div className="p-4 space-y-4 bg-white border-t border-dusk-50">
                <Field label="Meta Title">
                  <input
                    className={inputCls}
                    value={form.meta_title}
                    onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                    placeholder="SEO title tag value"
                  />
                </Field>

                <Field label="Meta Keywords" hint="Separated by commas">
                  <input
                    className={inputCls}
                    value={form.meta_keywords}
                    onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })}
                    placeholder="e.g. child healing, self care, trauma release"
                  />
                </Field>

                <Field label="Meta Description">
                  <textarea
                    rows={2}
                    className={`${inputCls} resize-y`}
                    value={form.meta_description}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                    placeholder="SEO description tag meta value"
                  />
                </Field>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-dusk-50">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Spinner className="border-t-white border-white/30" />
              ) : editing ? (
                'Save Changes'
              ) : (
                'Publish Blog'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
