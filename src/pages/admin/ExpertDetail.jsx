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
  const [updateStatus, { isLoading: updating }] = useUpdateExpertStatusMutation()
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
    first_name: '', last_name: '', email: '', phone: '', bio: '', experience_years: '', consultation_fee: '', verification_status: 'PENDING',
  })

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
    })
    setEditModal(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    await updateExpert({
      id: expert.id,
      first_name: editForm.first_name,
      last_name: editForm.last_name,
      email: editForm.email,
      phone: editForm.phone,
      bio: editForm.bio,
      experience_years: editForm.experience_years ? Number(editForm.experience_years) : null,
      consultation_fee: editForm.consultation_fee ? Number(editForm.consultation_fee) : null,
      verification_status: editForm.verification_status,
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

      <div className="rounded-2xl border border-dusk-50 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={expert.avatar} alt="" className="h-16 w-16 rounded-2xl object-cover" />
            <div>
              <h1 className="font-display text-xl font-semibold text-ink">{expert.name}</h1>
              <p className="text-sm text-ink-soft">{expert.email} · {expert.mobile}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {expert.skillTags.map((s) => <Badge key={s} tone="info">{s}</Badge>)}
              </div>
            </div>
          </div>
          <Badge tone={meta(expert.status).tone}>{meta(expert.status).label}</Badge>
        </div>

        <div className="mt-6">
          <StatusStepper
            steps={steps}
            currentStatus={stepperStatus}
            rejected={expert.status === 'rejected'}
            reviewNote={expert.reviewNote}
          />
        </div>

        <p className="mt-6 text-sm leading-relaxed text-ink">{expert.bio}</p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
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

        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold text-ink">Documents submitted</h3>
          <div className="flex flex-wrap gap-2">
            {expert.certificates.map((c) => (
              <span key={c} className="flex items-center gap-1.5 rounded-lg border border-dusk-100 bg-canvas px-3 py-1.5 text-xs text-ink-soft"><FileText size={13} /> {c}</span>
            ))}
            {expert.govId && <span className="flex items-center gap-1.5 rounded-lg border border-dusk-100 bg-canvas px-3 py-1.5 text-xs text-ink-soft"><ShieldCheck size={13} /> {expert.govId}</span>}
            {expert.certificates.length === 0 && !expert.govId && <span className="text-xs text-ink-soft">No documents uploaded.</span>}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft">
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
            <h3 className="mb-2 text-sm font-semibold text-ink">Services by this expert</h3>
            <div className="space-y-2">
              {theirServices.map((s) => (
                <Link to={`/admin/services/${s.id}`} key={s.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-canvas-alt/60">
                  <span className="text-sm text-ink">{s.title}</span>
                  <Badge tone={meta(s.status).tone}>{meta(s.status).label}</Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {(expert.status === 'pending' || expert.status === 'needs_changes' || expert.status === 'rejected') && (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-dusk-50 pt-5">
            <Button variant="success" disabled={isVerifying} onClick={() => actVerify('APPROVED', 'Application approved by admin.')}><CheckCircle2 size={16} /> Approve</Button>
            <Button variant="ghost" disabled={isVerifying} onClick={() => setChangesModal(true)}><RotateCcw size={16} /> Request Changes</Button>
            <Button variant="danger" disabled={isVerifying} onClick={() => actVerify('REJECTED', 'Application rejected by admin.')}><XCircle size={16} /> Reject</Button>
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
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Expert Profile">
        <form onSubmit={handleEditSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name">
              <input required className={inputCls} value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} />
            </Field>
            <Field label="Last Name">
              <input required className={inputCls} value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <input type="email" required className={inputCls} value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </Field>
            <Field label="Phone">
              <input required className={inputCls} value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Experience (Years)">
              <input type="number" className={inputCls} value={editForm.experience_years} onChange={(e) => setEditForm({ ...editForm, experience_years: e.target.value })} placeholder="e.g. 5" />
            </Field>
            <Field label="Consultation Fee (₹)">
              <input type="number" className={inputCls} value={editForm.consultation_fee} onChange={(e) => setEditForm({ ...editForm, consultation_fee: e.target.value })} placeholder="e.g. 500" />
            </Field>
          </div>
          <Field label="Verification Status">
            <select className={inputCls} value={editForm.verification_status} onChange={(e) => setEditForm({ ...editForm, verification_status: e.target.value })}>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="NEEDS_CHANGES">Needs Changes</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </Field>
          <Field label="Bio">
            <textarea rows={3} className={inputCls} value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Expert bio and background summary..." />
          </Field>
          <div className="mt-4 flex justify-end gap-2">
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
