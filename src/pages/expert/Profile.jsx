import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ShieldCheck, FileText, Save, Camera } from 'lucide-react'
import { useGetExpertQuery, useUpdateExpertMutation } from '../../services/expertService'
import { PageHeader, Field, inputCls, Button, Spinner } from '../../components/Common'
import Badge from '../../components/Badge'
import StatusStepper from '../../components/StatusStepper'
import { meta } from '../../utils/status'

export default function Profile() {
  const user = useSelector((s) => s.auth.user)
  const { data: expert, isLoading } = useGetExpertQuery(user.id)
  const [updateExpert, { isLoading: saving }] = useUpdateExpertMutation()
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  useEffect(() => {
    if (expert && !form) {
      setForm({
        ...expert,
        languagesArray: Array.isArray(expert.languages) ? expert.languages.join(', ') : (expert.languagesArray || ''),
        certificationsValue: expert.certificationsValue || '',
        profile_image_file: null,
        cover_image_file: null,
      })
    }
  }, [expert, form])

  if (isLoading || !form) return <div className="flex justify-center py-20"><Spinner /></div>

  const stepperStatus = form.status === 'approved' ? 'approved' : form.status === 'needs_changes' ? 'needs_changes' : 'pending'

  const handleSubmit = async (e) => {
    e.preventDefault()

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

    console.log(payload,"6555555555555555")

    await updateExpert({
      id: form.id,
      ...payload,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleImageChange = (e, field) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm((prev) => ({ 
          ...prev, 
          [field]: reader.result,
          [`${field}_file`]: file 
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="My Profile" subtitle="This is what admin reviews and what users see on your public profile." />

      {/* Header Cover Card */}
      <div className="overflow-hidden rounded-2xl border border-dusk-50 bg-white shadow-sm mb-6">
        <div className="relative h-40 w-full bg-gradient-to-r from-dusk-700 via-dusk-500 to-marigold-500 group">
          {form.cover_image && (
            <img src={form.cover_image} alt="Cover" className="h-full w-full object-cover" />
          )}
          {/* Cover Edit Button overlay */}
          <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
            <span className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-dusk-900 shadow-sm hover:bg-white transition-colors">
              <Camera size={14} /> Change Cover Image
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'cover_image')} />
          </label>
          <div className="absolute right-4 bottom-4 z-20">
            <Badge tone={meta(form.status).tone}>{meta(form.status).label}</Badge>
          </div>
        </div>
        <div className="relative px-6 pb-6 pt-12">
          <div className="absolute -top-12 left-6 group/avatar">
            <div className="relative h-20 w-20 rounded-2xl border-4 border-white shadow-sm overflow-hidden bg-white">
              <img src={form.profile_image || form.avatar} alt="" className="h-full w-full object-cover" />
              {/* Avatar Edit Button overlay */}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                <Camera size={16} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'profile_image')} />
              </label>
            </div>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-ink">{form.name}</h2>
            <p className="text-sm text-ink-soft">{form.email} · {form.mobile}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-dusk-50 bg-white p-6 shadow-sm">

        {/* Profile Tabs */}
        <div className="mb-6 flex flex-wrap border-b border-dusk-100">
          {[
            { key: 'basic', label: 'Basic Info' },
            { key: 'professional', label: 'Professional Details' },
            { key: 'languages', label: 'Skills & Languages' },
            { key: 'philosophy', label: 'Story & Philosophy' },
            { key: 'location', label: 'Location & Settings' },
            { key: 'media', label: 'Images & Documents' },
          ].map((t) => (
            <button
              type="button"
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`border-b-2 px-3.5 py-2 text-sm font-semibold transition-colors ${
                activeTab === t.key
                  ? 'border-dusk-700 text-dusk-700 bg-dusk-50/30'
                  : 'border-transparent text-ink-soft hover:text-ink hover:bg-canvas-alt/30'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'basic' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name">
                  <input required className={inputCls} value={form.first_name || ''} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                </Field>
                <Field label="Last Name">
                  <input className={inputCls} value={form.last_name || ''} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email">
                  <input type="email" required className={inputCls} value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </Field>
                <Field label="Phone/Mobile">
                  <input required className={inputCls} value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Alternate Phone">
                  <input className={inputCls} value={form.alternate_phone || ''} onChange={(e) => setForm({ ...form, alternate_phone: e.target.value })} />
                </Field>
                <Field label="WhatsApp Number">
                  <input className={inputCls} value={form.whatsapp_number || ''} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} />
                </Field>
              </div>
            </div>
          )}

          {activeTab === 'professional' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Professional Title">
                  <input className={inputCls} value={form.professional_title || ''} onChange={(e) => setForm({ ...form, professional_title: e.target.value })} placeholder="e.g. Master Yogi" />
                </Field>
                <Field label="Profession">
                  <input className={inputCls} value={form.profession || ''} onChange={(e) => setForm({ ...form, profession: e.target.value })} placeholder="e.g. Yoga Teacher" />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Experience (Years)">
                  <input type="number" className={inputCls} value={form.experience_years || ''} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} placeholder="e.g. 5" />
                </Field>
                <Field label="Consultation Fee (₹)">
                  <input type="number" className={inputCls} value={form.consultation_fee || ''} onChange={(e) => setForm({ ...form, consultation_fee: e.target.value })} placeholder="e.g. 500" />
                </Field>
                <Field label="Specialization">
                  <input className={inputCls} value={form.specialization || ''} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Vinyasa Yoga" />
                </Field>
              </div>
              <Field label="Education">
                <input className={inputCls} value={form.education || ''} onChange={(e) => setForm({ ...form, education: e.target.value })} placeholder="e.g. B.Sc in Yogic Sciences" />
              </Field>
            </div>
          )}

          {activeTab === 'languages' && (
            <div className="space-y-3">
              <Field label="Languages (comma separated)" hint="Languages you can consult in.">
                <input className={inputCls} value={form.languagesArray || ''} onChange={(e) => setForm({ ...form, languagesArray: e.target.value })} placeholder="e.g. English, Hindi, Spanish" />
              </Field>
              {/* <Field label="Certifications (comma separated)" hint="Certificates and awards you possess.">
                <textarea rows={3} className={inputCls} value={form.certificationsValue || ''} onChange={(e) => setForm({ ...form, certificationsValue: e.target.value })} placeholder="e.g. Yoga Alliance RYT-200, Reiki Level II" />
              </Field> */}
              {form.certificates && form.certificates.length > 0 && (
                <div className="mt-4 border-t border-dusk-50 pt-3">
                  <span className="mb-2 block text-xs font-semibold text-ink font-sans">Uploaded Certificate & Education Photos</span>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {form.certificates.map((c, idx) => (
                      <div key={c} className="group relative flex flex-col overflow-hidden rounded-xl border border-dusk-100 bg-canvas shadow-sm transition-all hover:shadow-md">
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-dusk-50">
                          <img 
                            src={c} 
                            alt={`Document ${idx + 1}`} 
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                          />
                          <a 
                            href={c} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-ink shadow-sm hover:bg-white transition-colors">
                              View Full Image
                            </span>
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 p-2 bg-canvas-alt border-t border-dusk-50">
                          <FileText size={13} className="text-ink-soft shrink-0" />
                          <span className="text-[11px] font-medium text-ink-soft truncate">Document {idx + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'philosophy' && (
            <div className="space-y-3">
              <Field label="Bio (Short Summary)">
                <textarea rows={2} className={inputCls} value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Brief summary for listings..." />
              </Field>
              <Field label="About Me (Full Story)">
                <textarea rows={4} className={inputCls} value={form.about || ''} onChange={(e) => setForm({ ...form, about: e.target.value })} placeholder="Your biography..." />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Why Started">
                  <textarea rows={3} className={inputCls} value={form.why_started || ''} onChange={(e) => setForm({ ...form, why_started: e.target.value })} placeholder="What inspired your journey..." />
                </Field>
                <Field label="Mission">
                  <textarea rows={3} className={inputCls} value={form.mission || ''} onChange={(e) => setForm({ ...form, mission: e.target.value })} placeholder="Your professional mission..." />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Client Approach">
                  <textarea rows={3} className={inputCls} value={form.client_approach || ''} onChange={(e) => setForm({ ...form, client_approach: e.target.value })} placeholder="How you help your clients..." />
                </Field>
                <Field label="Uniqueness">
                  <textarea rows={3} className={inputCls} value={form.uniqueness || ''} onChange={(e) => setForm({ ...form, uniqueness: e.target.value })} placeholder="What makes you stand out..." />
                </Field>
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Country">
                  <input className={inputCls} value={form.country || ''} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="e.g. India" />
                </Field>
                <Field label="Timezone">
                  <input className={inputCls} value={form.timezone || ''} onChange={(e) => setForm({ ...form, timezone: e.target.value })} placeholder="e.g. Asia/Kolkata" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="City">
                  <input className={inputCls} value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Mumbai" />
                </Field>
                <Field label="State">
                  <input className={inputCls} value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="e.g. Maharashtra" />
                </Field>
              </div>
              <label className="flex items-center gap-2.5 pt-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-dusk-300 text-dusk-700 focus:ring-dusk-500"
                  checked={!!form.profile_completed}
                  onChange={(e) => setForm({ ...form, profile_completed: e.target.checked })}
                />
                <span className="text-sm font-medium text-ink">My Profile is Completed</span>
              </label>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-4">
              <div>
                <span className="mb-1.5 block text-sm font-medium text-ink font-sans">Profile Avatar</span>
                {form.profile_image && (
                  <img src={form.profile_image} alt="Profile Preview" className="mb-2 h-20 w-20 rounded-2xl object-cover border border-dusk-100" />
                )}
                <input type="file" accept="image/*" className={inputCls} onChange={(e) => handleImageChange(e, 'profile_image')} />
              </div>
              <div className="border-t border-dusk-50 pt-3">
                <span className="mb-1.5 block text-sm font-medium text-ink font-sans">Cover Image</span>
                {form.cover_image && (
                  <img src={form.cover_image} alt="Cover Preview" className="mb-2 h-24 w-full rounded-xl object-cover border border-dusk-100" />
                )}
                <input type="file" accept="image/*" className={inputCls} onChange={(e) => handleImageChange(e, 'cover_image')} />
              </div>
              <div className="border-t border-dusk-50 pt-3">
                <span className="mb-1.5 block text-sm font-medium text-ink font-sans">Documents & Certificates</span>
                {form.certificates && form.certificates.length > 0 ? (
                  <div className="mt-2.5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {form.certificates.map((c, idx) => (
                      <div key={c} className="group relative flex flex-col overflow-hidden rounded-xl border border-dusk-100 bg-canvas shadow-sm transition-all hover:shadow-md">
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-dusk-50">
                          <img 
                            src={c} 
                            alt={`Document ${idx + 1}`} 
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                          />
                          <a 
                            href={c} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-ink shadow-sm hover:bg-white transition-colors">
                              View Full Image
                            </span>
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 p-2 bg-canvas-alt border-t border-dusk-50">
                          <FileText size={13} className="text-ink-soft shrink-0" />
                          <span className="text-[11px] font-medium text-ink-soft truncate">Document {idx + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ink-soft mt-1">No documents on file.</p>
                )}
                
                {form.govId && (
                  <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-dusk-100 bg-canvas px-3 py-1.5 text-xs text-ink-soft w-fit">
                    <ShieldCheck size={13} className="text-sage-600" />
                    Government ID: <span className="font-semibold text-ink">{form.govId}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-dusk-50 pt-3">
                <div className="flex items-center gap-2 text-sm">
                  Bank details: {form.bankVerified ? <Badge tone="approved">Verified ✓</Badge> : <Badge tone="pending">Unverified — upload proof</Badge>}
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-dusk-50 pt-4 flex items-center gap-3">
            <Button type="submit" disabled={saving}><Save size={15} /> Save changes</Button>
            {saved && <span className="text-sm text-sage-700 font-semibold">Saved successfully ✓</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
