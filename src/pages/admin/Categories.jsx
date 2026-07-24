import { useState } from 'react'
import { Plus, Pencil, Trash2, Tag, Star } from 'lucide-react'
import {
  useGetCategoriesQuery, useAddCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation,
} from '../../services/categoryService'
import { PageHeader, Button, Field, inputCls, EmptyState } from '../../components/Common'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { formatDateTime } from '../../utils/status'

const emptyForm = { name: '', icon: '' }

export default function Categories() {
  const { data: categories = [], isLoading } = useGetCategoriesQuery()
  const [addCategory] = useAddCategoryMutation()
  const [updateCategory] = useUpdateCategoryMutation()
  const [deleteCategory] = useDeleteCategoryMutation()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (cat) => {
    setEditing(cat)
    setForm({
      name: cat.name || '',
      icon: cat.icon || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { name: form.name, icon: form.icon }
    if (editing) await updateCategory({ id: editing.id, ...payload })
    else await addCategory(payload)
    setModalOpen(false)
  }

  const columns = [
    { key: 'id', header: 'ID', render: (r) => <span className="font-mono text-xs font-semibold text-ink-soft">#{r.id}</span> },
    {
      key: 'name', header: 'Category Name', render: (r) => (
        <span className="font-medium capitalize text-ink">{r.name}</span>
      ),
    },
    {
      key: 'icon', header: 'Icon', render: (r) => (
        <span className="rounded bg-canvas-alt px-2 py-0.5 font-mono text-xs text-ink-soft">{r.icon || '—'}</span>
      ),
    },
    {
      key: 'average_rating', header: 'Average Rating', render: (r) => (
        <div className="flex items-center gap-1 font-medium text-ink">
          <Star size={14} className="fill-marigold-400 text-marigold-500" />
          <span>{r.average_rating ? Number(r.average_rating).toFixed(2) : '0.00'}</span>
        </div>
      ),
    },
    {
      key: 'total_ratings', header: 'Total Ratings', render: (r) => (
        <span className="font-medium text-ink-soft">{r.total_ratings ?? 0}</span>
      ),
    },
    {
      key: 'created_at', header: 'Created At', render: (r) => (
        <span className="text-xs text-ink-soft">{formatDateTime(r.created_at)}</span>
      ),
    },
    {
      key: 'actions', header: '', render: (r) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(r)} className="rounded-lg p-1.5 text-ink-soft hover:bg-dusk-50 hover:text-ink" title="Edit Category"><Pencil size={15} /></button>
          <button onClick={() => deleteCategory(r.id)} className="rounded-lg p-1.5 text-ink-soft hover:bg-rose-100 hover:text-rose-700" title="Delete Category"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Manage category master records used across SoulSensei platform."
        action={<Button onClick={openAdd}><Plus size={16} /> Add Category</Button>}
      />

      {!isLoading && categories.length === 0 ? (
        <EmptyState icon={Tag} title="No categories yet" message="Add your first category to start organizing services." />
      ) : (
        <DataTable columns={columns} data={categories} isLoading={isLoading} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit category' : 'Add category'}>
        <form onSubmit={handleSubmit}>
          <Field label="Category name">
            <input required className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. meditation" />
          </Field>
          <Field label="Icon" hint="Icon code or identifier">
            <input className={inputCls} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. 123456" />
          </Field>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Save changes' : 'Add category'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
