"use client";

import Link from "next/link";
import { BRAND } from "@/lib/brand";

const { catalog } = BRAND;

export default function Home() {
  return (
    <div>
      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Warm gradient mesh */}
        <div className="absolute inset-0 gradient-hero">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-coral mesh-blob" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-brand-sand mesh-blob-delay" />
          <div className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full bg-brand-coral-soft mesh-blob-slow" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <p className="text-sm font-medium tracking-widest uppercase text-stone-400 mb-5">
              Custom pet accessories, powered by AI
            </p>
            <h1 className="section-title text-5xl md:text-7xl mb-6 leading-[1.08] text-balance">
              {BRAND.tagline}
            </h1>
          </div>

          <div className="animate-fade-in-delay">
            <p className="section-subtitle mx-auto mb-10 text-balance">
              Upload a photo. Pick your colors. We make a one-of-a-kind poop bag holder, leash set, and crochet pattern that looks just like your pup.
            </p>
          </div>

          <div className="animate-fade-in-delay-2 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/upload" className="btn-primary text-base px-8 py-4">
              Design Yours
            </Link>
            <a href="#products" className="btn-ghost text-base">
              See Products
            </a>
          </div>
        </div>
      </section>

      {/* ─── Products ──────────────────────────────────────────────────── */}
      <section id="products" className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest uppercase text-stone-400 mb-3">What we make</p>
            <h2 className="section-title text-4xl md:text-5xl mb-4">Three ways to celebrate your dog</h2>
            <div className="divider mt-6" />
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* LeashBuddy */}
            <div className="card-hover p-8 flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-2xl bg-brand-coral-soft flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <svg className="w-9 h-9 text-brand-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-1">{catalog.leashBuddy.name}</h3>
              <p className="text-stone-500 text-sm mb-5 leading-relaxed">{catalog.leashBuddy.tagline}</p>
              <div className="price-tag mb-5">{catalog.leashBuddy.price}</div>
              <Link href="/upload" className="btn-primary w-full text-sm py-3">
                Design Yours
              </Link>
            </div>

            {/* Bundle - featured */}
            <div className="card-hover p-8 flex flex-col items-center text-center group relative ring-2 ring-brand-coral/20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-coral text-white text-xs font-semibold rounded-full">
                Best Value
              </div>
              <div className="w-20 h-20 rounded-2xl bg-brand-sand-soft flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <svg className="w-9 h-9 text-brand-sand" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-1">{catalog.bundle.name}</h3>
              <p className="text-stone-500 text-sm mb-3 leading-relaxed">{catalog.bundle.tagline}</p>
              <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                {catalog.bundle.includes.map((item) => (
                  <span key={item} className="px-2.5 py-0.5 bg-stone-100 text-stone-600 text-xs rounded-full">{item}</span>
                ))}
              </div>
              <div className="price-tag mb-5">{catalog.bundle.price}</div>
              <Link href="/upload" className="btn-primary w-full text-sm py-3">
                Design Your Set
              </Link>
            </div>

            {/* Crochet PDF */}
            <div className="card-hover p-8 flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <svg className="w-9 h-9 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-1">{catalog.crochetPdf.name}</h3>
              <p className="text-stone-500 text-sm mb-5 leading-relaxed">{catalog.crochetPdf.tagline}</p>
              <div className="mb-1">
                <span className="price-tag">{catalog.crochetPdf.price}</span>
              </div>
              <p className="text-xs text-brand-coral font-medium mb-5">Free with any LeashBuddy order</p>
              <Link href="/upload" className="btn-ghost w-full text-sm py-3">
                Get Pattern
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest uppercase text-stone-400 mb-3">How it works</p>
            <h2 className="section-title text-4xl md:text-5xl">Three steps to custom</h2>
            <div className="divider mt-6" />
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {[
              {
                step: '01',
                title: 'Upload a photo',
                desc: 'Snap a pic of your dog. Our AI analyzes their breed, colors, markings, and unique features.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'Customize colors',
                desc: 'Fine-tune colors on our interactive dog model. Choose materials, ear styles, and more.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Order your gear',
                desc: 'Review your AI-generated preview, scenic photos, and place your order. We handle the rest.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-stone-100 text-stone-600 mb-5">
                  {item.icon}
                </div>
                <div className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">
                  Step {item.step}
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">{item.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── What You Get ──────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest uppercase text-stone-400 mb-3">Included with every order</p>
            <h2 className="section-title text-4xl md:text-5xl">More than just a product</h2>
            <div className="divider mt-6" />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: 'AI-matched colors',
                desc: 'Our AI analyzes your dog\'s exact coat colors and markings, then matches them to your product.',
              },
              {
                title: 'Scenic crochet photos',
                desc: 'Get beautiful AI-generated photos of your dog as a crochet amigurumi in cute scenic settings.',
              },
              {
                title: '95+ breeds supported',
                desc: 'From Golden Retrievers to Shiba Inus. Mixed breeds too \u2014 select up to 4 breed combinations.',
              },
              {
                title: 'Manufacturing-ready specs',
                desc: 'Every product comes with detailed embroidery specs, fabric colors, and assembly instructions.',
              },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-xl border border-stone-200/60 hover:border-stone-300/80 transition-colors">
                <h3 className="font-bold text-stone-900 mb-1.5">{item.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 gradient-cta">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight text-balance font-editorial">
            Ready to see your dog as a product?
          </h2>
          <p className="text-lg text-white/75 mb-10 max-w-xl mx-auto">
            Upload a photo and design your custom {catalog.leashBuddy.name} in minutes.
          </p>
          <Link href="/upload" className="inline-block px-8 py-4 bg-white text-stone-900 font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
