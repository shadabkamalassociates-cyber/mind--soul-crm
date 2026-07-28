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
  alternate_phone: '',
  profile_image: '',
  cover_image: '',
  profile_image_file: null,
  cover_image_file: null,
  country: '',
  timezone: '',
  professional_title: '',
  profession: '',
  whatsapp_number: '',
  city: '',
  state: '',
  education: '',
  certificationsValue: '',
  specialization: '',
  languagesArray: '',
  about: '',
  why_started: '',
  mission: '',
  client_approach: '',
  uniqueness: '',
  profile_completed: false,
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
  const [editTab, setEditTab] = useState('basic')

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
      alternate_phone: expert.alternate_phone || '',
      profile_image: expert.profile_image || '',
      cover_image: expert.cover_image || '',
      profile_image_file: null,
      cover_image_file: null,
      country: expert.country || '',
      timezone: expert.timezone || '',
      professional_title: expert.professional_title || '',
      profession: expert.profession || '',
      whatsapp_number: expert.whatsapp_number || '',
      city: expert.city || '',
      state: expert.state || '',
      education: expert.education || '',
      certificationsValue: expert.certificationsValue || '',
      specialization: expert.specialization || '',
      languagesArray: Array.isArray(expert.languages) ? expert.languages.join(', ') : (expert.languagesArray || ''),
      about: expert.about || '',
      why_started: expert.why_started || '',
      mission: expert.mission || '',
      client_approach: expert.client_approach || '',
      uniqueness: expert.uniqueness || '',
      profile_completed: !!expert.profile_completed,
    })
    setEditTab('basic')
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editingExpert) return

    const payload = {
      first_name: form.first_name,
      last_name: form.last_name || '',
      email: form.email,
      phone: form.phone,
      bio: form.bio || '',
      experience_years: form.experience_years ? Number(form.experience_years) : null,
      consultation_fee: form.consultation_fee !== undefined && form.consultation_fee !== '' ? Number(form.consultation_fee) : 0,
      profile_image: form.profile_image || null,
      status: form.status || 'pending',
      verification_status: form.verification_status || 'PENDING',
    }

    await updateExpert({
      id: editingExpert.id,
      ...payload,
    })
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
      <Modal open={!!editingExpert} onClose={() => setEditingExpert(null)} title="Edit Expert Profile" width="max-w-2xl">
        <form onSubmit={handleUpdate}>
          <div className="mb-4 flex border-b border-dusk-100">
            {[
              { key: 'basic', label: 'Basic' },
              { key: 'professional', label: 'Professional' },
              { key: 'philosophy', label: 'Philosophy' },
              { key: 'location', label: 'Location' },
              { key: 'media', label: 'Media' },
            ].map((t) => (
              <button
                type="button"
                key={t.key}
                onClick={() => setEditTab(t.key)}
                className={`border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${
                  editTab === t.key
                    ? 'border-dusk-700 text-dusk-700 bg-dusk-50/50'
                    : 'border-transparent text-ink-soft hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="max-h-[60vh] overflow-y-auto px-1 py-2">
            {editTab === 'basic' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name">
                    <input required className={inputCls} value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                  </Field>
                  <Field label="Last Name">
                    <input className={inputCls} value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Email">
                    <input type="email" required className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </Field>
                  <Field label="Phone/Mobile">
                    <input required className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Alternate Phone">
                    <input className={inputCls} value={form.alternate_phone} onChange={(e) => setForm({ ...form, alternate_phone: e.target.value })} />
                  </Field>
                  <Field label="WhatsApp Number">
                    <input className={inputCls} value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Verification Status">
                    <select className={inputCls} value={form.verification_status} onChange={(e) => setForm({ ...form, verification_status: e.target.value })}>
                      <option value="PENDING">Pending Review</option>
                      <option value="VERIFIED">Approved</option>
                      <option value="NEEDS_CHANGES">Needs Changes</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </Field>
                  <label className="flex items-center gap-2.5 pt-7">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-dusk-300 text-dusk-700 focus:ring-dusk-500"
                      checked={form.profile_completed}
                      onChange={(e) => setForm({ ...form, profile_completed: e.target.checked })}
                    />
                    <span className="text-sm font-medium text-ink">Profile Completed</span>
                  </label>
                </div>
              </div>
            )}

            {editTab === 'professional' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Professional Title">
                    <input className={inputCls} value={form.professional_title} onChange={(e) => setForm({ ...form, professional_title: e.target.value })} placeholder="e.g. Master Yogi" />
                  </Field>
                  <Field label="Profession">
                    <input className={inputCls} value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} placeholder="e.g. Yoga Teacher" />
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Experience (Years)">
                    <input type="number" className={inputCls} value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} placeholder="e.g. 5" />
                  </Field>
                  <Field label="Consultation Fee (₹)">
                    <input type="number" className={inputCls} value={form.consultation_fee} onChange={(e) => setForm({ ...form, consultation_fee: e.target.value })} placeholder="e.g. 500" />
                  </Field>
                  <Field label="Specialization">
                    <input className={inputCls} value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Vinyasa Yoga" />
                  </Field>
                </div>
                <Field label="Education">
                  <input className={inputCls} value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} placeholder="e.g. B.Sc in Yogic Sciences" />
                </Field>
                <Field label="Languages (comma separated)">
                  <input className={inputCls} value={form.languagesArray} onChange={(e) => setForm({ ...form, languagesArray: e.target.value })} placeholder="e.g. English, Hindi, Spanish" />
                </Field>
                {/* <Field label="Certifications (comma separated)">
                  <textarea rows={2} className={inputCls} value={form.certificationsValue} onChange={(e) => setForm({ ...form, certificationsValue: e.target.value })} placeholder="e.g. Yoga Alliance RYT-200, Reiki Level II" />
                </Field> */}
              </div>
            )}

            {editTab === 'philosophy' && (
              <div className="space-y-3">
                <Field label="Bio (Short Summary)">
                  <textarea rows={2} className={inputCls} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Brief summary for list views..." />
                </Field>
                <Field label="About Me (Full Story)">
                  <textarea rows={3} className={inputCls} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} placeholder="Detailed biography..." />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Why Started">
                    <textarea rows={3} className={inputCls} value={form.why_started} onChange={(e) => setForm({ ...form, why_started: e.target.value })} placeholder="What inspired you to start..." />
                  </Field>
                  <Field label="Mission">
                    <textarea rows={3} className={inputCls} value={form.mission} onChange={(e) => setForm({ ...form, mission: e.target.value })} placeholder="Your professional mission..." />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Client Approach">
                    <textarea rows={3} className={inputCls} value={form.client_approach} onChange={(e) => setForm({ ...form, client_approach: e.target.value })} placeholder="How you approach working with clients..." />
                  </Field>
                  <Field label="Uniqueness">
                    <textarea rows={3} className={inputCls} value={form.uniqueness} onChange={(e) => setForm({ ...form, uniqueness: e.target.value })} placeholder="What makes your sessions unique..." />
                  </Field>
                </div>
              </div>
            )}

            {editTab === 'location' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Country">
                  <input className={inputCls} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="e.g. India" />
                </Field>
                <Field label="Timezone">
                  <input className={inputCls} value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} placeholder="e.g. Asia/Kolkata" />
                </Field>
                <Field label="City">
                  <input className={inputCls} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Mumbai" />
                </Field>
                <Field label="State">
                  <input className={inputCls} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="e.g. Maharashtra" />
                </Field>
              </div>
            )}

            {editTab === 'media' && (
              <div className="space-y-4">
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-ink font-sans">Profile Image (Avatar)</span>
                  {form.profile_image && (
                    <img src={form.profile_image} alt="Profile Preview" className="mb-2 h-20 w-20 rounded-2xl object-cover border border-dusk-100" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className={inputCls}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => setForm(prev => ({ ...prev, profile_image: reader.result, profile_image_file: file }))
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <Field label="Or paste Image URL" className="mt-2">
                    <input className={inputCls} value={form.profile_image} onChange={(e) => setForm({ ...form, profile_image: e.target.value })} placeholder="https://..." />
                  </Field>
                </div>
                <div className="border-t border-dusk-50 pt-3">
                  <span className="mb-1.5 block text-sm font-medium text-ink font-sans">Cover Image</span>
                  {form.cover_image && (
                    <img src={form.cover_image} alt="Cover Preview" className="mb-2 h-24 w-full rounded-xl object-cover border border-dusk-100" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className={inputCls}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => setForm(prev => ({ ...prev, cover_image: reader.result, cover_image_file: file }))
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <Field label="Or paste Cover URL" className="mt-2">
                    <input className={inputCls} value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://..." />
                  </Field>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-dusk-50 pt-4">
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
