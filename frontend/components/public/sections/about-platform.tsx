export function AboutPlatform() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">About e-Catarman</h2>
        <p className="mt-3 text-lg font-medium text-muted-foreground">
          A smarter way to access <span className="text-gold">barangay services</span>
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          e-Catarman is an official online platform designed to modernize and simplify how residents request and
          receive barangay documents, certificates, and announcements.
        </p>
        <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-gold" />
      </div>
    </section>
  )
}
