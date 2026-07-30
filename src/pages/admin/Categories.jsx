import { useState } from "react";
import { Plus, Pencil, Trash2, Tag, Star } from "lucide-react";
import {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../services/categoryService";
import {
  PageHeader,
  Button,
  Field,
  inputCls,
  EmptyState,
} from "../../components/Common";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { formatDateTime } from "../../utils/status";

const emptyForm = { name: "", icon: "", icon_file: null };

export default function Categories() {
  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const [addCategory] = useAddCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };
  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name || "",
      icon: cat.icon || "",
      icon_file: null,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    if (form.icon_file) {
      formData.append("icon", form.icon_file);
    }

    if (editing) {
      formData.append("id", editing.id);
      await updateCategory(formData);
    } else {
      await addCategory(formData);
    }
    setModalOpen(false);
  };

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-ink-soft">
          #{r.id}
        </span>
      ),
    },
    {
      key: "name",
      header: "Category Name",
      render: (r) => (
        <span className="font-medium capitalize text-ink">{r.name}</span>
      ),
    },
    {
      key: "icon",
      header: "Icon",
      render: (r) =>
        r.icon ? (
          <img
            src={r.icon}
            alt={r.name}
            className="h-8 w-8 rounded object-cover border border-dusk-100"
          />
        ) : (
          <span className="text-ink-soft text-xs">—</span>
        ),
    },
    {
      key: "average_rating",
      header: "Average Rating",
      render: (r) => (
        <div className="flex items-center gap-1 font-medium text-ink">
          <Star size={14} className="fill-marigold-400 text-marigold-500" />
          <span>
            {r.average_rating ? Number(r.average_rating).toFixed(2) : "0.00"}
          </span>
        </div>
      ),
    },
    {
      key: "total_ratings",
      header: "Total Ratings",
      render: (r) => (
        <span className="font-medium text-ink-soft">
          {r.total_ratings ?? 0}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Created At",
      render: (r) => (
        <span className="text-xs text-ink-soft">
          {formatDateTime(r.created_at)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(r)}
            className="rounded-lg p-1.5 text-ink-soft hover:bg-dusk-50 hover:text-ink"
            title="Edit Category"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setDeleteConfirmId(r.id)}
            className="rounded-lg p-1.5 text-ink-soft hover:bg-rose-100 hover:text-rose-700"
            title="Delete Category"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Manage category master records used across Cosmicguruji platform."
        action={
          <Button onClick={openAdd}>
            <Plus size={16} /> Add Category
          </Button>
        }
      />

      {!isLoading && categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No categories yet"
          message="Add your first category to start organizing services."
        />
      ) : (
        <DataTable columns={columns} data={categories} isLoading={isLoading} />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit category" : "Add category"}
      >
        <form onSubmit={handleSubmit}>
          <Field label="Category name">
            <input
              required
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. meditation"
            />
          </Field>
          <Field
            label="Icon Image"
            hint="Upload an image for the category icon"
          >
            <input
              type="file"
              accept="image/*"
              className={inputCls}
              onChange={(e) =>
                setForm({ ...form, icon_file: e.target.files[0] })
              }
            />
          </Field>
          {(form.icon_file || form.icon) && (
            <div className="mt-2 text-sm text-ink-soft">
              <span className="block mb-1">Preview:</span>
              <img
                src={
                  form.icon_file
                    ? URL.createObjectURL(form.icon_file)
                    : form.icon
                }
                alt="Icon Preview"
                className="h-12 w-12 rounded object-cover border border-dusk-100"
              />
            </div>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editing ? "Save changes" : "Add category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Category"
      >
        <p className="text-sm text-ink-soft">
          Are you sure you want to delete this category? This action cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={isDeleting}
            onClick={async () => {
              try {
                await deleteCategory(deleteConfirmId).unwrap();
                setDeleteConfirmId(null);
              } catch (err) {
                console.error("Failed to delete category", err);
              }
            }}
          >
            {isDeleting ? "Deleting..." : "Delete Category"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
