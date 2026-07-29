import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  FolderOpen,
  Image as ImageIcon,
  Calendar,
  Tag,
} from "lucide-react";
import {
  useGetBlogCategoriesQuery,
  useCreateBlogCategoryMutation,
  useUpdateBlogCategoryMutation,
  useDeleteBlogCategoryMutation,
} from "../../services/blogService";
import {
  PageHeader,
  Button,
  Field,
  inputCls,
  EmptyState,
  Spinner,
} from "../../components/Common";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";
import { formatDateTime } from "../../utils/status";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
  status: true,
};

export default function BlogCategories() {
  const { data: categories = [], isLoading: isCategoriesLoading } =
    useGetBlogCategoriesQuery();

  const [createCategory] = useCreateBlogCategoryMutation();
  const [updateCategory] = useUpdateBlogCategoryMutation();
  const [deleteCategory] = useDeleteBlogCategoryMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image Upload States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview("");
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      image_url: cat.image_url || "",
      status: cat.status !== false,
    });
    setImageFile(null);
    setImagePreview(cat.image_url || "");
    setModalOpen(true);
  };

  const handleNameChange = (e) => {
    const nameVal = e.target.value;
    const slugVal = nameVal
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // remove special characters
      .replace(/\s+/g, "-") // replace spaces with hyphens
      .replace(/-+/g, "-") // replace multiple hyphens
      .trim();

    setForm((prev) => ({
      ...prev,
      name: nameVal,
      slug: slugVal,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this category? Blogs linked to it will become uncategorized.",
      )
    ) {
      try {
        await deleteCategory(id).unwrap();
      } catch (err) {
        alert(err?.data?.message || "Failed to delete category");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("slug", form.slug);
    if (form.description) formData.append("description", form.description);
    formData.append("status", String(form.status));
    
    if (imageFile) {
      formData.append("image_url", imageFile);
    } else if (form.image_url) {
      formData.append("image_url", form.image_url);
    }

    try {
      if (editing) {
        await updateCategory({ id: editing.id, formData }).unwrap();
      } else {
        await createCategory(formData).unwrap();
      }
      setModalOpen(false);
    } catch (err) {
      alert(err?.data?.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      key: "image_url",
      header: "Icon/Cover",
      render: (r) =>
        r.image_url ? (
          <img
            src={r.image_url}
            alt=""
            className="h-10 w-10 rounded-xl object-cover border border-dusk-100 bg-canvas-alt shadow-sm"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=150&auto=format&fit=crop&q=60";
            }}
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas-alt border border-dusk-50 text-ink-soft">
            <Tag size={16} />
          </div>
        ),
    },
    {
      key: "name",
      header: "Category Details",
      render: (r) => (
        <div>
          <p className="font-semibold text-ink">{r.name}</p>
          <p className="mt-0.5 text-xs text-ink-soft">Slug: /{r.slug}</p>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (r) => (
        <p
          className="max-w-xs text-xs text-ink-soft truncate"
          title={r.description}
        >
          {r.description || "No description provided."}
        </p>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge tone={r.status !== false ? "approved" : "neutral"}>
          {r.status !== false ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Date Created",
      render: (r) => (
        <span className="flex items-center gap-1.5 text-xs text-ink-soft">
          <Calendar size={13} />
          {formatDateTime(r.created_at || r.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEdit(r)}
            className="rounded-lg p-1.5 text-ink-soft hover:bg-dusk-50 hover:text-ink transition-colors cursor-pointer"
            title="Edit Category"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => handleDelete(r.id)}
            className="rounded-lg p-1.5 text-ink-soft hover:bg-rose-100 hover:text-rose-700 transition-colors cursor-pointer"
            title="Delete Category"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog Categories"
        subtitle="Organize blog articles into categories with names, slugs, and descriptive images."
        action={
          <Button onClick={openAdd}>
            <Plus size={16} /> Add Category
          </Button>
        }
      />

      {!isCategoriesLoading && categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No categories found"
          message="Create your first blog category to start organizing article contents."
        />
      ) : (
        <DataTable
          columns={columns}
          data={categories}
          isLoading={isCategoriesLoading}
          emptyMessage="No blog categories found."
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Blog Category" : "Add Blog Category"}
        width="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Category Name">
              <input
                required
                className={inputCls}
                value={form.name}
                onChange={handleNameChange}
                placeholder="e.g. Meditation & Mindfulness"
              />
            </Field>

            <Field label="Slug URL Path">
              <input
                required
                className={inputCls}
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="e.g. meditation-mindfulness"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">Category Image</span>
              <label className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-dusk-200 bg-canvas hover:bg-dusk-50/50 overflow-hidden transition-all relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Category Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center p-3">
                    <ImageIcon size={22} className="mx-auto text-ink-soft mb-1" />
                    <span className="mt-1 block text-xs text-ink font-medium">Upload Image</span>
                    <span className="block text-[10px] text-ink-soft mt-0.5">JPG, PNG or WEBP</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <div className="flex flex-col justify-center">
              <span className="mb-1.5 block text-sm font-medium text-ink">
                Category Status
              </span>
              <label className="flex items-center gap-2.5 cursor-pointer select-none border border-dusk-50 bg-canvas-alt/40 p-4 rounded-xl hover:bg-canvas-alt/70 transition-colors">
                <input
                  type="checkbox"
                  className="rounded border-dusk-100 text-dusk-700 focus:ring-dusk-500 h-5 w-5 cursor-pointer"
                  checked={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.checked })
                  }
                />
                <div>
                  <span className="text-sm font-semibold text-ink block">
                    Active Status
                  </span>
                  <span className="text-xs text-ink-soft block mt-0.5">
                    Visible to users when filtering blogs
                  </span>
                </div>
              </label>
            </div>
          </div>

          <Field label="Description" hint="Describe the focus of this category">
            <textarea
              rows={3}
              className={`${inputCls} resize-y`}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="e.g. Guided meditation practices, focus drills, and self-awareness journals..."
            />
          </Field>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-dusk-50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Spinner className="border-t-white border-white/30" />
              ) : editing ? (
                "Save Changes"
              ) : (
                "Add Category"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
