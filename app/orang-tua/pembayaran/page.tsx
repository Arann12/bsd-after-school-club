"use client";

import { useState, useRef, useEffect } from "react";
import { checkPaymentStatus, getPaymentMethods } from "@/lib/api/finance";

interface GatewayMethod {
  category: string;
  code: string;
  name: string;
  logo: string;
  status: string;
  fee?: number;
  fee_format?: string;
}

export default function PembayaranPage() {
  // Gateway Dynamic Methods State
  const [gatewayMethods, setGatewayMethods] = useState<GatewayMethod[]>([]);

  // Fetch Payment Methods from Gateway (auto-cached 2 mins in backend)
  useEffect(() => {
    async function loadMethods() {
      try {
        const res = await getPaymentMethods(false);
        if (res && res.data && Array.isArray(res.data)) {
          setGatewayMethods(res.data);
        }
      } catch (err) {
        console.warn("Gagal memuat metode pembayaran gateway:", err);
      }
    }
    loadMethods();
  }, []);

  // Modal Flow state
  // Steps: null | 'select_method' | 'payment_detail' | 'waiting_confirm' | 'success'
  const [modalStep, setModalStep] = useState<
    null | "select_method" | "payment_detail" | "waiting_confirm" | "success"
  >(null);

  // Type of package selected: 'per_pertemuan' | 'pelunasan'
  const [paymentType, setPaymentType] = useState<"per_pertemuan" | "pelunasan">("per_pertemuan");

  // Selected method: 'va' | 'ewallet' | 'qris' | 'cash'
  const [selectedMethod, setSelectedMethod] = useState<"va" | "ewallet" | "qris" | "cash">("va");

  // Selected bank for VA
  const [selectedBank, setSelectedBank] = useState<string>("BCA");
  const [selectedEwallet, setSelectedEwallet] = useState<string>("ShopeePay");

  const historyRef = useRef<HTMLDivElement>(null);

  // Detail modal for history items
  const [detailItem, setDetailItem] = useState<typeof historyList[number] | null>(null);

  // Copy VA feedback
  const [vaCopied, setVaCopied] = useState(false);

  // Uploaded proof file name for cash payment
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // Real Payment Gateway State
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [liveQrUrl, setLiveQrUrl] = useState<string | null>(null);
  const [liveVaNumber, setLiveVaNumber] = useState<string | null>(null);
  const [liveExpiredAt, setLiveExpiredAt] = useState<string | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Filter Gateway Methods based on category
  const vaGatewayList = gatewayMethods.filter((m) => m.category === "Virtual Account" && (m.status === "aktif" || m.status === "on"));
  const ewalletGatewayList = gatewayMethods.filter((m) => m.category === "E-Wallet" && (m.status === "aktif" || m.status === "on"));
  const qrisGatewayList = gatewayMethods.filter((m) => m.category === "QRIS" && (m.status === "aktif" || m.status === "on"));

  // History list state to demonstrate dynamic status updates
  const [historyList, setHistoryList] = useState([
    {
      id: "#INV-08-002",
      tanggal: "25 Ags 2024",
      keterangan: "Pertemuan 6",
      metode: "Cash (Di Cabang)",
      jumlah: "Rp 50.000",
      status: "Menunggu Verifikasi",
    },
    {
      id: "#INV-08-001",
      tanggal: "15 Ags 2024",
      keterangan: "Pertemuan 1 - 5 (Paket)",
      metode: "Virtual Account BCA",
      jumlah: "Rp 250.000",
      status: "Selesai",
    },
    {
      id: "#INV-07-015",
      tanggal: "01 Jul 2024",
      keterangan: "Biaya Pendaftaran & Seragam",
      metode: "QRIS",
      jumlah: "Rp 150.000",
      status: "Selesai",
    },
  ]);

  // Helper bank numbers
  const vaNumbers: Record<string, string> = {
    BCA: "1234 5678 9012 3456",
    BNI: "8271 9920 1283 4410",
    Mandiri: "8931 0029 4412 8821",
    BRI: "8102 7712 9901 2341",
  };

  const totalAmount = paymentType === "per_pertemuan" ? "Rp 100.000" : "Rp 300.000";
  const childName = "Andi Setiawan";
  const itemDescription = paymentType === "per_pertemuan" ? "Pertemuan 7 & 8" : "Pertemuan 7 - 12 (Sisa Paket)";

  const handleStartPayment = (type: "per_pertemuan" | "pelunasan") => {
    setPaymentType(type);
    setSelectedMethod("va");
    setSelectedBank("BCA");
    setSelectedEwallet("GoPay");
    setVaCopied(false);
    setUploadedFile(null);
    setModalStep("select_method");
  };

  const handleCopyVa = () => {
    const num = vaNumbers[selectedBank];
    navigator.clipboard.writeText(num.replace(/\s/g, ""));
    setVaCopied(true);
    setTimeout(() => setVaCopied(false), 2000);
  };

  const handleProceedToDetail = async () => {
    // Jika cash, langsung lanjut ke detail
    if (selectedMethod === "cash") {
      setModalStep("payment_detail");
      return;
    }

    setIsCharging(true);
    try {
      // Pastikan ada auth_token tersimpan untuk demo lokal
      let currentToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (!currentToken) {
        // Ambil token default orang tua jika belum login
        try {
          const authRes = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ email: "ortu@bsd.test", password: "password" }),
          });
          const authData = await authRes.json();
          if (authData.data && authData.data.token) {
            currentToken = authData.data.token;
            localStorage.setItem("auth_token", authData.data.token);
            localStorage.setItem("auth_user", JSON.stringify(authData.data.user));
          }
        } catch (e) {
          console.error("Auto login error:", e);
        }
      }

      // Tentukan payment channel yang valid untuk gateway
      let channel = "QRISNB";
      if (selectedMethod === "va") {
        channel = selectedBank === "BRI" ? "BRIVA" : selectedBank === "BNI" ? "BNIVA" : "BCVA";
      } else if (selectedMethod === "ewallet") {
        channel = selectedEwallet.toUpperCase();
      }

      // Inisiasi charge langsung dengan fetch agar robust
      const chargeRes = await fetch("http://127.0.0.1:8000/api/v1/payments/charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: currentToken ? `Bearer ${currentToken}` : "",
        },
        body: JSON.stringify({
          payment_plan_id: "01a0663a-025e-728c-8c20-b5cac0d238c2", // Tagihan aktif anak di database
          payment_method: selectedMethod === "va" ? "va" : selectedMethod === "qris" ? "qris" : "ewallet",
          payment_channel: channel,
        }),
      });

      const res = await chargeRes.json();

      if (res && res.data) {
        const inst = res.data.instructions;
        setActivePaymentId(res.data.payment?.id || null);
        if (inst.qr_url) setLiveQrUrl(inst.qr_url);
        if (inst.virtual_account) setLiveVaNumber(inst.virtual_account);
        if (inst.expired_at) setLiveExpiredAt(inst.expired_at);
      }
    } catch (err) {
      console.error("Gagal inisiasi payment gateway:", err);
    } finally {
      setIsCharging(false);
      setModalStep("payment_detail");
    }
  };

  const handleConfirmWaiting = () => {
    setModalStep("waiting_confirm");
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);

    if (activePaymentId) {
      try {
        await checkPaymentStatus(activePaymentId);
      } catch (err) {
        console.warn("Check status error:", err);
      }
    }

    setIsChecking(false);

    // Add new payment record to history
    const newInvId = `#INV-08-00${historyList.length + 1}`;
    const methodText =
      selectedMethod === "va"
        ? `Virtual Account ${selectedBank}`
        : selectedMethod === "qris"
        ? "QRIS (Nobu Bank)"
        : selectedMethod === "ewallet"
        ? `E-Wallet (${selectedEwallet})`
        : "Cash (Di Cabang)";

    setHistoryList([
      {
        id: newInvId,
        tanggal: "14 Sep 2026",
        keterangan: itemDescription,
        metode: methodText,
        jumlah: totalAmount,
        status: selectedMethod === "cash" ? "Menunggu Verifikasi" : "Selesai",
      },
      ...historyList,
    ]);

    setModalStep("success");
    setTimeout(() => {
      historyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseCheck {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes cardSelect {
          0% { transform: scale(0.97); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        .bank-card-btn {
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .bank-card-btn:active {
          transform: scale(0.96);
        }
        .bank-card-active {
          animation: cardSelect 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      {/* ── 1. TOP HEADER & CHILD SELECTOR ───────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", margin: 0, letterSpacing: "-0.02em" }}>
            Pembayaran
          </h1>
        </div>
      </div>

      {/* ── 2. TOP 3 STAT CARDS GRID ───────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {/* Card 1: TOTAL TAGIHAN TERTUNDA */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 14,
            padding: "20px 22px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            TOTAL TAGIHAN TERTUNDA
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#dc2626", lineHeight: 1.1 }}>
              Rp 150.000
            </div>
            <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 6, fontWeight: 500 }}>
              1 Tagihan belum dibayar
            </div>
          </div>
        </div>

        {/* Card 2: PROGRESS PERTEMUAN */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 14,
            padding: "20px 22px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            PROGRESS PERTEMUAN
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#1e293b", lineHeight: 1.1 }}>
              6 <span style={{ fontSize: 18, fontWeight: 600, color: "#94a3b8" }}>/12</span>
            </div>
            {/* Horizontal Progress Bar */}
            <div
              style={{
                width: "100%",
                height: 8,
                background: "#e2e8f0",
                borderRadius: 999,
                marginTop: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "50%",
                  height: "100%",
                  background: "#0e7490",
                  borderRadius: 999,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: STATUS PEMBAYARAN TERAKHIR */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 14,
            padding: "20px 22px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            STATUS PEMBAYARAN TERAKHIR
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#dcfce7",
                border: "1.5px solid #bbf7d0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#16a34a",
                flexShrink: 0,
              }}
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", lineHeight: 1.2 }}>
                Berhasil
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                25 Ags 2024
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. MIDDLE SECTION: 2 COLUMNS ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {/* LEFT COLUMN: Detail Program & Progress Pertemuan */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Card 1: Detail Program */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 14,
              padding: "20px 24px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", margin: 0 }}>
                Detail Program
              </h2>
              <span
                style={{
                  background: "#e0f2fe",
                  color: "#0369a1",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 999,
                }}
              >
                Aktif
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 2 }}>
                  Program
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>
                  Phonics Level 2
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 2 }}>
                  Total Pertemuan Paket
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>
                  12 Pertemuan
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 2 }}>
                  Harga per Pertemuan
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>
                  Rp 50.000
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Progress Pertemuan (Paket Aktif) */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 14,
              padding: "20px 24px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", margin: "0 0 16px 0" }}>
              Progress Pertemuan (Paket Aktif)
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Item 1: Pertemuan 1 - 5 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#22c55e", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }}>Pertemuan 1 - 5</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Selesai • Lunas</div>
                  </div>
                </div>
              </div>

              {/* Item 2: Pertemuan 6 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#f59e0b", margin: "4px", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }}>Pertemuan 6</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Hari ini • Phonics Review</div>
                  </div>
                </div>
                <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999 }}>
                  LUNAS
                </span>
              </div>

              {/* Item 3: Pertemuan 7 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", flexShrink: 0 }}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }}>Pertemuan 7</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>2 Sept 2024</div>
                  </div>
                </div>
                <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999 }}>
                  BELUM DIBAYAR
                </span>
              </div>

              {/* Item 4: Pertemuan 8 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", flexShrink: 0 }}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }}>Pertemuan 8</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>4 Sept 2024</div>
                  </div>
                </div>
                <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999 }}>
                  BELUM DIBAYAR
                </span>
              </div>

              {/* Item 5: Pertemuan 9 - 12 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, opacity: 0.75 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #e2e8f0", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#64748b" }}>Pertemuan 9 - 12</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>Jadwal mendatang</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tindakan Pembayaran */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", margin: 0 }}>
            Tindakan Pembayaran
          </h2>

          {/* Card 1: Bayar per Pertemuan */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 14,
              padding: "20px 24px",
              border: "1px solid #e2e8f0",
              borderTop: "4px solid #f59e0b",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", margin: 0 }}>
                Bayar per Pertemuan
              </h3>
              <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999 }}>
                2 Belum Dibayar
              </span>
            </div>

            <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, lineHeight: 1.4 }}>
              Bayar untuk pertemuan yang sudah berjalan atau akan datang.
            </p>

            <div style={{ background: "#f8fafc", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, border: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13.5, fontWeight: 700, color: "#334155" }}>
                <span>Pertemuan 7</span><span>Rp 50.000</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13.5, fontWeight: 700, color: "#334155" }}>
                <span>Pertemuan 8</span><span>Rp 50.000</span>
              </div>
              <div style={{ height: 1, background: "#e2e8f0", margin: "4px 0" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Total Dibayar</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#dc2626" }}>Rp 100.000</span>
              </div>
            </div>

            <button
              onClick={() => handleStartPayment("per_pertemuan")}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "#f59e0b",
                color: "#ffffff",
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 12px rgba(245,158,11,0.25)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#d97706")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f59e0b")}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              <span>Bayar Pertemuan (Rp 100k)</span>
            </button>
          </div>

          {/* Card 2: Lunasi Sisa Paket */}
          <div
            style={{
              background: "linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #06b6d4 100%)",
              borderRadius: 14,
              padding: "22px 24px",
              color: "#ffffff",
              boxShadow: "0 6px 18px rgba(14, 116, 144, 0.25)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255, 255, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="#ffffff" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>Lunasi Sisa Paket</h3>
            </div>

            <p style={{ fontSize: 12.5, color: "rgba(255, 255, 255, 0.9)", margin: 0, lineHeight: 1.4 }}>
              Bayar semua sisa pertemuan di paket ini sekaligus.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "rgba(255, 255, 255, 0.95)" }}>
                <span>Sisa Pertemuan (7-12)</span><span style={{ fontWeight: 700 }}>6 x Rp 50.000</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.9)" }}>Total Pelunasan</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: "#ffffff" }}>Rp 300.000</span>
              </div>
            </div>

            <button
              onClick={() => handleStartPayment("pelunasan")}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "#ffffff",
                color: "#0e7490",
                border: "none",
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transition: "all 0.15s ease",
                marginTop: 4,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
            >
              Lunasi Paket Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. BOTTOM SECTION 1: RIWAYAT PEMBAYARAN ─────────────────────── */}
      <div ref={historyRef} style={{ display: "flex", flexDirection: "column", gap: 14, scrollMarginTop: 80 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: 0 }}>
            Riwayat Pembayaran
          </h2>
          <button
            onClick={() => window.print()}
            style={{
              background: "transparent",
              border: "none",
              color: "#0284c7",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>Unduh Laporan</span>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>

        <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>ID TRANSAKSI</th>
                <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>TANGGAL</th>
                <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>KETERANGAN</th>
                <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>METODE</th>
                <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>JUMLAH</th>
                <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>STATUS</th>
                <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}></th>
              </tr>
            </thead>
            <tbody>
              {historyList.map((row, idx) => (
                <tr key={row.id + idx} style={{ borderBottom: idx < historyList.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <td style={{ padding: "16px 20px", fontSize: 13, fontFamily: "monospace", color: "#475569", fontWeight: 600 }}>{row.id}</td>
                  <td style={{ padding: "16px 20px", fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>{row.tanggal}</td>
                  <td style={{ padding: "16px 20px", fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>{row.keterangan}</td>
                  <td style={{ padding: "16px 20px", fontSize: 13, color: "#475569" }}>{row.metode}</td>
                  <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 800, color: "#1e293b" }}>{row.jumlah}</td>
                  <td style={{ padding: "16px 20px" }}>
                    {row.status === "Menunggu Verifikasi" ? (
                      <span style={{ background: "#fef3c7", color: "#b45309", fontSize: 11.5, fontWeight: 700, padding: "5px 12px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                        </svg>
                        Menunggu Verifikasi
                      </span>
                    ) : (
                      <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: 11.5, fontWeight: 700, padding: "5px 12px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Selesai
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <button
                      onClick={() => setDetailItem(row)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "6px 12px", borderRadius: 8,
                        background: "#f0f9ff", border: "1px solid #bae6fd",
                        color: "#0284c7", fontSize: 12, fontWeight: 700,
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#e0f2fe"; e.currentTarget.style.borderColor = "#7dd3fc"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#f0f9ff"; e.currentTarget.style.borderColor = "#bae6fd"; }}
                    >
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. BOTTOM SECTION 2: KEBIJAKAN PEMBAYARAN & KEHADIRAN ────────── */}
      <div style={{ background: "#f8fafc", borderRadius: 14, padding: "20px 24px", border: "1px solid #e2e8f0", display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontWeight: 700, fontSize: 15, flexShrink: 0, marginTop: 2 }}>
          i
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1e293b", margin: 0 }}>Kebijakan Pembayaran & Kehadiran</h3>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: "#475569", lineHeight: 1.5 }}>
            <li>Pembayaran tagihan maksimal dilakukan sebelum pertemuan dimulai.</li>
            <li>Pertemuan yang jatuh pada hari libur nasional (tanggal merah) tidak dikenakan biaya dan jadwal akan digeser ke pertemuan berikutnya.</li>
            <li>Jika anak izin (dengan pemberitahuan maksimal H-1), pertemuan dapat di-reschedule tanpa biaya tambahan (maksimal 2x per bulan).</li>
            <li><strong>Pembayaran Non-Cash (VA, QRIS, E-Wallet):</strong> Terverifikasi <strong>OTOMATIS LUNAS</strong> secara instan oleh sistem payment gateway.</li>
            <li><strong>Pembayaran Cash (Tunai):</strong> Menunggu proses <strong>ACC / Verifikasi Kasir Admin</strong> di cabang.</li>
          </ul>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ── MODAL PEMBAYARAN MULTI-STEP ANIMATED SEQUENCE ─────────────────── */}
      {/* =================================================================== */}
      {modalStep !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 18,
              maxWidth: 520,
              width: "100%",
              padding: 24,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              animation: "modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* ── STEP 1: PILIH METODE PEMBAYARAN ── */}
            {modalStep === "select_method" && (
              <div>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0 }}>
                    Pilih Metode Pembayaran
                  </h3>
                  <button
                    onClick={() => setModalStep(null)}
                    style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: 4 }}
                  >
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px 0", lineHeight: 1.4 }}>
                  Pilih metode pembayaran untuk melunasi tagihan pertemuan yang dipilih.
                </p>

                {/* Ringkasan Tagihan */}
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", marginBottom: 18, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                    RINGKASAN TAGIHAN
                  </div>
                  {paymentType === "per_pertemuan" ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                        <span>Pertemuan 7</span><span>Rp 50.000</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 10 }}>
                        <span>Pertemuan 8</span><span>Rp 50.000</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 10 }}>
                      <span>Sisa Pertemuan (7-12)</span><span>6 x Rp 50.000</span>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0", paddingTop: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>Total Pembayaran</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#0e7490" }}>{totalAmount}</span>
                  </div>
                </div>

                {/* Payment Options List — Midtrans/Xendit style */}
                <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 24, border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
                  {/* Option 1: Virtual Account */}
                  {(() => {
                    const isSelected = selectedMethod === "va";
                    return (
                    <div
                      onClick={() => setSelectedMethod("va")}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 16px",
                        background: isSelected ? "#f0f9ff" : "#ffffff",
                        borderBottom: "1px solid #f1f5f9",
                        cursor: "pointer", transition: "all 0.15s ease",
                      }}
                    >
                      {/* Radio */}
                      <div style={{ width: 20, height: 20, borderRadius: "50%", border: isSelected ? "2px solid #0e7490" : "2px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#fff", transition: "border-color 0.15s" }}>
                        {isSelected && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#0e7490" }} />}
                      </div>
                      {/* Icon */}
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f0f9ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#0e7490" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                      </div>
                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Transfer Bank (VA)</div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>BCA, Mandiri, BNI, BRI</div>
                      </div>
                      {/* Brand logos */}
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        {vaGatewayList.length > 0 ? (
                          vaGatewayList.slice(0, 4).map((b) => (
                            <div key={b.code} style={{ width: 32, height: 22, borderRadius: 5, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                              <img src={b.logo} alt={b.name} style={{ width: 22, height: 16, objectFit: "contain" }} />
                            </div>
                          ))
                        ) : (
                          [
                            { src: "/logo%20pembayaran/BCA.webp", name: "BCA" },
                            { src: "/logo%20pembayaran/mandiri.png", name: "Mandiri" },
                            { src: "/logo%20pembayaran/BNI.webp", name: "BNI" },
                            { src: "/logo%20pembayaran/BRI.png", name: "BRI" },
                          ].map(b => (
                            <div key={b.name} style={{ width: 32, height: 22, borderRadius: 5, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                              <img src={b.src} alt={b.name} style={{ width: 22, height: 16, objectFit: "contain" }} />
                            </div>
                          ))
                        )}
                      </div>
                      {/* Chevron */}
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                    </div>
                    );
                  })()}

                  {/* Option 2: E-Wallet */}
                  {(() => {
                    const isSelected = selectedMethod === "ewallet";
                    return (
                    <div
                      onClick={() => setSelectedMethod("ewallet")}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 16px",
                        background: isSelected ? "#f0fdf4" : "#ffffff",
                        borderBottom: "1px solid #f1f5f9",
                        cursor: "pointer", transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ width: 20, height: 20, borderRadius: "50%", border: isSelected ? "2px solid #059669" : "2px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#fff" }}>
                        {isSelected && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#059669" }} />}
                      </div>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" /><path d="M4 6v12c0 1.1.9 2 2 2h14v-4" /><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>E-Wallet</div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>GoPay, OVO, ShopeePay, DANA</div>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        {ewalletGatewayList.length > 0 ? (
                          ewalletGatewayList.slice(0, 4).map((w) => (
                            <div key={w.code} style={{ width: 32, height: 22, borderRadius: 5, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                              <img src={w.logo} alt={w.name} style={{ width: 22, height: 16, objectFit: "contain" }} />
                            </div>
                          ))
                        ) : (
                          [
                            { src: "/logo%20pembayaran/gopay.webp", name: "GoPay" },
                            { src: "/logo%20pembayaran/ovo.jpg", name: "OVO" },
                            { src: "/logo%20pembayaran/shopeepay.webp", name: "ShopeePay" },
                            { src: "/logo%20pembayaran/Dana.webp", name: "DANA" },
                          ].map(w => (
                            <div key={w.name} style={{ width: 32, height: 22, borderRadius: 5, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                              <img src={w.src} alt={w.name} style={{ width: 22, height: 16, objectFit: "contain" }} />
                            </div>
                          ))
                        )}
                      </div>
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                    </div>
                    );
                  })()}

                  {/* Option 3: QRIS */}
                  {(() => {
                    const isSelected = selectedMethod === "qris";
                    return (
                    <div
                      onClick={() => setSelectedMethod("qris")}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 16px",
                        background: isSelected ? "#fef2f2" : "#ffffff",
                        borderBottom: "1px solid #f1f5f9",
                        cursor: "pointer", transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ width: 20, height: 20, borderRadius: "50%", border: isSelected ? "2px solid #ED1C24" : "2px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#fff" }}>
                        {isSelected && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ED1C24" }} />}
                      </div>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {/* QRIS logo style */}
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 900, color: "#ED1C24", letterSpacing: "-0.02em" }}>QR</span>
                          <span style={{ fontSize: 11, fontWeight: 900, color: "#ED1C24", letterSpacing: "-0.02em", marginLeft: 1 }}>IS</span>
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>QRIS</div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>Semua bank & e-wallet</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                        {qrisGatewayList.length > 0 && qrisGatewayList[0].logo ? (
                          <div style={{ width: 32, height: 22, borderRadius: 5, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                            <img src={qrisGatewayList[0].logo} alt="QRIS" style={{ width: 22, height: 16, objectFit: "contain" }} />
                          </div>
                        ) : (
                          <div style={{ background: "#f1f5f9", borderRadius: 6, padding: "3px 8px" }}>
                            <span style={{ fontSize: 9, fontWeight: 700, color: "#64748b" }}>ALL</span>
                          </div>
                        )}
                      </div>
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                    </div>
                    );
                  })()}

                  {/* Option 4: Cash */}
                  {(() => {
                    const isSelected = selectedMethod === "cash";
                    return (
                    <div
                      onClick={() => setSelectedMethod("cash")}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 16px",
                        background: isSelected ? "#f0fdf4" : "#ffffff",
                        cursor: "pointer", transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ width: 20, height: 20, borderRadius: "50%", border: isSelected ? "2px solid #16a34a" : "2px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#fff" }}>
                        {isSelected && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#16a34a" }} />}
                      </div>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Tunai (Cash)</div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>Bayar langsung di lokasi</div>
                      </div>
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                    </div>
                    );
                  })()}
                </div>

                {/* Footer Buttons */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 12 }}>
                  <button
                    onClick={() => setModalStep(null)}
                    style={{
                      padding: "12px",
                      background: "#ffffff",
                      color: "#64748b",
                      border: "1px solid #cbd5e1",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleProceedToDetail}
                    disabled={isCharging}
                    style={{
                      padding: "12px",
                      background: isCharging ? "#fbbf24" : "#f59e0b",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: isCharging ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 12px rgba(245,158,11,0.25)",
                    }}
                  >
                    {isCharging ? "Menghubungkan Gateway..." : "Lanjutkan Pembayaran"}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: PEMBAYARAN DETAIL (VIRTUAL ACCOUNT / QRIS / CASH) ── */}
            {modalStep === "payment_detail" && (
              <div>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0 }}>
                    {selectedMethod === "va"
                      ? "Pembayaran Virtual Account"
                      : selectedMethod === "qris"
                      ? "Pembayaran QRIS"
                      : selectedMethod === "ewallet"
                      ? "Pembayaran E-Wallet"
                      : "Pembayaran Cash / Tunai"}
                  </h3>
                  <button
                    onClick={() => setModalStep(null)}
                    style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: 4 }}
                  >
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px 0", lineHeight: 1.4 }}>
                  Silakan selesaikan pembayaran menggunakan {selectedMethod === "va" ? "Virtual Account" : selectedMethod.toUpperCase()} sebelum batas waktu pembayaran.
                </p>

                {/* Ringkasan Pembayaran Box */}
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", marginBottom: 18, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                    RINGKASAN PEMBAYARAN
                  </div>
                  {paymentType === "per_pertemuan" ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                        <span>Pertemuan 7</span><span>Rp 50.000</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 10 }}>
                        <span>Pertemuan 8</span><span>Rp 50.000</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 10 }}>
                      <span>Sisa Pertemuan (7-12)</span><span>6 x Rp 50.000</span>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0", paddingTop: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>Total Pembayaran</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#0e7490" }}>{totalAmount}</span>
                  </div>
                </div>

                {/* ── DETAILS FOR VIRTUAL ACCOUNT ── */}
                {selectedMethod === "va" && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                      PILIH BANK
                    </div>

                    {/* Bank Grid Selector — branded cards with real logos */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 16 }}>
                      {vaGatewayList.length > 0 ? (
                        vaGatewayList.map((bank) => {
                          const bankKey = bank.code.replace("VA", "");
                          const isActive = selectedBank.toUpperCase() === bankKey || selectedBank.toUpperCase() === bank.code;
                          return (
                            <button
                              key={bank.code}
                              onClick={() => setSelectedBank(bankKey)}
                              className={`bank-card-btn ${isActive ? "bank-card-active" : ""}`}
                              style={{
                                padding: "12px", borderRadius: 12, textAlign: "left",
                                border: isActive ? `2px solid #0066B3` : "1px solid #e2e8f0",
                                background: isActive ? "#DBEAFE" : "#ffffff",
                                cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 10,
                              }}
                            >
                              <div style={{ width: 42, height: 42, borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: isActive ? `0 4px 12px rgba(0,102,179,0.2)` : "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                                <img src={bank.logo} alt={bank.name} style={{ width: 34, height: 34, objectFit: "contain" }} />
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? "#0066B3" : "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{bank.name}</div>
                                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{bank.fee_format ? `Fee: ${bank.fee_format}` : "Virtual Account"}</div>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        ([
                          { id: "BCA" as const, name: "Bank Central Asia", method: "m-BCA / KlikBCA / ATM", color: "#0066B3", selectedBg: "#DBEAFE", logo: "/logo%20pembayaran/BCA.webp" },
                          { id: "BNI" as const, name: "Bank Negara Indonesia", method: "iBanking BNI / ATM", color: "#F58220", selectedBg: "#FFE8CC", logo: "/logo%20pembayaran/BNI.webp" },
                          { id: "Mandiri" as const, name: "Bank Mandiri", method: "Livin' by Mandiri / ATM", color: "#FFB81C", selectedBg: "#FFF3CC", logo: "/logo%20pembayaran/mandiri.png" },
                          { id: "BRI" as const, name: "Bank Rakyat Indonesia", method: "BRImo / ATM", color: "#003D6B", selectedBg: "#CCE0F2", logo: "/logo%20pembayaran/BRI.png" },
                        ]).map((bank) => {
                          const isActive = selectedBank === bank.id;
                          return (
                          <button
                            key={bank.id}
                            onClick={() => setSelectedBank(bank.id)}
                            className={`bank-card-btn ${isActive ? "bank-card-active" : ""}`}
                            style={{
                              padding: "12px", borderRadius: 12, textAlign: "left",
                              border: isActive ? `2px solid ${bank.color}` : "1px solid #e2e8f0",
                              background: isActive ? bank.selectedBg : "#ffffff",
                              cursor: "pointer",
                              display: "flex", alignItems: "center", gap: 10,
                            }}
                          >
                            <div style={{ width: 42, height: 42, borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: isActive ? `0 4px 12px ${bank.color}33` : "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                              <img src={bank.logo} alt={bank.name} style={{ width: 34, height: 34, objectFit: "contain" }} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? bank.color : "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{bank.name}</div>
                              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{bank.method}</div>
                            </div>
                          </button>
                          );
                        })
                      )}
                    </div>

                    {/* Virtual Account Number Container */}
                    <div
                      style={{
                        background: "#f8fafc",
                        borderRadius: 12,
                        padding: "16px",
                        textAlign: "center",
                        border: "1px solid #e2e8f0",
                        marginBottom: 20,
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                        NOMOR VIRTUAL ACCOUNT
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <span style={{ fontSize: 22, fontWeight: 800, color: "#0e7490", letterSpacing: "0.04em" }}>
                          {liveVaNumber || vaNumbers[selectedBank]}
                        </span>
                        <button
                          onClick={handleCopyVa}
                          title="Salin Nomor VA"
                          style={{
                            background: "#e0f2fe",
                            border: "none",
                            borderRadius: 6,
                            padding: "6px 10px",
                            cursor: "pointer",
                            color: "#0284c7",
                            fontSize: 12,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          <span>{vaCopied ? "Tersalin!" : ""}</span>
                        </button>
                      </div>

                      <div style={{ fontSize: 13, color: "#475569", marginTop: 8, fontWeight: 600 }}>
                        Total: <strong>{totalAmount}</strong>
                      </div>
                      <div style={{ fontSize: 12, color: "#dc2626", fontWeight: 700, marginTop: 4 }}>
                        {liveExpiredAt ? `Bayar sebelum ${new Date(liveExpiredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} WIB` : "Bayar sebelum 27 Agustus 2024, 23:59"}
                      </div>
                    </div>
                  </>
                )}

                {/* ── DETAILS FOR CASH (UPLOAD BUKTI) ── */}
                {selectedMethod === "cash" && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 }}>
                      Upload Bukti Pembayaran / Struk Tunai:
                    </div>
                    <label
                      style={{
                        border: "2px dashed #0e7490",
                        borderRadius: 12,
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f0f9ff",
                        cursor: "pointer",
                        gap: 8,
                      }}
                    >
                      <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#0e7490" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0e7490" }}>
                        {uploadedFile ? uploadedFile : "Klik untuk memilih file bukti bayar (PNG / JPG / PDF)"}
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setUploadedFile(e.target.files[0].name);
                          }
                        }}
                      />
                    </label>
                  </div>
                )}

                {/* ── DETAILS FOR QRIS ── */}
                {selectedMethod === "qris" && (
                  <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
                    {/* QRIS Logo */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
                      {qrisGatewayList.length > 0 && qrisGatewayList[0].logo ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1px solid #e2e8f0", padding: "6px 16px", borderRadius: 8 }}>
                          <img src={qrisGatewayList[0].logo} alt="QRIS" style={{ height: 26, objectFit: "contain" }} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{qrisGatewayList[0].name}</span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", background: "#ED1C24", borderRadius: 8, padding: "6px 16px", gap: 2 }}>
                          <svg width={20} height={20} viewBox="0 0 24 24" fill="#fff">
                            <rect x="1" y="1" width="9" height="9" rx="1" /><rect x="3" y="3" width="5" height="5" rx="0.5" fill="#ED1C24" /><rect x="4" y="4" width="3" height="3" rx="0.5" fill="#fff" />
                            <rect x="14" y="1" width="9" height="9" rx="1" /><rect x="16" y="3" width="5" height="5" rx="0.5" fill="#ED1C24" /><rect x="17" y="4" width="3" height="3" rx="0.5" fill="#fff" />
                            <rect x="1" y="14" width="9" height="9" rx="1" /><rect x="3" y="16" width="5" height="5" rx="0.5" fill="#ED1C24" /><rect x="4" y="17" width="3" height="3" rx="0.5" fill="#fff" />
                            <rect x="14" y="14" width="4" height="4" rx="0.5" /><rect x="20" y="14" width="3" height="3" rx="0.5" /><rect x="14" y="20" width="3" height="3" rx="0.5" /><rect x="19" y="19" width="4" height="4" rx="0.5" />
                          </svg>
                          <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "0.06em" }}>QRIS</span>
                        </div>
                      )}
                    </div>
                    <div style={{ background: "#ffffff", padding: 20, display: "inline-block", borderRadius: 16, border: "2px solid #e2e8f0", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", marginBottom: 14 }}>
                      {liveQrUrl ? (
                        <img
                          src={liveQrUrl}
                          alt="QRIS Nobu Bank"
                          style={{ width: 180, height: 180, objectFit: "contain", borderRadius: 8 }}
                        />
                      ) : (
                        <svg width={160} height={160} viewBox="0 0 100 100" fill="#1e293b">
                          <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" />
                          <path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" />
                          <path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                          <rect x="40" y="40" width="20" height="20" fill="#ED1C24" />
                          <rect x="10" y="40" width="10" height="10" />
                          <rect x="80" y="50" width="10" height="20" />
                          <rect x="50" y="10" width="20" height="10" />
                          <rect x="40" y="80" width="30" height="10" />
                          <rect x="60" y="60" width="10" height="10" />
                          <rect x="40" y="65" width="8" height="8" />
                          <rect x="70" y="30" width="8" height="8" />
                        </svg>
                      )}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>Scan QRIS ini dengan:</div>
                    <div style={{ display: "flex", justifyContent: "center", gap: 5, flexWrap: "wrap" }}>
                      {[
                        { n: "m-BCA", c: "#0066B3" }, { n: "BRImo", c: "#003D6B" },
                        { n: "OVO", c: "#4C3494" }, { n: "GoPay", c: "#00AA13" },
                        { n: "ShopeePay", c: "#EE4D2D" }, { n: "DANA", c: "#108EE9" },
                        { n: "LinkAja", c: "#E4002B" },
                      ].map(a => (
                        <span key={a.n} style={{ fontSize: 10, fontWeight: 700, color: a.c, background: `${a.c}12`, padding: "4px 10px", borderRadius: 6, border: `1px solid ${a.c}20` }}>{a.n}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── DETAILS FOR E-WALLET ── */}
                {selectedMethod === "ewallet" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
                    {ewalletGatewayList.length > 0 ? (
                      ewalletGatewayList.map((ew) => {
                        const isActive = selectedEwallet.toUpperCase() === ew.code.toUpperCase() || selectedEwallet.toUpperCase() === ew.name.toUpperCase();
                        return (
                          <button
                            key={ew.code}
                            onClick={() => setSelectedEwallet(ew.code)}
                            className={`bank-card-btn ${isActive ? "bank-card-active" : ""}`}
                            style={{
                              padding: "12px", borderRadius: 12, textAlign: "left",
                              border: isActive ? `2px solid #059669` : "1px solid #e2e8f0",
                              background: isActive ? "#D1FADF" : "#ffffff",
                              cursor: "pointer",
                              display: "flex", alignItems: "center", gap: 10,
                            }}
                          >
                            <div style={{ width: 42, height: 42, borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: isActive ? "0 4px 12px rgba(5,150,105,0.2)" : "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                              <img src={ew.logo} alt={ew.name} style={{ width: 34, height: 34, objectFit: "contain" }} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? "#059669" : "#1e293b" }}>{ew.name}</div>
                              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ew.fee_format ? `Fee: ${ew.fee_format}` : "E-Wallet"}</div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      ([
                        { name: "GoPay" as const, fullName: "GoPay", color: "#00AA13", selectedBg: "#D1FADF", desc: "Bayar via Gojek App", logo: "/logo%20pembayaran/gopay.webp" },
                        { name: "OVO" as const, fullName: "OVO", color: "#4C3494", selectedBg: "#E2DDF6", desc: "Bayar via OVO App", logo: "/logo%20pembayaran/ovo.jpg" },
                        { name: "ShopeePay" as const, fullName: "ShopeePay", color: "#EE4D2D", selectedBg: "#FDDDD5", desc: "Bayar via Shopee App", logo: "/logo%20pembayaran/shopeepay.webp" },
                        { name: "DANA" as const, fullName: "DANA", color: "#108EE9", selectedBg: "#D4ECFC", desc: "Bayar via DANA App", logo: "/logo%20pembayaran/Dana.webp" },
                      ]).map((ew) => {
                        const isActive = selectedEwallet === ew.name;
                        return (
                        <button
                          key={ew.name}
                          onClick={() => setSelectedEwallet(ew.name)}
                          className={`bank-card-btn ${isActive ? "bank-card-active" : ""}`}
                          style={{
                            padding: "12px", borderRadius: 12, textAlign: "left",
                            border: isActive ? `2px solid ${ew.color}` : `1px solid ${ew.color}30`,
                            background: isActive ? ew.selectedBg : "#ffffff",
                            cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 10,
                          }}
                        >
                          <div style={{ width: 42, height: 42, borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: isActive ? `0 4px 12px ${ew.color}33` : "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                            <img src={ew.logo} alt={ew.name} style={{ width: 34, height: 34, objectFit: "contain" }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: ew.color }}>{ew.fullName}</div>
                            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ew.desc}</div>
                          </div>
                        </button>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Footer Action Buttons */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 12 }}>
                  <button
                    onClick={() => setModalStep("select_method")}
                    style={{
                      padding: "12px",
                      background: "#ffffff",
                      color: "#64748b",
                      border: "1px solid #cbd5e1",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleConfirmWaiting}
                    style={{
                      padding: "12px",
                      background: "#f59e0b",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(245,158,11,0.25)",
                    }}
                  >
                    Bayar
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: MENUNGGU KONFIRMASI PEMBAYARAN (ANIMATED LOADER) ── */}
            {modalStep === "waiting_confirm" && (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0, width: "100%", textAlign: "center" }}>
                    Menunggu Konfirmasi Pembayaran
                  </h3>
                  <button
                    onClick={() => setModalStep(null)}
                    style={{ position: "absolute", right: 24, top: 24, background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}
                  >
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Animated Spinner Ring */}
                <div style={{ margin: "20px auto 16px", display: "flex", justifyContent: "center" }}>
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: "50%",
                      border: "5px solid #e2e8f0",
                      borderTopColor: "#0e7490",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                </div>

                <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px 0", lineHeight: 1.4, padding: "0 20px" }}>
                  Sistem sedang menunggu konfirmasi dari penyedia pembayaran.
                </p>

                {/* Ringkasan Tagihan Box */}
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", marginBottom: 24, border: "1px solid #e2e8f0", textAlign: "left" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                    RINGKASAN TAGIHAN
                  </div>
                  {paymentType === "per_pertemuan" ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                        <span>Pertemuan 7</span><span>Rp 50.000</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 10 }}>
                        <span>Pertemuan 8</span><span>Rp 50.000</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 10 }}>
                      <span>Sisa Pertemuan (7-12)</span><span>6 x Rp 50.000</span>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0", paddingTop: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>Total Pembayaran</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#0e7490" }}>{totalAmount}</span>
                  </div>
                </div>

                {/* Action Button: Cek Status Pembayaran */}
                <button
                  onClick={handleCheckStatus}
                  disabled={isChecking}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: isChecking ? "#fbbf24" : "#f59e0b",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: isChecking ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(245,158,11,0.25)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#d97706")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#f59e0b")}
                >
                  {isChecking ? "Memeriksa Status..." : "Cek Status Pembayaran"}
                </button>
              </div>
            )}

            {/* ── STEP 4: SUCCESS CONFIRMATION ── */}
            {modalStep === "success" && (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "#dcfce7",
                    color: "#16a34a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    animation: "pulseCheck 0.4s ease-out",
                  }}
                >
                  <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", marginBottom: 6 }}>
                  {selectedMethod === "cash" ? "Bukti Cash Terkirim!" : "Pembayaran Otomatis Lunas!"}
                </h3>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.5 }}>
                  {selectedMethod === "cash" ? (
                    <>
                      Bukti pembayaran tunai sebesar <strong>{totalAmount}</strong> untuk <strong>{childName}</strong> telah berhasil terkirim. Status saat ini: <strong>Menunggu ACC / Verifikasi Kasir Admin</strong>.
                    </>
                  ) : (
                    <>
                      Transaksi sebesar <strong>{totalAmount}</strong> untuk <strong>{childName}</strong> telah <strong>terverifikasi OTOMATIS LUNAS</strong> oleh sistem Payment Gateway.
                    </>
                  )}
                </p>

                <button
                  onClick={() => setModalStep(null)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#0e7490",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Selesai
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DETAIL RIWAYAT MODAL ── */}
      {detailItem && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)",
            zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16, animation: "fadeIn 0.2s ease-out",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setDetailItem(null); }}
        >
          <div
            style={{
              background: "#fff", borderRadius: 18, maxWidth: 480, width: "100%", padding: 24,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              animation: "modalSlideUp 0.25s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1e293b", margin: 0 }}>Detail Transaksi</h3>
              <button onClick={() => setDetailItem(null)} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: 4 }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Status Badge */}
            <div style={{ marginBottom: 16 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 8,
                background: detailItem.status === "Selesai" ? "#dcfce7" : "#fef3c7",
                color: detailItem.status === "Selesai" ? "#16a34a" : "#b45309",
              }}>
                {detailItem.status === "Selesai" ? (
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 22h14M5 2h14" /><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                )}
                {detailItem.status}
              </span>
            </div>

            {/* Detail Fields */}
            {[
              { label: "ID Transaksi", value: detailItem.id, mono: true },
              { label: "Tanggal", value: detailItem.tanggal },
              { label: "Keterangan", value: detailItem.keterangan },
              { label: "Metode Pembayaran", value: detailItem.metode },
              { label: "Anak", value: childName },
              { label: "Program", value: "Phonics Level 2" },
            ].map((field) => (
              <div key={field.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 12.5, color: "#64748b", fontWeight: 600 }}>{field.label}</span>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", fontFamily: field.mono ? "monospace" : "inherit" }}>{field.value}</span>
              </div>
            ))}

            {/* Total */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0 0" }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }}>Total Pembayaran</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#0e7490" }}>{detailItem.jumlah}</span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setDetailItem(null)}
              style={{
                width: "100%", marginTop: 20, padding: "11px",
                background: "#ffffff", color: "#64748b",
                border: "1px solid #cbd5e1", borderRadius: 10,
                fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
