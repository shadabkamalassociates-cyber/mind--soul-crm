import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ShieldCheck, FileText, Save } from 'lucide-react'
import { useGetExpertQuery, useUpdateExpertMutation } from '../../services/expertService'
import { PageHeader, Field, inputCls, Button, Spinner } from '../../components/Common'
import Badge from '../../components/Badge'
import StatusStepper from '../../components/StatusStepper'
import { meta, formatDate } from '../../utils/status'

const steps = [
  { key: 'pending', label: 'Applied' },
  { key: 'needs_changes', label: 'In Review' },
  { key: 'approved', label: 'Approved' },
]

export default function Profile() {
  const user = useSelector((s) => s.auth.user)
  const { data: expert, isLoading } = useGetExpertQuery(user.id)
  const [updateExpert, { isLoading: saving }] = useUpdateExpertMutation()
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => { if (expert && !form) setForm(expert) }, [expert, form])

  if (isLoading || !form) return <div className="flex justify-center py-20"><Spinner /></div>

  const stepperStatus = form.status === 'approved' ? 'approved' : form.status === 'needs_changes' ? 'needs_changes' : 'pending'

  const handleSubmit = async (e) => {
    e.preventDefault()
    await updateExpert({ id: form.id, bio: form.bio, experience: form.experience, mobile: form.mobile })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="My Profile" subtitle="This is what admin reviews and what users see on your public profile." />

      <div className="rounded-2xl border border-dusk-50 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={form.avatar} alt="" className="h-16 w-16 rounded-2xl object-cover" />
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">{form.name}</h2>
              <p className="text-sm text-ink-soft">{form.email}</p>
            </div>
          </div>
          <Badge tone={meta(form.status).tone}>{meta(form.status).label}</Badge>
        </div>

        <div className="mt-6">
          <StatusStepper steps={steps} currentStatus={stepperStatus} rejected={form.status === 'rejected'} reviewNote={form.reviewNote} />
        </div>

        <form onSubmit={handleSubmit} className="mt-6 border-t border-dusk-50 pt-6">
          <Field label="Bio">
            <textarea rows={3} className={inputCls} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Experience"><input className={inputCls} value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} /></Field>
            <Field label="Mobile"><input className={inputCls} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></Field>
          </div>
          <Field label="Languages"><input disabled className={`${inputCls} opacity-70`} value={form.languages.join(', ')} /></Field>
          <Field label="Skills"><input disabled className={`${inputCls} opacity-70`} value={form.skillTags.join(', ')} /></Field>

          <div className="mb-4">
            <span className="mb-1.5 block text-sm font-medium text-ink">Documents on file</span>
            <div className="flex flex-wrap gap-2">
              {form.certificates.map((c) => (
                <span key={c} className="flex items-center gap-1.5 rounded-lg border border-dusk-100 bg-canvas px-3 py-1.5 text-xs text-ink-soft"><FileText size={13} /> {c}</span>
              ))}
              {form.govId && <span className="flex items-center gap-1.5 rounded-lg border border-dusk-100 bg-canvas px-3 py-1.5 text-xs text-ink-soft"><ShieldCheck size={13} /> {form.govId}</span>}
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2 text-sm">
            Bank details: {form.bankVerified ? <Badge tone="approved">Verified</Badge> : <Badge tone="pending">Unverified — upload proof</Badge>}
          </div>

          <p className="mb-4 text-xs text-ink-soft">Applied on {formatDate(form.appliedOn)} · Last reviewed {formatDate(form.reviewedOn)}</p>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}><Save size={15} /> Save changes</Button>
            {saved && <span className="text-sm text-sage-700">Saved ✓</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
