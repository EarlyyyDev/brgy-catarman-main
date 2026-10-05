"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { usePublicSettings, useSubmitContactForm } from "@/lib/api/hooks/use-settings"

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  email: z.email("Please enter a valid email address."),
  subject: z.string().min(3, "Please enter a subject."),
  message: z.string().min(10, "Please provide more details (at least 10 characters)."),
})

type ContactValues = z.infer<typeof contactSchema>

export function Contact() {
  const { settings: systemSettings } = usePublicSettings()
  const submitContactForm = useSubmitContactForm()
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  })

  async function onSubmit(values: ContactValues) {
    await submitContactForm.mutateAsync(values)
    form.reset()
  }

  const mapQuery = encodeURIComponent(systemSettings.fullAddress)

  return (
    <section id="contact" className="bg-secondary/40 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Get in Touch</p>
          <h2 className="mt-2 font-heading text-3xl font-bold text-foreground sm:text-4xl">Contact Barangay Catarman</h2>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Office Address</p>
                  <p className="mt-1 text-sm text-muted-foreground">{systemSettings.fullAddress}</p>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-3">
                <Phone className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Phone</p>
                  <p className="mt-1 text-sm text-muted-foreground">{systemSettings.contactNumbers.join(" / ")}</p>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-3">
                <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Email</p>
                  <p className="mt-1 text-sm text-muted-foreground">{systemSettings.emailAddress}</p>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-3">
                <Clock className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Office Hours</p>
                  <p className="mt-1 text-sm text-muted-foreground">{systemSettings.officeHours}</p>
                </div>
              </div>
            </div>

            <div className="h-64 overflow-hidden rounded-2xl border border-border">
              <iframe
                title="Barangay Catarman Location Map"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-3 sm:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Juan Dela Cruz" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="How can we help you?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea rows={5} placeholder="Write your message here..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
                  <Send className="size-4" />
                  Send Message
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  )
}
