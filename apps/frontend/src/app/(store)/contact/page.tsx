import ContactForm from '../../../features/contact/components/ContactForm';
import ContactHero from '../../../features/contact/components/ContactHero';
import ContactInfo from '../../../features/contact/components/ContactInfo';

export default function ContactPage() {
  return (
    <main className="min-h-[calc(100vh-72px)] bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <ContactHero />
            <ContactInfo />
          </div>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
