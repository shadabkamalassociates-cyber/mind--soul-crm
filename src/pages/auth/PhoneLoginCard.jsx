import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useLoginMutation, useAdminLoginMutation } from '../../services/authService'
import { useExpertLoginMutation } from '../../services/expertService'
import { setCredentials } from '../../features/auth/authSlice'
import { Button, Field, inputCls, Spinner } from '../../components/Common'

export default function PhoneLoginCard({
  role, roleLabel, icon: Icon, accentClass, quote, quoteBy, defaultPhone, redirectTo, otherPortal, signupLink,
}) {
  const [phone, setPhone] = useState(defaultPhone)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [login, { isLoading: isLoginLoading }] = useLoginMutation()
  const [adminLogin, { isLoading: isAdminLoading }] = useAdminLoginMutation()
  const [expertLogin, { isLoading: isExpertLoading }] = useExpertLoginMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const isLoading = role === 'admin' ? isAdminLoading : (role === 'expert' ? isExpertLoading : isLoginLoading)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const cleanPhone = phone.trim()
    let cleanPhoneVal = cleanPhone
    if (role === 'expert') {
      cleanPhoneVal = cleanPhone.replace(/[^\d]/g, '')
      if (cleanPhoneVal.length > 10 && cleanPhoneVal.startsWith('91')) {
        cleanPhoneVal = cleanPhoneVal.slice(-10)
      }
    }

    const loginFn = role === 'admin' ? adminLogin : (role === 'expert' ? expertLogin : login)
    const { data, error: err } = await loginFn({ phone: cleanPhoneVal, password })

    if (err) {
      const errorMsg = typeof err.data === 'string' ? err.data : (err.data?.message || 'Login failed. Please check your credentials.')
      setError(errorMsg)
      return
    }

    if (data) {
      if (data.success === false) {
        setError(data.message || 'Login failed.')
        return
      }

      const rawUser = data.data || data.user || {}
      const token = data.token || null

      const userObj = {
        ...rawUser,
        id: rawUser.id || 'admin-id',
        name: rawUser.first_name ? `${rawUser.first_name} ${rawUser.last_name || ''}`.trim() : (rawUser.name || 'Admin'),
        email: rawUser.email,
        phone: rawUser.phone || rawUser.mobile || cleanPhone,
        mobile: rawUser.phone || rawUser.mobile || cleanPhone,
        role: (rawUser.role || role).toLowerCase(),
        avatar: rawUser.profile_image || rawUser.avatar || null,
      }

      dispatch(setCredentials({ user: userObj, token }))
      navigate(redirectTo)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-dusk-900 px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
        <div className={`relative hidden flex-col justify-between p-9 text-white md:flex ${accentClass}`}>
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
          <div className="relative flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-marigold-300">
              <Icon size={18} />
            </div>
            <span className="font-display text-lg font-semibold">SoulSensei</span>
          </div>
          <div className="relative">
            <p className="font-display text-2xl font-medium leading-snug">"{quote}"</p>
            <p className="mt-3 text-sm text-dusk-100">{quoteBy}</p>
          </div>
          <p className="relative text-xs text-dusk-100">Internal CRM · {roleLabel} access</p>
        </div>

        <div className="p-8 sm:p-10">
          <Link to="/login" className="mb-5 inline-block text-xs font-medium text-ink-soft hover:text-ink">← Back to portal selection</Link>
          <h1 className="font-display text-2xl font-semibold text-ink">{roleLabel} Login</h1>
          <p className="mt-1 text-sm text-ink-soft">Sign in with your registered phone number.</p>

          <form onSubmit={handleSubmit} className="mt-6">
            <Field label="Phone number">
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="9310874210" />
            </Field>
            <Field label="Password" hint={role === 'admin' ? 'Enter admin password.' : 'Demo mode — any password works.'}>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" />
            </Field>
            {error && <p className="mb-4 -mt-2 text-sm text-rose-700">{error}</p>}
            <Button type="submit" disabled={isLoading} className="mt-2 w-full">
              {isLoading ? <Spinner className="border-t-white border-white/30" /> : `Sign in to ${roleLabel} CRM`}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-ink-soft">
            {otherPortal.label}{' '}
            <Link to={otherPortal.to} className="font-medium text-dusk-700 hover:underline">{otherPortal.linkText}</Link>
          </p>
          {signupLink && (
            <p className="mt-2 text-center text-xs text-ink-soft">
              {signupLink.label}{' '}
              <Link to={signupLink.to} className="font-medium text-dusk-700 hover:underline">{signupLink.linkText}</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
