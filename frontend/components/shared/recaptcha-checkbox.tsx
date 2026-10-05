"use client"

import ReCAPTCHA from "react-google-recaptcha"
import { cn } from "@/lib/utils"

interface RecaptchaCheckboxProps {
  token: string | null
  onChange: (token: string | null) => void
  className?: string
}

export function RecaptchaCheckbox({ token, onChange, className }: RecaptchaCheckboxProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  return (
    <div className={cn("min-h-[78px]", className)}>
      {siteKey ? (
        <ReCAPTCHA
          sitekey={siteKey}
          onChange={onChange}
          onExpired={() => onChange(null)}
          onErrored={() => onChange(null)}
          theme="light"
        />
      ) : (
        <p className="max-w-md rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Google reCAPTCHA v2 is not configured. Set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in frontend/.env.
        </p>
      )}
      {token ? <span className="sr-only">reCAPTCHA verified</span> : null}
    </div>
  )
}
