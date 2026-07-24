import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Pencil, Trash2 } from 'lucide-react'
import { useGetExpertsQuery, useUpdateExpertMutation, useDeleteExpertMutation } from '../../services/expertService'
import { PageHeader, Button, Field, inputCls } from '../../components/Common'
import DataTable from '../../components/DataTable'
import Badge from '../../components/Badge'
import Modal from '../../components/Modal'
import { meta, formatDate } from '../../utils/status'

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'needs_changes', label: 'Needs Changes' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

const emptyForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  bio: '',
  experience_years: '',
  consultation_fee: '',
  verification_status: 'PENDING',
}

export default function Experts() {
  const { data: experts = [], isLoading } = useGetExpertsQuery()
  const [updateExpert, { isLoading: isUpdating }] = useUpdateExpertMutation()
  const [deleteExpert, { isLoading: isDeleting }] = useDeleteExpertMutation()

  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [editingExpert, setEditingExpert] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  const navigate = useNavigate()

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim()
    return experts
      .filter((e) => (tab === 'all' ? true : e.status === tab))
      .filter((e) => {
        if (!s) return true
        const nameMatch = (e.name || '').toLowerCase().includes(s)
        const emailMatch = (e.email || '').toLowerCase().includes(s)
        const phoneMatch = (e.phone || e.mobile || '').includes(s)
        const skillMatch = Array.isArray(e.skillTags) && e.skillTags.some((t) => t.toLowerCase().includes(s))
        return nameMatch || emailMatch || phoneMatch || skillMatch
      })
  }, [experts, tab, search])

  const openEdit = (e, expert) => {
    e.stopPropagation()
    setEditingExpert(expert)
    setForm({
      first_name: expert.first_name || expert.name?.split(' ')[0] || '',
      last_name: expert.last_name || expert.name?.split(' ').slice(1).join(' ') || '',
      email: expert.email || '',
      phone: expert.phone || expert.mobile || '',
      bio: expert.bio || '',
      experience_years: expert.experience_years ?? '',
      consultation_fee: expert.consultation_fee ?? '',
      verification_status: (expert.verification_status || expert.status || 'PENDING').toUpperCase(),
    })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editingExpert) return
    const payload = {
      id: editingExpert.id,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone,
      bio: form.bio,
      experience_years: form.experience_years ? Number(form.experience_years) : null,
      consultation_fee: form.consultation_fee ? Number(form.consultation_fee) : null,
      verification_status: form.verification_status,
    }
    await updateExpert(payload)
    setEditingExpert(null)
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    await deleteExpert([id])
    setDeleteConfirmId(null)
  }

  const columns = [
    {
      key: 'name', header: 'Expert', render: (r) => (
        <div className="flex items-center gap-2.5">
          <img src={r.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
          <div>
            <p className="font-medium text-ink">{r.name}</p>
            <p className="text-xs text-ink-soft">{r.email} · {r.phone || r.mobile}</p>
          </div>
        </div>
      ),
    },
    { key: 'skillTags', header: 'Categories / Skills', render: (r) => <span className="text-ink-soft">{Array.isArray(r.skillTags) ? r.skillTags.join(', ') : '—'}</span> },
    { key: 'experience', header: 'Experience', render: (r) => r.experience || '—' },
    { key: 'appliedOn', header: 'Applied', render: (r) => formatDate(r.appliedOn || r.created_at) },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={meta(r.status).tone}>{meta(r.status).label}</Badge> },
    {
      key: 'actions', header: 'Actions', render: (r) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={(e) => openEdit(e, r)} className="rounded-lg p-1.5 text-ink-soft hover:bg-dusk-50 hover:text-ink" title="Edit Expert">
            <Pencil size={15} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(r.id) }} className="rounded-lg p-1.5 text-ink-soft hover:bg-rose-100 hover:text-rose-700" title="Delete Expert">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Experts" subtitle="Review documents, certificates, and profiles before experts go live." />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl bg-canvas-alt p-1">
          {tabs.map((t) => {
            const count = t.key === 'all' ? experts.length : experts.filter((e) => e.status === t.key).length
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink'}`}
              >
                {t.label} <span className="text-xs text-ink-soft">({count})</span>
              </button>
            )
          })}
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input placeholder="Search by name or skill" value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputCls} w-64 pl-8`} />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} isLoading={isLoading} onRowClick={(r) => navigate(`/admin/experts/${r.id}`)} emptyMessage="No experts match this view." />

      {/* Edit Expert Modal */}
      <Modal open={!!editingExpert} onClose={() => setEditingExpert(null)} title="Edit Expert Profile">
        <form onSubmit={handleUpdate}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name">
              <input required className={inputCls} value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            </Field>
            <Field label="Last Name">
              <input required className={inputCls} value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <input type="email" required className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Phone">
              <input required className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Experience (Years)">
              <input type="number" className={inputCls} value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} placeholder="e.g. 5" />
            </Field>
            <Field label="Consultation Fee (₹)">
              <input type="number" className={inputCls} value={form.consultation_fee} onChange={(e) => setForm({ ...form, consultation_fee: e.target.value })} placeholder="e.g. 500" />
            </Field>
          </div>
          <Field label="Verification Status">
            <select className={inputCls} value={form.verification_status} onChange={(e) => setForm({ ...form, verification_status: e.target.value })}>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="NEEDS_CHANGES">Needs Changes</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </Field>
          <Field label="Bio">
            <textarea rows={3} className={inputCls} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Expert bio and background summary..." />
          </Field>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditingExpert(null)}>Cancel</Button>
            <Button type="submit" disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Delete Expert">
        <p className="text-sm text-ink-soft">Are you sure you want to delete this expert? This action cannot be undone.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
          <Button variant="danger" disabled={isDeleting} onClick={(e) => handleDelete(e, deleteConfirmId)}>
            {isDeleting ? 'Deleting...' : 'Delete Expert'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
