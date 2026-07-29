import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Pencil, Trash2, UserPlus } from 'lucide-react'
import {
  useGetExpertsQuery,
  useUpdateExpertMutation,
  useDeleteExpertMutation,
  useExpertSignUpMutation,
} from '../../services/expertService'
import { PageHeader, Button } from '../../components/Common'
import DataTable from '../../components/DataTable'
import Badge from '../../components/Badge'
import Modal from '../../components/Modal'
import ExpertFormFields, {
  ExpertFormTabBar,
  buildExpertRegisterFormData,
} from '../../components/ExpertFormFields'
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

const emptyRegisterForm = {
  ...emptyForm,
  password: '',
  certifications: '',
  languages: '',
}

export default function Experts() {
  const { data: experts = [], isLoading } = useGetExpertsQuery()
  const [updateExpert, { isLoading: isUpdating }] = useUpdateExpertMutation()
  const [deleteExpert, { isLoading: isDeleting }] = useDeleteExpertMutation()
  const [expertSignUp, { isLoading: isRegistering }] = useExpertSignUpMutation()
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [editingExpert, setEditingExpert] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm)
  const [registerTab, setRegisterTab] = useState('basic')
  const [registerError, setRegisterError] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [deleteError, setDeleteError] = useState('')
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
      certificationsValue: expert.certificationsValue || expert.certifications || '',
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

  const openRegister = () => {
    setRegisterForm(emptyRegisterForm)
    setRegisterTab('basic')
    setRegisterError('')
    setRegisterOpen(true)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setRegisterError('')

    if (!registerForm.first_name || !registerForm.email || !registerForm.password) {
      setRegisterError('First name, email and password are required.')
      return
    }

    const { data, error } = await expertSignUp(buildExpertRegisterFormData(registerForm))

    if (error) {
      const errorMsg =
        typeof error.data === 'string'
          ? error.data
          : error.data?.message || 'Registration failed. Please check your inputs.'
      setRegisterError(errorMsg)
      return
    }

    if (data?.success === false) {
      setRegisterError(data.message || 'Registration failed.')
      return
    }

    setRegisterOpen(false)
    setRegisterForm(emptyRegisterForm)
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
    setDeleteError('')

    try {
      await deleteExpert([id]).unwrap()
      setDeleteConfirmId(null)
    } catch (err) {
      setDeleteError(err?.data?.message || 'Failed to delete expert. Please try again.')
    }
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
          <button onClick={(e) => { e.stopPropagation(); setDeleteError(''); setDeleteConfirmId(r.id) }} className="rounded-lg p-1.5 text-ink-soft hover:bg-rose-100 hover:text-rose-700" title="Delete Expert">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Experts"
        subtitle="Review documents, certificates, and profiles before experts go live."
        action={
          <Button onClick={openRegister}>
            <UserPlus size={16} />
            Register Expert
          </Button>
        }
      />

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
          <input placeholder="Search by name or skill" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 rounded-lg border border-dusk-100 bg-canvas px-3 py-2 pl-8 text-sm text-ink placeholder:text-ink-soft/60 focus:border-dusk-500 focus:bg-white focus:outline-none" />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} isLoading={isLoading} onRowClick={(r) => navigate(`/admin/experts/${r.id}`)} emptyMessage="No experts match this view." />

      {/* Register Expert Modal */}
      <Modal open={registerOpen} onClose={() => setRegisterOpen(false)} title="Register Expert" width="max-w-2xl">
        <form onSubmit={handleRegister}>
          <ExpertFormTabBar activeTab={registerTab} onChange={setRegisterTab} />

          {registerError && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {registerError}
            </div>
          )}

          <div className="max-h-[60vh] overflow-y-auto px-1 py-2">
            <ExpertFormFields
              tab={registerTab}
              form={registerForm}
              setForm={setRegisterForm}
              includePassword
            />
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-dusk-50 pt-4">
            <Button type="button" variant="ghost" onClick={() => setRegisterOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isRegistering}>
              {isRegistering ? 'Registering...' : 'Register Expert'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Expert Modal */}
      <Modal open={!!editingExpert} onClose={() => setEditingExpert(null)} title="Edit Expert Profile" width="max-w-2xl">
        <form onSubmit={handleUpdate}>
          <ExpertFormTabBar activeTab={editTab} onChange={setEditTab} />

          <div className="max-h-[60vh] overflow-y-auto px-1 py-2">
            <ExpertFormFields
              tab={editTab}
              form={form}
              setForm={setForm}
              includeAdminFields
            />
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-dusk-50 pt-4">
            <Button type="button" variant="ghost" onClick={() => setEditingExpert(null)}>Cancel</Button>
            <Button type="submit" disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteConfirmId} onClose={() => { setDeleteConfirmId(null); setDeleteError('') }} title="Delete Expert">
        <p className="text-sm text-ink-soft">Are you sure you want to delete this expert? This action cannot be undone.</p>
        {deleteError && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {deleteError}
          </div>
        )}
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
