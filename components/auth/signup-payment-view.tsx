"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Copy,
  CreditCard,
  LoaderCircle,
  QrCode,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatIdrCurrency } from "@/lib/payment-gateway-config";
import type { PublicSignupPaymentSettings } from "@/lib/payment-gateway-types";
import type { SignupPaymentPublicState } from "@/lib/signup-payment-types";
import { cn } from "@/lib/utils";

type SignupPaymentViewProps = {
  initialPayment: SignupPaymentPublicState;
  paymentSettings: PublicSignupPaymentSettings;
};

type StatusPayload = {
  accountReady?: boolean;
  message?: string;
  payment?: SignupPaymentPublicState;
};

function PaymentChannelIcon({
  className,
  type,
}: {
  className?: string;
  type: PublicSignupPaymentSettings["activeChannels"][number]["type"] | null;
}) {
  if (type === "ewallet") {
    return <Wallet className={className} />;
  }

  if (type === "qris") {
    return <QrCode className={className} />;
  }

  return <CreditCard className={className} />;
}

function formatPaymentDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getPaymentStatusLabel(payment: SignupPaymentPublicState, accountReady: boolean) {
  if (payment.status === "paid") {
    return accountReady ? "Akun sudah aktif" : "Pembayaran terverifikasi";
  }

  if (payment.status === "failed") {
    return "Pembayaran perlu dibuat ulang";
  }

  return "Menunggu pembayaran";
}

export function SignupPaymentView({
  initialPayment,
  paymentSettings,
}: SignupPaymentViewProps) {
  const [payment, setPayment] = useState(initialPayment);
  const [accountReady, setAccountReady] = useState(false);
  const [message, setMessage] = useState<string | null>(initialPayment.message);
  const [isChecking, setIsChecking] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const channel =
    paymentSettings.activeChannels.find((item) => item.code === payment.channelCode) ?? null;
  const formattedExpiresAt = formatPaymentDate(payment.expiresAt);
  const statusLabel = getPaymentStatusLabel(payment, accountReady);
  const instructionKind = channel?.type === "qris" ? "qris" : channel?.type === "va" ? "bank" : "link";
  const canOpenProvider = Boolean(payment.paymentUrl);

  const statusTone = useMemo(() => {
    if (payment.status === "paid" && accountReady) {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (payment.status === "failed") {
      return "border-rose-200 bg-rose-50 text-rose-700";
    }

    return "border-sky-200 bg-sky-50 text-sky-700";
  }, [accountReady, payment.status]);

  const checkStatus = useCallback(async (manual = false) => {
    setIsChecking(true);

    if (manual) {
      setMessage("Sedang memeriksa status pembayaran...");
    }

    try {
      const response = await fetch(
        `/api/signup/payment/status?referenceId=${encodeURIComponent(payment.referenceId)}`,
        {
          cache: "no-store",
        },
      );
      const payload = (await response.json()) as StatusPayload;

      if (!response.ok || !payload.payment) {
        setMessage(payload.message ?? "Belum bisa memeriksa status pembayaran.");
        return;
      }

      setPayment(payload.payment);
      setAccountReady(Boolean(payload.accountReady));

      if (payload.payment.status === "paid" && payload.accountReady) {
        setMessage("Pembayaran berhasil. Akun Anda sudah aktif dan bisa login.");
        return;
      }

      if (payload.payment.status === "paid") {
        setMessage("Pembayaran berhasil, tetapi akun belum bisa diaktifkan otomatis. Hubungi admin.");
        return;
      }

      setMessage(payload.payment.message ?? "Pembayaran masih menunggu penyelesaian.");
    } catch {
      setMessage("Belum bisa memeriksa status pembayaran.");
    } finally {
      setIsChecking(false);
    }
  }, [payment.referenceId]);

  async function copyValue(value: string, field: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => {
        setCopiedField((current) => (current === field ? null : current));
      }, 1800);
    } catch {
      setMessage("Belum bisa menyalin data pembayaran dari browser ini.");
    }
  }

  useEffect(() => {
    if (payment.status === "failed" || accountReady) {
      return;
    }

    const firstCheckId = window.setTimeout(() => {
      void checkStatus(false);
    }, 0);

    const intervalId = window.setInterval(() => {
      void checkStatus(false);
    }, 6000);

    return () => {
      window.clearTimeout(firstCheckId);
      window.clearInterval(intervalId);
    };
  }, [accountReady, checkStatus, payment.status]);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className={cn("inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium", statusTone)}>
              {payment.status === "pending" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : payment.status === "paid" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {statusLabel}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-950">
              {payment.planLabel ?? paymentSettings.priceLabel}
            </h3>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {formatIdrCurrency(payment.amount)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Reference
            </p>
            <p className="mt-2 break-all text-sm font-semibold text-slate-950">{payment.referenceId}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Metode
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
              <PaymentChannelIcon className="h-4 w-4 text-sky-600" type={channel?.type ?? null} />
              {payment.paymentName ?? channel?.name ?? payment.channelCode}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Berlaku sampai
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {formattedExpiresAt ?? "Mengikuti batas waktu provider"}
            </p>
          </div>
        </div>

        {message ? (
          <Alert
            className="mt-5 flex items-start gap-3"
            variant={payment.status === "failed" ? "error" : accountReady ? "success" : "default"}
          >
            {accountReady ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <p>{message}</p>
          </Alert>
        ) : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            className="w-full rounded-xl sm:w-auto"
            disabled={isChecking || payment.status === "failed" || accountReady}
            onClick={() => void checkStatus(true)}
            type="button"
            variant="outline"
          >
            {isChecking ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Cek status
          </Button>

          {accountReady ? (
            <Link
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(14,165,233,0.22)] transition-colors hover:bg-sky-600 sm:w-auto"
              href="/login"
            >
              Login sekarang
            </Link>
          ) : null}
        </div>
      </div>

      {payment.status === "failed" ? (
        <Alert className="flex items-start gap-3" variant="error">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Pembayaran ini tidak aktif lagi. Kembali ke signup dan gunakan panel lanjutkan pembayaran
            untuk membuat invoice baru.
          </p>
        </Alert>
      ) : null}

      {!accountReady ? (
        <div className="rounded-xl border border-sky-100 bg-[linear-gradient(180deg,rgba(240,249,255,0.96)_0%,rgba(248,250,252,0.98)_100%)] p-5 shadow-[0_18px_40px_rgba(14,165,233,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Instruksi pembayaran
          </p>

          {instructionKind === "qris" ? (
            <div className="mt-4 space-y-4">
              <div className="mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
                {payment.qrImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt="QRIS pembayaran signup"
                    className="aspect-square w-full rounded-xl bg-white object-contain"
                    src={payment.qrImageUrl}
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center rounded-xl bg-slate-100 p-6 text-center text-sm text-slate-500">
                    QR sedang disiapkan.
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-white/80 p-4">
                <p className="text-sm font-semibold text-slate-950">Bayar langsung</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Scan QRIS menggunakan mobile banking atau e-wallet yang mendukung QRIS.
                </p>
              </div>
            </div>
          ) : null}

          {instructionKind === "bank" ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-white/80 p-4">
                <p className="text-sm font-medium text-slate-700">Nomor pembayaran</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-all text-xl font-semibold tracking-[0.06em] text-slate-950">
                      {payment.paymentNumber ?? "-"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Transfer tepat sesuai nominal ke {payment.paymentName ?? channel?.name ?? "virtual account"}.
                    </p>
                  </div>
                  {payment.paymentNumber ? (
                    <Button
                      className="w-full rounded-xl sm:w-auto"
                      onClick={() => copyValue(payment.paymentNumber ?? "", "payment-number")}
                      type="button"
                      variant="outline"
                    >
                      <Copy className="h-4 w-4" />
                      {copiedField === "payment-number" ? "Tersalin" : "Salin nomor"}
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Nominal
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {formatIdrCurrency(payment.amount)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Nama
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    PT LIMBUNGAN MEDIA SOLUSI
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {instructionKind === "link" ? (
            <div className="mt-4 rounded-2xl bg-white/80 p-4">
              <p className="text-sm leading-6 text-slate-600">
                Metode ini perlu dibuka melalui halaman payment provider.
              </p>
              {canOpenProvider ? (
                <a
                  className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:w-auto"
                  href={payment.paymentUrl ?? undefined}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Buka pembayaran
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Akun sudah aktif.</p>
              <p className="mt-1 text-sm leading-6">
                Silakan login memakai email atau username dan password yang dibuat saat signup.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          className={cn(buttonVariants({ variant: "outline" }), "w-full rounded-xl sm:w-auto")}
          href="/signup"
        >
          Kembali ke signup
        </Link>
        <Link
          className={cn(buttonVariants({ variant: "ghost" }), "w-full rounded-xl sm:w-auto")}
          href="/login"
        >
          Ke halaman login
        </Link>
      </div>
    </div>
  );
}
