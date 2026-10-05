import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const FAQS = [
  {
    question: "Do I need to create an account to request a barangay document?",
    answer:
      "No. Residents can request documents, track requests, and report incidents without creating an account. Simply fill out the online form and you will receive a reference number to track your request.",
  },
  {
    question: "How long does it take to process a certificate request?",
    answer:
      "Most requests are reviewed within 1-2 business days. Once approved, you will be notified and given a claim deadline. You may track real-time progress using your reference number on the Track Request page.",
  },
  {
    question: "What should I bring when claiming my document?",
    answer:
      "Please bring a valid government-issued ID and your reference number. If you are claiming on behalf of someone else, an authorization letter along with both IDs is required.",
  },
  {
    question: "Is my incident report confidential?",
    answer:
      "Yes. Reporter information is kept strictly confidential and is only accessible to authorized barangay staff for verification and resolution purposes.",
  },
  {
    question: "Why do I need to take a live photo when reporting an incident?",
    answer:
      "A live photo capture helps the barangay verify that reports are submitted by a real, present individual, which discourages false or malicious reports while keeping your identity confidential from the public.",
  },
  {
    question: "What happens if I don't claim my approved certificate on time?",
    answer:
      "Approved certificates must be claimed within the given claim deadline (typically 5 days). If you're unable to claim it in time, please contact the barangay office to have the deadline extended.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Need Help?</p>
        <h2 className="mt-2 font-heading text-3xl font-bold text-foreground sm:text-4xl">Frequently Asked Questions</h2>
      </div>

      <Accordion type="single" collapsible className="mt-10">
        {FAQS.map((faq, idx) => (
          <AccordionItem key={faq.question} value={`faq-${idx}`}>
            <AccordionTrigger className="text-left font-heading text-base font-semibold">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
