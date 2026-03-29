"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Input } from "@/components/ui/input-email";

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="relative w-full overflow-hidden bg-white px-6 pt-10 text-sm text-slate-500 md:px-16 lg:px-24 xl:px-32">
      <Image
        src="/assets/logo.svg"
        alt="Logo"
        width={400}
        height={400}
        className="pointer-events-none absolute -bottom-30 -left-80 hidden h-full w-full opacity-5 md:block"
      />
      <div className="grid grid-cols-1 gap-14 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-1">
          <a href="/">
            <Image
              src="/assets/logo.svg"
              alt="Logo"
              width={68}
              height={26}
              className="h-7 w-auto"
            />
          </a>
          <p className="mt-6 text-sm/7">
            Voxify helps teams turn text into natural, production-ready speech
            for ads, product demos, courses, podcasts, and support workflows.
          </p>
        </div>
        <div className="flex flex-col lg:items-center lg:justify-center">
          <div className="flex flex-col space-y-2.5 text-sm">
            <h2 className="mb-5 font-semibold text-gray-800">Company</h2>
            <a className="transition hover:text-slate-600" href="#features">
              Features
            </a>
            <a className="transition hover:text-slate-600" href="#pricing">
              Pricing
            </a>
            <a className="transition hover:text-slate-600" href="/sign-in">
              Sign in
            </a>
            <a className="transition hover:text-slate-600" href="/dashboard">
              Dashboard
            </a>
          </div>
        </div>
        <div>
          <h2 className="mb-5 font-semibold text-gray-800">
            Subscribe to our newsletter
          </h2>
          <div className="max-w-sm space-y-6 text-sm">
            <p>
              Get product updates, new voice releases, and practical tips to
              improve your audio workflow.
            </p>
            <div className="flex items-end gap-3">
              <Input
                className="w-full"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="h-10 rounded-md bg-linear-to-b from-gray-600 to-gray-800 px-4 text-white transition hover:from-gray-700 hover:to-gray-900">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-200 py-4 md:flex-row">
        <p className="text-center">
          Copyright 2026 © <a href="/">Voxify</a> All Right Reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/">Privacy Policy</Link>
          <Link href="/">Terms of Service</Link>
          <Link href="/">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
}
