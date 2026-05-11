import { Upload } from "lucide-react";
import Link from "next/link";

export default function PrescriptionBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl bg-blue-600 p-8 text-white sm:p-10 lg:p-12">
        <div className="relative z-10 max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-widest text-white/60">
            Prescription Service
          </p>

          <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">
            Need prescription medicines?
            <br />
            Just upload — we do the rest.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
            Take a clear photo of your doctor&apos;s prescription and upload it.
            Our team reviews it, approves your medicines, and helps prepare your
            order.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-white/85">
            <span>① Upload photo</span>
            <span>② Pharmacist reviews</span>
            <span>③ Get notified</span>
            <span>④ Order & receive</span>
          </div>

          <Link
            href="/upload-prescription"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-blue-600 transition hover:shadow-lg"
          >
            <Upload className="h-4 w-4" />
            Upload Your Prescription
          </Link>
        </div>

        <div className="absolute right-12 top-1/2 hidden -translate-y-1/2 select-none text-8xl opacity-20 lg:block">
          📋
        </div>
      </div>
    </section>
  );
}