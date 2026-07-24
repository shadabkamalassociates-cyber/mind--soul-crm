import { useEffect, useState } from 'react'
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../services/settingsService'
import { PageHeader, Field, inputCls, Button } from '../../components/Common'

export default function Settings() {
  const { data: settings } = useGetSettingsQuery()
  const [updateSettings, { isLoading }] = useUpdateSettingsMutation()
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => { if (settings && !form) setForm(settings) }, [settings, form])

  if (!form) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    await updateSettings({ ...form, commissionPercent: Number(form.commissionPercent) })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-xl">
      <PageHeader title="Settings" subtitle="Platform-wide configuration for commission and support." />
      <form onSubmit={handleSubmit} className="rounded-2xl border border-dusk-50 bg-white p-6 shadow-sm">
        <Field label="Platform commission (%)" hint="Applied to every completed booking before expert payout.">
          <input type="number" min="0" max="100" className={inputCls} value={form.commissionPercent} onChange={(e) => setForm({ ...form, commissionPercent: e.target.value })} />
        </Field>
        <Field label="Support email">
          <input type="email" className={inputCls} value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} />
        </Field>
        <Field label="Support phone">
          <input className={inputCls} value={form.supportPhone} onChange={(e) => setForm({ ...form, supportPhone: e.target.value })} />
        </Field>
        <div className="mt-2 flex items-center gap-3">
          <Button type="submit" disabled={isLoading}>Save settings</Button>
          {saved && <span className="text-sm text-sage-700">Saved ✓</span>}
        </div>
      </form>

      <div className="mt-4 rounded-2xl border border-dusk-50 bg-white p-6 shadow-sm">
        <h3 className="font-display text-base font-semibold text-ink">Commission example</h3>
        <p className="mt-2 text-sm text-ink-soft">
          On a ₹1,000 session, the platform keeps ₹{form.commissionPercent * 10} and the expert receives ₹{1000 - form.commissionPercent * 10}.
        </p>
      </div>
    </div>
  )
}
