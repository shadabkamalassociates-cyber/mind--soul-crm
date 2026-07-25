import { UserRound } from 'lucide-react'
import PhoneLoginCard from './PhoneLoginCard'

export default function ExpertLogin() {
  return (
    <PhoneLoginCard
      role="expert"
      roleLabel="Expert"
      icon={UserRound}
      accentClass="bg-marigold-500"
      quote="Your practice, held with care."
      quoteBy="Manage your sessions, share your gifts, and grow your practice — all in one place."
      defaultPhone="9310874215"
      redirectTo="/expert"
      otherPortal={{ label: 'Are you an admin?', to: '/admin/login', linkText: 'Go to Admin login' }}
      signupLink={{ label: 'New expert?', to: '/expert/signup', linkText: 'Apply to join' }}
    />
  )
}
