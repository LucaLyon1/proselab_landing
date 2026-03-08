'use client'

export function AuthNav() {
  return (
    <nav className="auth-nav">
      <a
        href="#"
        className="auth-nav-cta"
        onClick={(e) => {
          e.preventDefault()
          window.dispatchEvent(new CustomEvent('open-subscribe-modal'))
        }}
      >
        Sign up
      </a>
    </nav>
  )
}
