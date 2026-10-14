"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function PrivacyPolicyDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl">
        <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-amber-50 px-6 py-5 sm:px-8">
          <DialogHeader className="space-y-3 text-left">
            <div className="inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
              Privacy Policy
            </div>
            <DialogTitle className="font-heading text-2xl font-bold text-slate-900">Privacy Policy</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-slate-600">
              Protecting personal information in accordance with the Philippine Data Privacy Act of 2012.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-6 py-6 text-sm leading-7 text-slate-700 sm:px-8">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            Republic of the Philippines • RA 10173 Compliance
          </div>

          <p>
            e-Catarman, the Barangay Catarman Information and Online Services Portal of Barangay Catarman, Municipality of
            Cordova, Cebu, is committed to protecting personal information in accordance with the Philippine Data Privacy
            Act of 2012 (Republic Act No. 10173), its Implementing Rules and Regulations, and applicable guidelines issued by
            the National Privacy Commission.
          </p>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <span className="font-semibold">Effective Date:</span> October 14, 2026 • <span className="font-semibold">Last Reviewed & Updated:</span> October 14, 2026
          </div>

          <section className="space-y-3">
            <h3 className="font-heading text-lg font-bold text-slate-900">1. Information We Collect</h3>
            <p>
              We collect and process information necessary to provide barangay services, maintain accurate records, facilitate
              public communication, and protect the security of the e-Catarman platform.
            </p>
            <ul className="list-disc space-y-2 pl-5 text-slate-700">
              <li><span className="font-semibold text-slate-900">Personal and Residency Information:</span> names, residential addresses, purok and household details, contact information, and other relevant information required for resident profiling and legitimate barangay services.</li>
              <li><span className="font-semibold text-slate-900">Document Request Information:</span> details submitted through online document requests, including the requested document type, application information, reference numbers, supporting documents, and uploaded photographs when required.</li>
              <li><span className="font-semibold text-slate-900">Complaint and Incident Reports:</span> information provided when submitting complaints or reporting incidents, including descriptions, relevant dates, reference numbers, and supporting photographs or other evidence.</li>
              <li><span className="font-semibold text-slate-900">Technical and Security Information:</span> information such as IP addresses, browser and device details, access logs, and diagnostic data, where collected by the application, hosting provider, or security services, to help maintain platform security and reliability.</li>
              <li><span className="font-semibold text-slate-900">Public Engagement Information:</span> comments, reactions, and other information submitted through public announcements or community engagement features, where available.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-heading text-lg font-bold text-slate-900">2. How We Use Your Information</h3>
            <p>Collected information is processed for legitimate barangay functions and the operation of e-Catarman, including:</p>
            <ul className="list-disc space-y-2 pl-5 text-slate-700">
              <li>Maintaining and managing resident and household records for authorized barangay purposes.</li>
              <li>Receiving, reviewing, and processing requests for barangay documents and related services.</li>
              <li>Accepting and managing complaints and incident reports submitted by residents.</li>
              <li>Providing reference numbers and enabling users to track the status of their requests and reports.</li>
              <li>Publishing barangay announcements, community updates, activities, and public advisories.</li>
              <li>Communicating relevant service updates to applicants when appropriate.</li>
              <li>Protecting the platform against unauthorized access, fraudulent submissions, spam, and other security threats.</li>
              <li>Maintaining appropriate transaction records and audit logs to support accountability and authorized administrative operations.</li>
            </ul>
            <p>Personal information will be processed only for purposes supported by an applicable lawful basis under the Data Privacy Act of 2012.</p>
          </section>

          <section className="space-y-3">
            <h3 className="font-heading text-lg font-bold text-slate-900">3. Data Security, Third-Party Services, and Search Engine Protection</h3>
            <p>
              e-Catarman applies appropriate organizational, physical, and technical safeguards to protect personal information
              against unauthorized access, disclosure, alteration, loss, or destruction.
            </p>
            <ul className="list-disc space-y-2 pl-5 text-slate-700">
              <li><span className="font-semibold text-slate-900">Third-Party Hosting and Storage:</span> the platform may use third-party infrastructure for application hosting, database management, file storage, and email delivery.</li>
              <li><span className="font-semibold text-slate-900">File Uploads and Supporting Documents:</span> documents and photographs submitted through online services are intended for authorized personnel responsible for processing the corresponding requests or reports.</li>
              <li><span className="font-semibold text-slate-900">Authentication and Access Control:</span> staff and administrative functions are restricted according to assigned access permissions.</li>
              <li><span className="font-semibold text-slate-900">Public Announcements and Search Indexing:</span> public-facing pages may be indexed by search engines, but private resident information and internal pages remain protected through access controls.</li>
              <li><span className="font-semibold text-slate-900">Cookies and Local Storage:</span> the platform may use browser storage for necessary preferences, session management, and performance improvements.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-heading text-lg font-bold text-slate-900">4. Your Rights Under the Data Privacy Act</h3>
            <p>Under Republic Act No. 10173, individuals have rights concerning their personal information, subject to applicable legal conditions and exceptions. These may include:</p>
            <ul className="list-disc space-y-2 pl-5 text-slate-700">
              <li>Right to Be Informed</li>
              <li>Right to Access</li>
              <li>Right to Rectification</li>
              <li>Right to Erasure or Blocking</li>
              <li>Right to Object</li>
              <li>Right to Data Portability</li>
              <li>Right to File a Complaint and Seek Damages</li>
            </ul>
            <p>To exercise these rights or raise a privacy concern, please contact the authorized Barangay Catarman office through its officially designated communication channels.</p>
          </section>

          <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-4 text-sm text-slate-700">
            e-Catarman is intended to support accessible, accountable, and secure barangay services while respecting the privacy and rights of the people it serves.
          </div>

          <div className="border-t border-slate-200 pt-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">e-Catarman</p>
            <p>Barangay Catarman, Municipality of Cordova, Cebu, Philippines</p>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-8">
          <Button type="button" onClick={() => onOpenChange(false)} className="h-10 px-5 font-semibold">
            I understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
