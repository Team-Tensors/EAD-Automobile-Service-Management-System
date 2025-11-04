import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import carImg from "@/assets/car.jpeg";

const faqs = [
  "What services do you currently offer?",
  "How do I schedule an appointment?",
  "How do I maintain my car's battery?",
  "What does the check engine light mean?",
  "Do you offer fleet services?",
  "Can you help with car customization?",
  "How often should I service my car?",
  "What makes your service unique?",
];

const answers = [
  "We offer a full range of services including routine maintenance (oil changes, filters), diagnostics and repairs, brake and suspension work, electrical and battery services, A/C service, and more. If you need something specific, reach out and we'll advise.",
  "You can schedule an appointment online via our booking page, by phone, or by dropping a message in the contact form below — we'll confirm available slots and preferred service center.",
  "To maintain your car battery: keep terminals clean, avoid long periods of inactivity, limit excessive short trips, and have the battery tested during regular service intervals. We'll also replace it if it's weak.",
  "The check engine light covers many issues — from minor sensor faults to important engine problems. We'll run a diagnostic scan to get the trouble codes and explain the recommended fixes and costs.",
  "Yes — we provide fleet maintenance plans including scheduled servicing, priority booking, and consolidated billing. Contact our sales team for a tailored fleet plan.",
  "Absolutely — our shop can perform many customization tasks such as performance tuning, aesthetic upgrades, audio installs, and accessory fitting. We'll provide a quote based on your requirements.",
  "For most vehicles, servicing at least once a year or every 10,000–12,000 miles (whichever comes first) is recommended. Check your manufacturer's schedule for more precise intervals.",
  "We combine experienced technicians, transparent pricing, and fast turnarounds. We also provide clear diagnostic reports and warranty on many repairs — our goal is to make maintenance stress-free.",
];

const ContactUs: React.FC = () => {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const toggle = (i: number) => setOpen((s) => ({ ...s, [i]: !s[i] }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to backend API. For now, just log and clear message field.
    console.log("Contact form submitted:", form);
    alert("Message sent. We'll get back to you shortly.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <>
      {/* Top: FAQ section */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-0">
          <div className="mb-10">
            <p className="text-4xl font-bold mb-6 font-heading text-orange-700">Get in Touch</p>
            <h2 className="text-3xl font-bold uppercase tracking-wide">Have questions about our services? <span className="text-gray-400 block text-lg font-normal">FAQ for answers</span></h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {faqs.map((q, i) => (
              <div key={q} className="bg-[#0f0f0f] border border-zinc-800 rounded-md px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <button
                    id={`faq-${i}-button`}
                    onClick={() => toggle(i)}
                    className="text-left text-sm font-medium text-white flex-1 pr-2 leading-tight hover:text-orange-400 focus:outline-none"
                    aria-expanded={!!open[i]}
                    aria-controls={`faq-${i}`}
                  >
                    {q}
                  </button>

                  <button
                    onClick={() => toggle(i)}
                    aria-label={open[i] ? `Collapse ${q}` : `Expand ${q}`}
                    className="ml-4 inline-flex items-center justify-center w-9 h-9 bg-orange-600 text-white rounded-md flex-shrink-0 relative overflow-hidden"
                  >
                    {/* Crossfade and slight slide between + and - */}
                    <span
                      aria-hidden
                      className={`absolute inset-0 flex items-center justify-center text-lg font-bold transition-all duration-200 ${open[i] ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"}`}
                    >
                      +
                    </span>

                    <span
                      aria-hidden
                      className={`absolute inset-0 flex items-center justify-center text-lg font-bold transition-all duration-200 ${open[i] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}
                    >
                      -
                    </span>
                  </button>
                </div>

                {/* Answer panel */}
                <div
                  id={`faq-${i}`}
                  role="region"
                  aria-labelledby={`faq-${i}-button`}
                  className={`mt-3 text-sm text-gray-400 transition-all duration-150 ${open[i] ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
                >
                  {open[i] && <p className="leading-relaxed pl-1">{answers[i] ?? "We will update this answer soon."}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom: Background image with overlayed contact form */}
      <section className="relative bg-cover bg-center" style={{ backgroundImage: `url(${carImg})` }}>
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative py-20">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-6 lg:col-start-7">
                <div className="bg-white/5 border border-zinc-700 rounded-md p-8 backdrop-blur-sm">
                  <h3 className="text-2xl font-semibold mb-3 text-white font-heading">Drop a Message</h3>
                  <p className="text-sm text-gray-300 mb-6">Tell us about your request and we'll get back to you shortly.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" name="subject" value={form.subject} onChange={handleChange} placeholder="Subject" />
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <textarea
                        id="message"
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        placeholder="Write your message here"
                      />
                    </div>

                    <div className="pt-2">
                      <Button type="submit" variant="default">Let's Get Started</Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactUs;
