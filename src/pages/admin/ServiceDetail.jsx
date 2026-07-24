import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, IndianRupee, Clock, Users2, Video, CheckCircle2, XCircle, ExternalLink, Film } from 'lucide-react'
import { useGetServiceQuery, useUpdateServiceStatusMutation, useUpdateServiceVideoStatusMutation } from '../../services/serviceService'
import { useGetExpertQuery } from '../../services/expertService'
import { Button, Field, inputCls, Spinner } from '../../components/Common'
import Badge from '../../components/Badge'
import Modal from '../../components/Modal'
import StatusStepper from '../../components/StatusStepper'
import { meta, currency, formatDateTime } from '../../utils/status'

const steps = [
  { key: 'draft', label: 'Draft' },
  { key: 'pending_review', label: 'Submitted' },
  { key: 'approved', label: 'Approved' },
  { key: 'live', label: 'Live' },
]

export default function ServiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: service, isLoading } = useGetServiceQuery(id)
  const { data: expert } = useGetExpertQuery(service?.expertId, { skip: !service })
  const [updateStatus, { isLoading: updating }] = useUpdateServiceStatusMutation()
  const [updateVideoStatus, { isLoading: updatingVideo }] = useUpdateServiceVideoStatusMutation()
  const [rejectModal, setRejectModal] = useState(false)
  const [videoRejectModal, setVideoRejectModal] = useState(false)
  const [note, setNote] = useState('')
  const [videoNote, setVideoNote] = useState('')

  if (isLoading || !service) return <div className="flex justify-center py-20"><Spinner /></div>

  const act = async (status, reviewNote) => {
    await updateStatus({ id: service.id, status, reviewNote })
    if (status === 'rejected') setRejectModal(false)
  }

  const actVideo = async (videoStatus, videoReviewNote) => {
    await updateVideoStatus({ id: service.id, videoStatus, videoReviewNote })
    if (videoStatus === 'rejected') setVideoRejectModal(false)
  }

  const hasVideo = !!service.videoUrl
  const videoBlocksLive = hasVideo && service.videoStatus !== 'approved'

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => navigate('/admin/services')} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeft size={15} /> Back to services
      </button>

      <div className="rounded-2xl border border-dusk-50 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">{service.title}</h1>
            {expert && <p className="mt-1 text-sm text-ink-soft">by {expert.name} · {expert.email}</p>}
          </div>
          <Badge tone={meta(service.status).tone}>{meta(service.status).label}</Badge>
        </div>

        <div className="mt-6">
          <StatusStepper steps={steps} currentStatus={service.status === 'pending_review' ? 'pending_review' : service.status} rejected={service.status === 'rejected'} reviewNote={service.reviewNote} />
        </div>

        <p className="mt-6 text-sm leading-relaxed text-ink">{service.description}</p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-2 rounded-xl bg-canvas-alt/60 p-3">
            <IndianRupee size={16} className="text-dusk-500" />
            <div><p className="text-xs text-ink-soft">Price</p><p className="text-sm font-semibold text-ink">{currency(service.price)}</p></div>
          </div>
          {service.duration && (
            <div className="flex items-center gap-2 rounded-xl bg-canvas-alt/60 p-3">
              <Clock size={16} className="text-dusk-500" />
              <div><p className="text-xs text-ink-soft">Duration</p><p className="text-sm font-semibold text-ink">{service.duration} min</p></div>
            </div>
          )}
          {service.maxSeats && (
            <div className="flex items-center gap-2 rounded-xl bg-canvas-alt/60 p-3">
              <Users2 size={16} className="text-dusk-500" />
              <div><p className="text-xs text-ink-soft">Max seats</p><p className="text-sm font-semibold text-ink">{service.maxSeats}</p></div>
            </div>
          )}
          {service.scheduledAt && (
            <div className="flex items-center gap-2 rounded-xl bg-canvas-alt/60 p-3">
              <Video size={16} className="text-dusk-500" />
              <div><p className="text-xs text-ink-soft">Scheduled</p><p className="text-sm font-semibold text-ink">{formatDateTime(service.scheduledAt)}</p></div>
            </div>
          )}
        </div>

        {hasVideo && (
          <div className="mt-6 border-t border-dusk-50 pt-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink"><Film size={15} /> Recorded video</h3>
              <Badge tone={meta(service.videoStatus).tone}>{meta(service.videoStatus).label}</Badge>
            </div>
            <video src={service.videoUrl} controls className="w-full max-h-72 rounded-lg bg-black" />
            {service.videoReviewNote && (
              <p className="mt-2 rounded-lg bg-rose-100 px-3 py-2 text-xs text-rose-700"><span className="font-semibold">Your note: </span>{service.videoReviewNote}</p>
            )}
            {service.videoStatus === 'pending_review' && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="success" className="!px-2.5 !py-1.5 text-xs" disabled={updatingVideo} onClick={() => actVideo('approved')}><CheckCircle2 size={14} /> Approve Video</Button>
                <Button variant="ghost" className="!px-2.5 !py-1.5 text-xs" disabled={updatingVideo} onClick={() => setVideoRejectModal(true)}>Reject Video</Button>
              </div>
            )}
            {videoBlocksLive && service.videoStatus !== 'pending_review' && (
              <p className="mt-2 text-xs text-ink-soft">The recorded video must be approved before this service can go live.</p>
            )}
          </div>
        )}

        {service.hasLiveComponent && service.meetLink && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-sage-100 bg-sage-100/40 px-4 py-3">
            <span className="text-sm text-sage-700">Google Meet link attached</span>
            <a href={service.meetLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-medium text-sage-700 hover:underline">
              {service.meetLink} <ExternalLink size={13} />
            </a>
          </div>
        )}

        {service.status === 'pending_review' && (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-dusk-50 pt-5">
            <Button variant="success" disabled={updating} onClick={() => act('approved')}><CheckCircle2 size={16} /> Approve</Button>
            <Button variant="ghost" disabled={updating} onClick={() => setRejectModal(true)}>Request Changes / Reject</Button>
          </div>
        )}
        {service.status === 'approved' && (
          <div className="mt-6 border-t border-dusk-50 pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="accent" disabled={updating || videoBlocksLive} onClick={() => act('live')}><Video size={16} /> Publish as Live</Button>
              {videoBlocksLive && <span className="text-xs text-marigold-700">Waiting on video approval above</span>}
            </div>
          </div>
        )}
      </div>

      <Modal open={rejectModal} onClose={() => setRejectModal(false)} title="Send feedback to expert">
        <Field label="What needs to change?">
          <textarea rows={4} className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Thumbnail resolution is too low." />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setRejectModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => act('rejected', note)} disabled={!note.trim()}><XCircle size={16} /> Reject with note</Button>
        </div>
      </Modal>

      <Modal open={videoRejectModal} onClose={() => setVideoRejectModal(false)} title="Reject recorded video">
        <Field label="What needs to change?">
          <textarea rows={4} className={inputCls} value={videoNote} onChange={(e) => setVideoNote(e.target.value)} placeholder="e.g. Audio is inaudible in the first two minutes." />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setVideoRejectModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => actVideo('rejected', videoNote)} disabled={!videoNote.trim()}><XCircle size={16} /> Reject video</Button>
        </div>
      </Modal>
    </div>
  )
}
