import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, FileText, ShieldCheck, IndianRupee, Star, CheckCircle2, XCircle, RotateCcw, Pencil, Trash2, Ban } from 'lucide-react'
import { useGetServicesQuery } from '../../services/serviceService'
import {
  useGetExpertQuery,
  useUpdateExpertStatusMutation,
  useUpdateExpertMutation,
  useDeleteExpertMutation,
  useVerifyExpertMutation,
  useBlockExpertMutation,
} from '../../services/expertService'
import { Button, Field, inputCls, Spinner } from '../../components/Common'
import Badge from '../../components/Badge'
import Modal from '../../components/Modal'
import StatusStepper from '../../components/StatusStepper'
import { meta, currency, formatDate } from '../../utils/status'

const steps = [
  { key: 'pending', label: 'Applied' },
  { key: 'needs_changes', label: 'In Review' },
  { key: 'approved', label: 'Approved' },
]

export default function ExpertDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: expert, isLoading } = useGetExpertQuery(id)
  const { data: services = [] } = useGetServicesQuery()
  const [updateStatus] = useUpdateExpertStatusMutation()
  const [verifyExpert, { isLoading: isVerifying }] = useVerifyExpertMutation()
  const [blockExpert, { isLoading: isBlocking }] = useBlockExpertMutation()
  const [updateExpert, { isLoading: isUpdating }] = useUpdateExpertMutation()
  const [deleteExpert, { isLoading: isDeleting }] = useDeleteExpertMutation()

  const [changesModal, setChangesModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [blockModal, setBlockModal] = useState(false)
  const [note, setNote] = useState('')
  const [blockReason, setBlockReason] = useState('')

  const [editForm, setEditForm] = useState({
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
  })
  const [activeTab, setActiveTab] = useState('overview')
  const [editTab, setEditTab] = useState('basic')

  if (isLoading || !expert) return <div className="flex justify-center py-20"><Spinner /></div>

  const theirServices = services.filter((s) => s.expertId === expert.id)
  const stepperStatus = expert.status === 'approved' ? 'approved' : expert.status === 'needs_changes' ? 'needs_changes' : 'pending'

  const actVerify = async (status, reason) => {
    await verifyExpert({ id: expert.id, user_id: expert.id, status, reason })
    await updateStatus({ id: expert.id, status: status.toLowerCase(), reviewNote: reason })
    if (status === 'NEEDS_CHANGES') setChangesModal(false)
  }

  const handleBlock = async () => {
    await blockExpert({ id: expert.id, user_id: expert.id, reason: blockReason })
    setBlockModal(false)
    setBlockReason('')
  }

  const openEditModal = () => {
    setEditForm({
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
      certificationsValue: Array.isArray(expert.certificates) ? expert.certificates.join(', ') : (expert.certificationsValue || ''),
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
    setEditModal(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('first_name', editForm.first_name)
    formData.append('last_name', editForm.last_name || '')
    formData.append('email', editForm.email)
    formData.append('phone', editForm.phone)
    formData.append('bio', editForm.bio || '')
    formData.append('experience_years', editForm.experience_years ? String(Number(editForm.experience_years)) : '')
    formData.append('consultation_fee', editForm.consultation_fee !== undefined && editForm.consultation_fee !== '' ? String(Number(editForm.consultation_fee)) : '')
    formData.append('verification_status', editForm.verification_status)
    formData.append('alternate_phone', editForm.alternate_phone || '')
    formData.append('country', editForm.country || '')
    formData.append('timezone', editForm.timezone || '')
    formData.append('professional_title', editForm.professional_title || '')
    formData.append('profession', editForm.profession || '')
    formData.append('whatsapp_number', editForm.whatsapp_number || '')
    formData.append('city', editForm.city || '')
    formData.append('state', editForm.state || '')
    formData.append('education', editForm.education || '')
    formData.append('certificationsValue', editForm.certificationsValue || '')
    formData.append('specialization', editForm.specialization || '')
    
    const langs = editForm.languagesArray ? editForm.languagesArray.split(',').map((s) => s.trim()).filter(Boolean) : []
    formData.append('languagesArray', JSON.stringify(langs))
    
    formData.append('about', editForm.about || '')
    formData.append('why_started', editForm.why_started || '')
    formData.append('mission', editForm.mission || '')
    formData.append('client_approach', editForm.client_approach || '')
    formData.append('uniqueness', editForm.uniqueness || '')
    formData.append('profile_completed', editForm.profile_completed ? 'true' : 'false')

    if (editForm.profile_image_file) {
      formData.append('profile_image', editForm.profile_image_file)
    } else if (editForm.profile_image && !editForm.profile_image.startsWith('data:')) {
      formData.append('profile_image', editForm.profile_image)
    }
    if (editForm.cover_image_file) {
      formData.append('cover_image', editForm.cover_image_file)
    } else if (editForm.cover_image && !editForm.cover_image.startsWith('data:')) {
      formData.append('cover_image', editForm.cover_image)
    }

    await updateExpert({
      id: expert.id,
      formData,
    })
    setEditModal(false)
  }

  const handleDelete = async () => {
    await deleteExpert([expert.id])
    navigate('/admin/experts')
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => navigate('/admin/experts')} className="flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
          <ArrowLeft size={15} /> Back to experts
        </button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={openEditModal}>
            <Pencil size={15} /> Edit Profile
          </Button>
          <Button variant="ghost" className="!text-rose-700 hover:!bg-rose-50" onClick={() => setBlockModal(true)}>
            <Ban size={15} /> Block
          </Button>
          <Button variant="danger" onClick={() => setDeleteModal(true)}>
            <Trash2 size={15} /> Delete
          </Button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="overflow-hidden rounded-2xl border border-dusk-50 bg-white shadow-sm">
        {/* Cover Photo */}
        <div className="relative h-48 w-full bg-gradient-to-r from-dusk-700 via-dusk-500 to-marigold-500">
          {expert.cover_image && (
            <img src={expert.cover_image} alt="Cover" className="h-full w-full object-cover" />
          )}
          <div className="absolute right-4 bottom-4">
            <Badge tone={meta(expert.status).tone}>{meta(expert.status).label}</Badge>
          </div>
        </div>

        {/* Profile Identity Details */}
        <div className="relative px-6 pb-6 pt-16">
          <div className="absolute -top-16 left-6">
            <img 
              src={expert.avatar} 
              alt="" 
              className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-md" 
            />
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">
                {expert.name} {expert.professional_title ? `(${expert.professional_title})` : ''}
              </h1>
              <p className="text-sm font-medium text-ink-soft">
                {expert.profession || 'Expert Partner'} · {expert.email} · {expert.mobile}
              </p>
              {expert.specialization && (
                <p className="mt-1 text-xs font-semibold text-dusk-700">Specialized in: {expert.specialization}</p>
              )}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {expert.skillTags.map((s) => <Badge key={s} tone="info">{s}</Badge>)}
              </div>
            </div>
            {expert.profile_completed ? (
              <Badge tone="approved">Profile Completed ✓</Badge>
            ) : (
              <Badge tone="pending">Profile Incomplete</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stepper progress */}
      <div className="mt-6 rounded-2xl border border-dusk-50 bg-white p-6 shadow-sm">
        <StatusStepper
          steps={steps}
          currentStatus={stepperStatus}
          rejected={expert.status === 'rejected'}
          reviewNote={expert.reviewNote}
        />
      </div>

      {/* Detail Tabs */}
      <div className="mt-6 flex border-b border-dusk-100">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'philosophy', label: 'Philosophy & Story' },
          { key: 'professional', label: 'Professional & Education' },
          { key: 'location', label: 'Location & Contact' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === t.key
                ? 'border-dusk-700 text-dusk-700 bg-dusk-50/50'
                : 'border-transparent text-ink-soft hover:text-ink hover:bg-canvas-alt/30'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="mt-6 rounded-2xl border border-dusk-50 bg-white p-6 shadow-sm">
        {activeTab === 'overview' && (
          <div>
            <p className="text-sm leading-relaxed text-ink italic bg-canvas p-4 rounded-xl border border-dusk-50 mb-6">
              "{expert.bio || 'No bio provided.'}"
            </p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-canvas-alt/60 p-3">
                <p className="text-xs text-ink-soft">Experience</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{expert.experience}</p>
              </div>
              <div className="rounded-xl bg-canvas-alt/60 p-3">
                <p className="text-xs text-ink-soft">Languages</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{expert.languages.join(', ')}</p>
              </div>
              <div className="rounded-xl bg-canvas-alt/60 p-3">
                <p className="text-xs text-ink-soft">Applied on</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{formatDate(expert.appliedOn)}</p>
              </div>
              <div className="rounded-xl bg-canvas-alt/60 p-3">
                <p className="text-xs text-ink-soft">Reviewed on</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{formatDate(expert.reviewedOn)}</p>
              </div>
            </div>

            <div className="mt-6 border-t border-dusk-50 pt-5">
              <h3 className="mb-2 text-sm font-semibold text-ink">Documents submitted</h3>
              <div className="flex flex-wrap gap-2">
                {expert.certificates.map((c) => (
                  <span key={c} className="flex items-center gap-1.5 rounded-lg border border-dusk-100 bg-canvas px-3 py-1.5 text-xs text-ink-soft">
                    <FileText size={13} /> {c}
                  </span>
                ))}
                {expert.govId && (
                  <span className="flex items-center gap-1.5 rounded-lg border border-dusk-100 bg-canvas px-3 py-1.5 text-xs text-ink-soft">
                    <ShieldCheck size={13} /> {expert.govId}
                  </span>
                )}
                {expert.certificates.length === 0 && !expert.govId && (
                  <span className="text-xs text-ink-soft">No documents uploaded.</span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft">
                Bank details: {expert.bankVerified ? <Badge tone="approved">Verified</Badge> : <Badge tone="pending">Unverified</Badge>}
              </div>
            </div>

            {expert.status === 'approved' && (
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-dusk-50 pt-5">
                <div className="flex items-center gap-2"><Star size={16} className="text-marigold-500" /><span className="text-sm text-ink">{expert.rating} rating</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-sage-500" /><span className="text-sm text-ink">{expert.totalSessions} sessions</span></div>
                <div className="flex items-center gap-2"><IndianRupee size={16} className="text-dusk-500" /><span className="text-sm text-ink">{currency(expert.earningsLifetime)} earned</span></div>
              </div>
            )}

            {theirServices.length > 0 && (
              <div className="mt-6 border-t border-dusk-50 pt-5">
                <h3 className="mb-2 text-sm font-semibold text-ink">Sessions by this expert</h3>
                <div className="space-y-2">
                  {theirServices.map((s) => (
                    <Link to={`/admin/sessions/${s.id}`} key={s.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-canvas-alt/60">
                      <span className="text-sm text-ink">{s.title}</span>
                      <Badge tone={meta(s.status).tone}>{meta(s.status).label}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {(expert.status === 'pending' || expert.status === 'needs_changes' || expert.status === 'rejected') && (
              <div className="mt-6 flex flex-wrap gap-2 border-t border-dusk-50 pt-5">
                <Button variant="success" disabled={isVerifying} onClick={() => actVerify('APPROVED', 'Application approved by admin.')}>
                  <CheckCircle2 size={16} /> Approve
                </Button>
                <Button variant="ghost" disabled={isVerifying} onClick={() => setChangesModal(true)}>
                  <RotateCcw size={16} /> Request Changes
                </Button>
                <Button variant="danger" disabled={isVerifying} onClick={() => actVerify('REJECTED', 'Application rejected by admin.')}>
                  <XCircle size={16} /> Reject
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'philosophy' && (
          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-soft">About (Full Story)</h4>
              <p className="mt-1.5 text-sm text-ink leading-relaxed whitespace-pre-line">{expert.about || 'No detailed biography provided.'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-dusk-50 pt-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Why Started</h4>
                <p className="mt-1.5 text-sm text-ink leading-relaxed whitespace-pre-line">{expert.why_started || 'No background information provided.'}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Mission</h4>
                <p className="mt-1.5 text-sm text-ink leading-relaxed whitespace-pre-line">{expert.mission || 'No mission statement provided.'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-dusk-50 pt-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Client Approach</h4>
                <p className="mt-1.5 text-sm text-ink leading-relaxed whitespace-pre-line">{expert.client_approach || 'No client approach details provided.'}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Uniqueness</h4>
                <p className="mt-1.5 text-sm text-ink leading-relaxed whitespace-pre-line">{expert.uniqueness || 'No uniqueness statement provided.'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'professional' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Professional Title</span>
                <p className="mt-0.5 text-sm font-semibold text-ink">{expert.professional_title || '—'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Profession</span>
                <p className="mt-0.5 text-sm font-semibold text-ink">{expert.profession || '—'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Specialization</span>
                <p className="mt-0.5 text-sm font-semibold text-ink">{expert.specialization || '—'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Education</span>
                <p className="mt-0.5 text-sm font-semibold text-ink">{expert.education || '—'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Experience (Years)</span>
                <p className="mt-0.5 text-sm font-semibold text-ink">{expert.experience_years ? `${expert.experience_years} Years` : '—'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Consultation Fee</span>
                <p className="mt-0.5 text-sm font-semibold text-ink">{expert.consultation_fee ? `₹${expert.consultation_fee}` : 'Free / Not Specified'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Certifications</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {expert.certificates.length > 0 ? (
                    expert.certificates.map((c) => <Badge key={c} tone="info">{c}</Badge>)
                  ) : (
                    <span className="text-sm text-ink-soft">—</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Languages</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {expert.languages.length > 0 ? (
                    expert.languages.map((l) => <Badge key={l} tone="ghost">{l}</Badge>)
                  ) : (
                    <span className="text-sm text-ink-soft">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'location' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Country</span>
                <p className="mt-0.5 text-sm font-semibold text-ink">{expert.country || '—'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Timezone</span>
                <p className="mt-0.5 text-sm font-semibold text-ink">{expert.timezone || '—'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">City</span>
                <p className="mt-0.5 text-sm font-semibold text-ink">{expert.city || '—'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">State</span>
                <p className="mt-0.5 text-sm font-semibold text-ink">{expert.state || '—'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">WhatsApp Number</span>
                <p className="mt-0.5 text-sm font-semibold text-ink">{expert.whatsapp_number || '—'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Alternate Phone</span>
                <p className="mt-0.5 text-sm font-semibold text-ink">{expert.alternate_phone || '—'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Profile Completed Status</span>
                <div className="mt-1">
                  {expert.profile_completed ? (
                    <Badge tone="approved">Completed</Badge>
                  ) : (
                    <Badge tone="pending">Incomplete</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal open={changesModal} onClose={() => setChangesModal(false)} title="Request changes">
        <Field label="What needs to change?">
          <textarea rows={4} className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Bank account name doesn't match PAN card." />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setChangesModal(false)}>Cancel</Button>
          <Button onClick={() => actVerify('NEEDS_CHANGES', note)} disabled={!note.trim() || isVerifying}>Send to expert</Button>
        </div>
      </Modal>

      {/* Block Expert Modal */}
      <Modal open={blockModal} onClose={() => setBlockModal(false)} title="Block Expert Account">
        <Field label="Reason for blocking">
          <textarea rows={3} className={inputCls} value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="e.g. Violation of terms of service..." />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setBlockModal(false)}>Cancel</Button>
          <Button variant="danger" disabled={isBlocking} onClick={handleBlock}>
            {isBlocking ? 'Blocking...' : 'Confirm Block'}
          </Button>
        </div>
      </Modal>

      {/* Edit Expert Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Expert Profile" width="max-w-2xl">
        <form onSubmit={handleEditSubmit}>
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
                    <input required className={inputCls} value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} />
                  </Field>
                  <Field label="Last Name">
                    <input className={inputCls} value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Email">
                    <input type="email" required className={inputCls} value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                  </Field>
                  <Field label="Phone/Mobile">
                    <input required className={inputCls} value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Alternate Phone">
                    <input className={inputCls} value={editForm.alternate_phone} onChange={(e) => setEditForm({ ...editForm, alternate_phone: e.target.value })} />
                  </Field>
                  <Field label="WhatsApp Number">
                    <input className={inputCls} value={editForm.whatsapp_number} onChange={(e) => setEditForm({ ...editForm, whatsapp_number: e.target.value })} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Verification Status">
                    <select className={inputCls} value={editForm.verification_status} onChange={(e) => setEditForm({ ...editForm, verification_status: e.target.value })}>
                      <option value="PENDING">Pending Review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="NEEDS_CHANGES">Needs Changes</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </Field>
                  <label className="flex items-center gap-2.5 pt-7">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-dusk-300 text-dusk-700 focus:ring-dusk-500"
                      checked={editForm.profile_completed}
                      onChange={(e) => setEditForm({ ...editForm, profile_completed: e.target.checked })}
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
                    <input className={inputCls} value={editForm.professional_title} onChange={(e) => setEditForm({ ...editForm, professional_title: e.target.value })} placeholder="e.g. Master Yogi" />
                  </Field>
                  <Field label="Profession">
                    <input className={inputCls} value={editForm.profession} onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })} placeholder="e.g. Yoga Teacher" />
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Experience (Years)">
                    <input type="number" className={inputCls} value={editForm.experience_years} onChange={(e) => setEditForm({ ...editForm, experience_years: e.target.value })} placeholder="e.g. 5" />
                  </Field>
                  <Field label="Consultation Fee (₹)">
                    <input type="number" className={inputCls} value={editForm.consultation_fee} onChange={(e) => setEditForm({ ...editForm, consultation_fee: e.target.value })} placeholder="e.g. 500" />
                  </Field>
                  <Field label="Specialization">
                    <input className={inputCls} value={editForm.specialization} onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })} placeholder="e.g. Vinyasa Yoga" />
                  </Field>
                </div>
                <Field label="Education">
                  <input className={inputCls} value={editForm.education} onChange={(e) => setEditForm({ ...editForm, education: e.target.value })} placeholder="e.g. B.Sc in Yogic Sciences" />
                </Field>
                <Field label="Languages (comma separated)">
                  <input className={inputCls} value={editForm.languagesArray} onChange={(e) => setEditForm({ ...editForm, languagesArray: e.target.value })} placeholder="e.g. English, Hindi, Spanish" />
                </Field>
                <Field label="Certifications (comma separated)">
                  <textarea rows={2} className={inputCls} value={editForm.certificationsValue} onChange={(e) => setEditForm({ ...editForm, certificationsValue: e.target.value })} placeholder="e.g. Yoga Alliance RYT-200, Reiki Level II" />
                </Field>
              </div>
            )}

            {editTab === 'philosophy' && (
              <div className="space-y-3">
                <Field label="Bio (Short Summary)">
                  <textarea rows={2} className={inputCls} value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Brief summary for list views..." />
                </Field>
                <Field label="About Me (Full Story)">
                  <textarea rows={3} className={inputCls} value={editForm.about} onChange={(e) => setEditForm({ ...editForm, about: e.target.value })} placeholder="Detailed biography..." />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Why Started">
                    <textarea rows={3} className={inputCls} value={editForm.why_started} onChange={(e) => setEditForm({ ...editForm, why_started: e.target.value })} placeholder="What inspired you to start..." />
                  </Field>
                  <Field label="Mission">
                    <textarea rows={3} className={inputCls} value={editForm.mission} onChange={(e) => setEditForm({ ...editForm, mission: e.target.value })} placeholder="Your professional mission..." />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Client Approach">
                    <textarea rows={3} className={inputCls} value={editForm.client_approach} onChange={(e) => setEditForm({ ...editForm, client_approach: e.target.value })} placeholder="How you approach working with clients..." />
                  </Field>
                  <Field label="Uniqueness">
                    <textarea rows={3} className={inputCls} value={editForm.uniqueness} onChange={(e) => setEditForm({ ...editForm, uniqueness: e.target.value })} placeholder="What makes your sessions unique..." />
                  </Field>
                </div>
              </div>
            )}

            {editTab === 'location' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Country">
                  <input className={inputCls} value={editForm.country} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} placeholder="e.g. India" />
                </Field>
                <Field label="Timezone">
                  <input className={inputCls} value={editForm.timezone} onChange={(e) => setEditForm({ ...editForm, timezone: e.target.value })} placeholder="e.g. Asia/Kolkata" />
                </Field>
                <Field label="City">
                  <input className={inputCls} value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} placeholder="e.g. Mumbai" />
                </Field>
                <Field label="State">
                  <input className={inputCls} value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} placeholder="e.g. Maharashtra" />
                </Field>
              </div>
            )}

            {editTab === 'media' && (
              <div className="space-y-4">
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-ink font-sans">Profile Image (Avatar)</span>
                  {editForm.profile_image && (
                    <img src={editForm.profile_image} alt="Profile Preview" className="mb-2 h-20 w-20 rounded-2xl object-cover border border-dusk-100" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className={inputCls}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => setEditForm(prev => ({ ...prev, profile_image: reader.result, profile_image_file: file }))
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <Field label="Or paste Image URL" className="mt-2">
                    <input className={inputCls} value={editForm.profile_image} onChange={(e) => setEditForm({ ...editForm, profile_image: e.target.value })} placeholder="https://..." />
                  </Field>
                </div>
                <div className="border-t border-dusk-50 pt-3">
                  <span className="mb-1.5 block text-sm font-medium text-ink font-sans">Cover Image</span>
                  {editForm.cover_image && (
                    <img src={editForm.cover_image} alt="Cover Preview" className="mb-2 h-24 w-full rounded-xl object-cover border border-dusk-100" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className={inputCls}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => setEditForm(prev => ({ ...prev, cover_image: reader.result, cover_image_file: file }))
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <Field label="Or paste Cover URL" className="mt-2">
                    <input className={inputCls} value={editForm.cover_image} onChange={(e) => setEditForm({ ...editForm, cover_image: e.target.value })} placeholder="https://..." />
                  </Field>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-dusk-50 pt-4">
            <Button type="button" variant="ghost" onClick={() => setEditModal(false)}>Cancel</Button>
            <Button type="submit" disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Expert">
        <p className="text-sm text-ink-soft">Are you sure you want to delete this expert profile? This action cannot be undone.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" disabled={isDeleting} onClick={handleDelete}>
            {isDeleting ? 'Deleting...' : 'Delete Expert'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
