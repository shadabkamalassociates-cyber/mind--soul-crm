import { ShieldCheck } from 'lucide-react'
import PhoneLoginCard from './PhoneLoginCard'

export default function AdminLogin() {
  return (
    <PhoneLoginCard
      role="admin"
      roleLabel="Admin"
      icon={ShieldCheck}
      accentClass="bg-dusk-700"
      quote="Guidance when you need it most."
      quoteBy="Run the platform behind 100K+ seekers — approve guides, curate live sessions, and keep every Sadhana on schedule."
      defaultPhone=""
      redirectTo="/admin"
      otherPortal={{ label: 'Are you an expert?', to: '/expert/login', linkText: 'Go to Expert login' }}
    />
  )
}
