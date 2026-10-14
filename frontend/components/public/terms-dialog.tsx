"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function TermsAndConditionsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl">
        <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-amber-50 px-6 py-5 sm:px-8">
          <DialogHeader className="space-y-3 text-left">
            <div className="inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
              Terms of Service
            </div>
            <DialogTitle className="font-heading text-2xl font-bold text-slate-900">Terms and Conditions</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-slate-600">
              Please review the terms before using e-Catarman and submitting any request, report, or community form.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-6 py-6 text-sm leading-7 text-slate-700 sm:px-8">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            e-Catarman — Barangay Catarman Information and Online Services Portal
          </div>

          <p>
            Welcome to e-Catarman, the digital information and online services platform intended to support the delivery of
            barangay services in Barangay Catarman, Municipality of Cordova, Province of Cebu, Philippines.
          </p>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <span className="font-semibold">Effective Date:</span> October 14, 2026 • <span className="font-semibold">Last Reviewed:</span> October 14, 2026
          </div>

          <section className="space-y-3">
            <h3 className="font-heading text-lg font-bold text-slate-900">1. Authorized Public Use and Permitted Conduct</h3>
            <p>e-Catarman is designed to provide accessible barangay information, facilitate online document requests, support complaint and incident reporting, publish community announcements, and improve communication between residents and authorized barangay personnel.</p>
            <p>As a user, you agree to:</p>
            <ul className="list-disc space-y-2 pl-5 text-slate-700">
              <li>Provide accurate, complete, and truthful information when submitting document requests, complaints, incident reports, and other online forms.</li>
              <li>Submit only authentic documents and photographs that are relevant to the service requested.</li>
              <li>Use the platform only for lawful purposes and legitimate barangay-related activities.</li>
              <li>Refrain from posting fraudulent, defamatory, threatening, obscene, harassing, or otherwise unlawful content.</li>
              <li>Respect the privacy and rights of other residents, barangay personnel, and individuals whose information may appear on the platform.</li>
              <li>Avoid impersonating another person or submitting applications on behalf of another individual without appropriate authority.</li>
              <li>Follow applicable barangay procedures and understand that online submissions may require verification, review, approval, or in-person follow-up.</li>
            </ul>
            <p>Submitting an online request does not automatically guarantee approval or issuance of a barangay document. Requests remain subject to verification, applicable requirements, and authorized barangay procedures.</p>
          </section>

          <section className="space-y-3">
            <h3 className="font-heading text-lg font-bold text-slate-900">2. Online Services, Document Requests, and Status Tracking</h3>
            <p>e-Catarman may provide online services that allow users to request available barangay documents, submit complaints or incident reports, and track the status of their submissions.</p>
            <ul className="list-disc space-y-2 pl-5 text-slate-700">
              <li>Submission of a request is not equivalent to approval, certification, or release of a document.</li>
              <li>Additional information or supporting documents may be required before a request can be processed.</li>
              <li>Requests may be approved, rejected, flagged for verification, or otherwise handled according to applicable barangay procedures.</li>
              <li>Reference numbers and status information should be kept secure and used only for their intended purpose.</li>
              <li>The barangay may contact applicants through available communication channels when clarification or further verification is necessary.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-heading text-lg font-bold text-slate-900">3. Emergency Reporting and Public Safety</h3>
            <p>
              e-Catarman may provide an incident-reporting feature intended to help residents submit information about incidents to
              the appropriate barangay personnel.
            </p>
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">
              Important Emergency Advisory: If there is an ongoing fire, serious injury, medical emergency, crime in progress, or imminent threat to life or safety, contact 911 or the appropriate emergency service directly.
            </div>
            <p>Submitting an incident report does not guarantee an immediate response, dispatch of responders, or resolution of the reported incident.</p>
          </section>

          <section className="space-y-3">
            <h3 className="font-heading text-lg font-bold text-slate-900">4. Cybersecurity and Prohibited Activities</h3>
            <p>To protect e-Catarman and the information entrusted to the barangay, users are prohibited from engaging in activities that compromise the platform, its records, or its availability.</p>
            <ul className="list-disc space-y-2 pl-5 text-slate-700">
              <li>Attempting unauthorized access to staff accounts, administrative functions, databases, APIs, or restricted records.</li>
              <li>Bypassing authentication, access controls, role permissions, or other security measures.</li>
              <li>Conducting denial-of-service attacks, automated request flooding, or other activities intended to disrupt system availability.</li>
              <li>Uploading malicious files or submitting content intended to damage, disrupt, or compromise the platform.</li>
              <li>Accessing, copying, or modifying confidential resident information without lawful authority.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-heading text-lg font-bold text-slate-900">5. Public Announcements, Comments, and Community Engagement</h3>
            <p>Users are responsible for the content they submit and must not use these features to publish threats, harassment, or unlawful material.</p>
            <p>The barangay may moderate or remove content according to applicable law, established community rules, and legitimate administrative requirements.</p>
          </section>

          <section className="space-y-3">
            <h3 className="font-heading text-lg font-bold text-slate-900">6. Privacy and Personal Information</h3>
            <p>The collection, use, storage, and processing of personal information through e-Catarman are addressed in the platforms Privacy Policy and are subject to applicable Philippine data protection laws.</p>
          </section>

          <section className="space-y-3">
            <h3 className="font-heading text-lg font-bold text-slate-900">7. Governing Law</h3>
            <p>These Terms of Service are governed by the laws of the Republic of the Philippines, including the Data Privacy Act of 2012, the Cybercrime Prevention Act, and other applicable laws.</p>
          </section>

          <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-4 text-sm text-slate-700">
            By continuing, you confirm that you understand these terms and consent to the processing of your information for the purpose of availing barangay services and receiving official updates related to your request or report.
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-8">
          <Button type="button" onClick={() => onOpenChange(false)} className="h-10 px-5 font-semibold">
            I agree
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
