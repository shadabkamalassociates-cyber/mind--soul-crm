import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, FileText, ShieldCheck, IndianRupee, Star, CheckCircle2,
  XCircle, RotateCcw, Pencil, Trash2, Ban, Phone, Mail, Calendar,
  MapPin, Globe, Clock, Award, BadgeCheck, User, Briefcase, BookOpen,
  MessageCircle, Languages, DollarSign, AlertCircle
} from 'lucide-react'
import { useGetSessionsByExpertQuery } from '../../services/serviceService'
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
import { formatDate } from '../../utils/status'

const verificationTone = (status) => {
  const s = (status || '').toUpperCase()
  if (s === 'VERIFIED') return 'approved'
  if (s === 'REJECTED') return 'danger'
  if (s === 'NEEDS_CHANGES') return 'warning'
  return 'pending'
}

const verificationLabel = (status) => {
  const s = (status || '').toUpperCase()
  if (s === 'VERIFIED') return 'Verified'
  if (s === 'REJECTED') return 'Rejected'
  if (s === 'NEEDS_CHANGES') return 'Needs Changes'
  return 'Pending Review'
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-dusk-50 last:border-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dusk-50 text-dusk-700">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{label}</p>
        <p className="mt-0.5 text-sm text-ink font-medium break-words">{value}</p>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-dusk-50 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-dusk-700">{title}</h3>
      {children}
    </div>
  )
}

export default function ExpertDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: expert, isLoading } = useGetExpertQuery(id)
  const { data: theirServices = [] } = useGetSessionsByExpertQuery(id)
  const [verifyExpert, { isLoading: isVerifying }] = useVerifyExpertMutation()
  const [blockExpert, { isLoading: isBlocking }] = useBlockExpertMutation()
  const [deleteExpert, { isLoading: isDeleting }] = useDeleteExpertMutation()

  const [verifyModal, setVerifyModal] = useState(false)
  const [verifyAction, setVerifyAction] = useState(null) // { status, defaultReason }
  const [verifyReason, setVerifyReason] = useState('')
  const [deleteModal, setDeleteModal] = useState(false)
  const [blockModal, setBlockModal] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  if (isLoading || !expert) return <div className="flex justify-center py-20"><Spinner /></div>

  const openVerify = (status, defaultReason) => {
    setVerifyAction({ status, defaultReason })
    setVerifyReason(defaultReason || '')
    setVerifyModal(true)
  }

  const handleVerify = async () => {
    try {
      console.log(expert.id)
      console.log(verifyAction.status)
      console.log(verifyReason)
      await verifyExpert({
        id: expert.id,
        user_id: expert.id,
        status: verifyAction.status,
        reason: verifyReason.trim() || null,
      }).unwrap()
      setVerifyModal(false)
      setVerifyReason('')
    } catch (err) {
      console.error('Verify expert error:', err)
      alert(err?.data?.message || 'Failed to update verification status. Please try again.')
    }
  }

  const handleBlock = async () => {
    try {
      await blockExpert({ id: expert.id, user_id: expert.id, reason: blockReason }).unwrap()
      setBlockModal(false)
      setBlockReason('')
    } catch (err) {
      alert(err?.data?.message || 'Failed to block expert.')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteExpert([expert.id]).unwrap()
      navigate('/admin/experts')
    } catch (err) {
      alert(err?.data?.message || 'Failed to delete expert.')
    }
  }

  const verStat = (expert.verification_status || 'PENDING').toUpperCase()
  const canVerify = verStat !== 'VERIFIED'

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/admin/experts')} className="flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink transition-colors">
          <ArrowLeft size={15} /> Back to Experts
        </button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="!text-rose-700 hover:!bg-rose-50" onClick={() => setBlockModal(true)}>
            <Ban size={15} /> Block
          </Button>
          <Button variant="danger" onClick={() => setDeleteModal(true)}>
            <Trash2 size={15} /> Delete
          </Button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="overflow-hidden rounded-2xl border border-dusk-50 bg-white shadow-sm">
        {/* Cover */}
        <div className="relative h-48 w-full bg-gradient-to-br from-dusk-800 via-dusk-600 to-marigold-500 overflow-hidden">
          {expert.cover_image && (
            <img src={expert.cover_image} alt="Cover" className="h-full w-full object-cover opacity-90" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Badge tone={verificationTone(expert.verification_status)}>
              {verificationLabel(expert.verification_status)}
            </Badge>
            <Badge tone={expert.profile_completed ? 'approved' : 'pending'}>
              {expert.profile_completed ? 'Profile Complete' : 'Profile Incomplete'}
            </Badge>
          </div>
        </div>

        {/* Identity */}
        <div className="relative px-6 pb-6 pt-14">
          <div className="absolute -top-14 left-6">
            <img
              src={expert.avatar}
              alt={expert.name}
              className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-lg"
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=1e293b&color=fff&size=96` }}
            />
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">
                {expert.name}
                {expert.professional_title && (
                  <span className="ml-2 text-base font-medium text-ink-soft">({expert.professional_title})</span>
                )}
              </h1>
              <p className="mt-1 text-sm text-ink-soft">
                {[expert.profession, expert.email, expert.phone].filter(Boolean).join(' · ')}
              </p>
              {expert.specialization && (
                <p className="mt-1 text-xs font-semibold text-dusk-700">Specialized in: {expert.specialization}</p>
              )}
              {expert.languages?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {expert.languages.map((l) => <Badge key={l} tone="info">{l}</Badge>)}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 rounded-lg border border-dusk-100 bg-canvas px-3 py-1.5 text-xs text-ink-soft">
                <Star size={13} className="text-marigold-500 fill-marigold-500" />
                {expert.rating} rating
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-dusk-100 bg-canvas px-3 py-1.5 text-xs text-ink-soft">
                <CheckCircle2 size={13} className="text-sage-500" />
                {expert.totalSessions} sessions
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-dusk-100 bg-canvas px-3 py-1.5 text-xs text-ink-soft">
                <IndianRupee size={13} className="text-dusk-500" />
                {expert.consultation_fee ? `₹${expert.consultation_fee}` : 'Not set'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Action Bar */}
      {canVerify && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Verification Required</p>
              <p className="text-xs text-amber-700">
                Current status: <strong>{verificationLabel(expert.verification_status)}</strong>
                {expert.reviewNote && ` — "${expert.reviewNote}"`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="success" disabled={isVerifying} onClick={() => openVerify('VERIFIED', 'Application approved by admin.')}>
              <CheckCircle2 size={15} /> Approve & Verify
            </Button>
            <Button variant="ghost" disabled={isVerifying} onClick={() => openVerify('NEEDS_CHANGES', '')}>
              <RotateCcw size={15} /> Request Changes
            </Button>
            <Button variant="danger" disabled={isVerifying} onClick={() => openVerify('REJECTED', 'Application rejected by admin.')}>
              <XCircle size={15} /> Reject
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-dusk-100">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'professional', label: 'Professional' },
          { key: 'philosophy', label: 'Story & Philosophy' },
          { key: 'location', label: 'Location & Contact' },
          { key: 'documents', label: 'Documents' },
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Section title="Basic Information">
            <InfoRow icon={User} label="Full Name" value={expert.name} />
            <InfoRow icon={Mail} label="Email" value={expert.email} />
            <InfoRow icon={Phone} label="Phone" value={expert.phone} />
            <InfoRow icon={Phone} label="Alternate Phone" value={expert.alternate_phone} />
            <InfoRow icon={MessageCircle} label="WhatsApp" value={expert.whatsapp_number} />
            <InfoRow icon={Calendar} label="Member Since" value={formatDate(expert.created_at)} />
            <InfoRow icon={Calendar} label="Verified On" value={formatDate(expert.reviewedOn)} />
          </Section>
          <Section title="Verification Status">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-canvas p-3">
                <span className="text-sm text-ink-soft">Verification</span>
                <Badge tone={verificationTone(expert.verification_status)}>
                  {verificationLabel(expert.verification_status)}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-canvas p-3">
                <span className="text-sm text-ink-soft">Profile Completion</span>
                <Badge tone={expert.profile_completed ? 'approved' : 'pending'}>
                  {expert.profile_completed ? 'Completed' : 'Incomplete'}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-canvas p-3">
                <span className="text-sm text-ink-soft">Average Rating</span>
                <span className="flex items-center gap-1 text-sm font-semibold text-ink">
                  <Star size={13} className="text-marigold-500 fill-marigold-500" />
                  {expert.rating}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-canvas p-3">
                <span className="text-sm text-ink-soft">Total Sessions</span>
                <span className="text-sm font-semibold text-ink">{expert.total_sessions}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-canvas p-3">
                <span className="text-sm text-ink-soft">Total Reviews</span>
                <span className="text-sm font-semibold text-ink">{expert.total_reviews}</span>
              </div>
            </div>
            {expert.reviewNote && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-semibold text-amber-700 mb-1">Review Note</p>
                <p className="text-xs text-amber-800">{expert.reviewNote}</p>
              </div>
            )}
          </Section>

          {expert.bio && (
            <div className="md:col-span-2">
              <Section title="Bio">
                <p className="text-sm leading-relaxed text-ink italic">&quot;{expert.bio}&quot;</p>
              </Section>
            </div>
          )}

          {theirServices.length > 0 && (
            <div className="md:col-span-2">
              <Section title="Services by this Expert">
                <div className="space-y-2">
                  {theirServices.map((s) => (
                    <Link to={`/admin/sessions/${s.id}`} key={s.id} className="flex items-center justify-between rounded-lg p-2.5 hover:bg-canvas-alt/60 border border-transparent hover:border-dusk-50 transition-all">
                      <span className="text-sm font-medium text-ink">{s.title}</span>
                    </Link>
                  ))}
                </div>
              </Section>
            </div>
          )}
        </div>
      )}

      {activeTab === 'professional' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Section title="Professional Details">
            <InfoRow icon={Briefcase} label="Professional Title" value={expert.professional_title} />
            <InfoRow icon={Briefcase} label="Profession" value={expert.profession} />
            <InfoRow icon={Award} label="Specialization" value={expert.specialization} />
            <InfoRow icon={Clock} label="Experience" value={expert.experience} />
            <InfoRow icon={DollarSign} label="Consultation Fee" value={expert.consultation_fee ? `₹${expert.consultation_fee}` : null} />
            <InfoRow icon={BookOpen} label="Education" value={expert.education} />
          </Section>
          <Section title="Languages & Skills">
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft mb-2">Languages</p>
              {expert.languages?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {expert.languages.map((l) => <Badge key={l} tone="info">{l}</Badge>)}
                </div>
              ) : (
                <p className="text-sm text-ink-soft">—</p>
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft mb-2">Certification Documents</p>
              {expert.certificates?.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {expert.certificates.map((c, idx) => (
                    <a key={c} href={c} target="_blank" rel="noopener noreferrer"
                      className="group relative flex flex-col overflow-hidden rounded-xl border border-dusk-100 bg-canvas shadow-sm hover:shadow-md transition-all">
                      <div className="relative aspect-video overflow-hidden bg-dusk-50">
                        <img src={c} alt={`Document ${idx + 1}`} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-ink">View</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 p-2 bg-canvas-alt border-t border-dusk-50">
                        <FileText size={12} className="text-ink-soft shrink-0" />
                        <span className="text-[11px] font-medium text-ink-soft truncate">Document {idx + 1}</span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-soft">No certification documents uploaded.</p>
              )}
            </div>
          </Section>
        </div>
      )}

      {activeTab === 'philosophy' && (
        <div className="space-y-5">
          {expert.about && (
            <Section title="About Me">
              <p className="text-sm leading-relaxed text-ink whitespace-pre-line">{expert.about}</p>
            </Section>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {expert.why_started && (
              <Section title="Why I Started">
                <p className="text-sm leading-relaxed text-ink whitespace-pre-line">{expert.why_started}</p>
              </Section>
            )}
            {expert.mission && (
              <Section title="Mission">
                <p className="text-sm leading-relaxed text-ink whitespace-pre-line">{expert.mission}</p>
              </Section>
            )}
            {expert.client_approach && (
              <Section title="Client Approach">
                <p className="text-sm leading-relaxed text-ink whitespace-pre-line">{expert.client_approach}</p>
              </Section>
            )}
            {expert.uniqueness && (
              <Section title="What Makes Me Unique">
                <p className="text-sm leading-relaxed text-ink whitespace-pre-line">{expert.uniqueness}</p>
              </Section>
            )}
          </div>
          {!expert.about && !expert.why_started && !expert.mission && !expert.client_approach && !expert.uniqueness && (
            <Section title="Story & Philosophy">
              <p className="text-sm text-ink-soft text-center py-4">No philosophy or story information provided yet.</p>
            </Section>
          )}
        </div>
      )}

      {activeTab === 'location' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Section title="Location">
            <InfoRow icon={MapPin} label="City" value={expert.city} />
            <InfoRow icon={MapPin} label="State" value={expert.state} />
            <InfoRow icon={Globe} label="Country" value={expert.country} />
            <InfoRow icon={Clock} label="Timezone" value={expert.timezone} />
          </Section>
          <Section title="Contact Details">
            <InfoRow icon={Mail} label="Email" value={expert.email} />
            <InfoRow icon={Phone} label="Primary Phone" value={expert.phone} />
            <InfoRow icon={Phone} label="Alternate Phone" value={expert.alternate_phone} />
            <InfoRow icon={MessageCircle} label="WhatsApp" value={expert.whatsapp_number} />
          </Section>
        </div>
      )}

      {activeTab === 'documents' && (
        <Section title="Certification Documents">
          {expert.certificates?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {expert.certificates.map((c, idx) => (
                <div key={c} className="group relative flex flex-col overflow-hidden rounded-xl border border-dusk-100 bg-canvas shadow-sm transition-all hover:shadow-md">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-dusk-50">
                    <img src={c} alt={`Document ${idx + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <a href={c} target="_blank" rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-ink shadow-sm hover:bg-white transition-colors">
                        View Full Image
                      </span>
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5 p-2.5 bg-canvas-alt border-t border-dusk-50">
                    <FileText size={13} className="text-ink-soft shrink-0" />
                    <span className="text-[11px] font-medium text-ink-soft truncate">Document {idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 text-ink-soft">
              <FileText size={32} className="mb-3 opacity-30" />
              <p className="text-sm">No documents or certificates uploaded.</p>
            </div>
          )}
        </Section>
      )}

      {/* Verify Modal */}
      <Modal
        open={verifyModal}
        onClose={() => setVerifyModal(false)}
        title={
          verifyAction?.status === 'VERIFIED' ? 'Approve & Verify Expert' :
          verifyAction?.status === 'REJECTED' ? 'Reject Expert Application' :
          'Request Changes from Expert'
        }
      >
        <div className="space-y-4">
          <div className={`rounded-xl border p-3 text-sm ${
            verifyAction?.status === 'VERIFIED' ? 'border-sage-200 bg-sage-50 text-sage-800' :
            verifyAction?.status === 'REJECTED' ? 'border-rose-200 bg-rose-50 text-rose-800' :
            'border-amber-200 bg-amber-50 text-amber-800'
          }`}>
            <p className="font-semibold mb-0.5">
              {verifyAction?.status === 'VERIFIED' ? '✓ Approving' :
               verifyAction?.status === 'REJECTED' ? '✕ Rejecting' :
               '↺ Requesting changes for'} {expert.name}
            </p>
            <p className="text-xs opacity-80">
              This will update the expert's verification status to <strong>{verifyAction?.status}</strong> and notify them.
            </p>
          </div>
          <Field label={verifyAction?.status === 'NEEDS_CHANGES' ? 'What needs to change? (required)' : 'Reason / Note'}>
            <textarea
              rows={4}
              required={verifyAction?.status === 'NEEDS_CHANGES'}
              className={inputCls}
              value={verifyReason}
              onChange={(e) => setVerifyReason(e.target.value)}
              placeholder={
                verifyAction?.status === 'VERIFIED' ? 'e.g. All documents verified. Profile looks complete.' :
                verifyAction?.status === 'REJECTED' ? 'e.g. Documents are invalid or incomplete.' :
                'e.g. Please upload a clear photo of your certification documents.'
              }
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setVerifyModal(false)}>Cancel</Button>
            <Button
              variant={verifyAction?.status === 'VERIFIED' ? 'success' : verifyAction?.status === 'REJECTED' ? 'danger' : 'primary'}
              disabled={isVerifying || (verifyAction?.status === 'NEEDS_CHANGES' && !verifyReason.trim())}
              onClick={handleVerify}
            >
              {isVerifying ? <Spinner className="border-t-white border-white/30" /> : 'Confirm'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Block Modal */}
      <Modal open={blockModal} onClose={() => setBlockModal(false)} title="Block Expert Account">
        <Field label="Reason for blocking">
          <textarea rows={3} className={inputCls} value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="e.g. Violation of terms of service..." />
        </Field>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={() => setBlockModal(false)}>Cancel</Button>
          <Button variant="danger" disabled={isBlocking} onClick={handleBlock}>
            {isBlocking ? 'Blocking...' : 'Confirm Block'}
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Expert">
        <p className="text-sm text-ink-soft">Are you sure you want to permanently delete <strong>{expert.name}</strong>? This action cannot be undone.</p>
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
