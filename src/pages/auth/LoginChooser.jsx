import { Link } from 'react-router-dom'
import { Sparkles, ShieldCheck, UserRound, ArrowRight } from 'lucide-react'

export default function LoginChooser() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dusk-900 px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-marigold-300">
            <Sparkles size={22} />
          </div>
          <h1 className="mt-3 font-display text-2xl font-semibold text-white">SoulSensei CRM</h1>
          <p className="mt-1 text-sm text-dusk-100">Choose your workspace to continue.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            to="/admin/login"
            className="group rounded-2xl border border-white/10 bg-white p-6 shadow-xl transition-transform hover:-translate-y-0.5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-dusk-700 text-marigold-300">
              <ShieldCheck size={20} />
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink">Admin Login</h2>
            <p className="mt-1 text-sm text-ink-soft">Manage categories, review experts and services, payouts, and platform settings.</p>
            <span className="mt-4 flex items-center gap-1 text-sm font-medium text-dusk-700">
              Continue <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            to="/expert/login"
            className="group rounded-2xl border border-white/10 bg-white p-6 shadow-xl transition-transform hover:-translate-y-0.5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-marigold-500 text-white">
              <UserRound size={20} />
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink">Expert Login</h2>
            <p className="mt-1 text-sm text-ink-soft">Manage your profile, services, live sessions, bookings, and earnings.</p>
            <span className="mt-4 flex items-center gap-1 text-sm font-medium text-dusk-700">
              Continue <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
