"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useEffect } from "react";
import { chargePayment, checkPaymentStatus, getPaymentMethods, getPaymentPlans, getPayments } from "@/lib/api/finance";
import { getStudents } from "@/lib/api/students";
import { getMyParentProfile } from "@/lib/api/parents";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { printReceipt } from "@/lib/utils/printReceipt";
import { formatRupiah } from "@/lib/constants";

interface PanduanItem {
  title?: string;
  name?: string;
  channel?: string;
  method?: string;
  steps?: string[];
  content?: string | string[];
  notes?: string;
  catatan?: string;
  note?: string;
}

interface GatewayMethod {
  category: string;
  code: string;
  name: string;
  logo: string;
  status: string;
  fee?: number;
  fee_format?: string;
  panduan?: PanduanItem[] | Record<string, string[]> | string;
}

export default function PembayaranPage() {
  // Gateway Dynamic Methods State
  const [gatewayMethods, setGatewayMethods] = useState<GatewayMethod[]>([]);
  const [expandedGuideIndex, setExpandedGuideIndex] = useState<number | null>(null);

  // Dynamic Backend Data State
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [paymentPlans, setPaymentPlans] = useState<any[]>([]);
  const [paymentsHistory, setPaymentsHistory] = useState<any[]>([]);
  const [isLoadingFinance, setIsLoadingFinance] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  const loadFinanceData = async (studentId?: string, isSilent: boolean = false) => {
    if (!isSilent) setIsLoadingFinance(true);
    try {
      const activeStudent = studentId !== undefined ? studentId : selectedStudentId;
      const [plansRes, paymentsRes] = await Promise.allSettled([
        getPaymentPlans({ student_id: activeStudent || undefined, per_page: 50 }),
        getPayments({ student_id: activeStudent || undefined, per_page: 20 }),
      ]);

      if (plansRes.status === "fulfilled" && plansRes.value) {
        const rawPlans = (plansRes.value as any)?.data?.data || (plansRes.value as any)?.data || [];
        setPaymentPlans(Array.isArray(rawPlans) ? rawPlans : []);
      }
      if (paymentsRes.status === "fulfilled" && paymentsRes.value) {
        const rawPayments = (paymentsRes.value as any)?.data?.data || (paymentsRes.value as any)?.data || [];
        setPaymentsHistory(Array.isArray(rawPayments) ? rawPayments : []);
      }
    } catch (err) {
      console.warn("Gagal memuat data finance:", err);
    } finally {
      if (!isSilent) setIsLoadingFinance(false);
    }
  };

  // Realtime periodic background sync (setiap 6 detik jika tab aktif)
  useEffect(() => {
    if (!selectedStudentId) return;

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadFinanceData(selectedStudentId, true);
      }
    }, 6000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadFinanceData(selectedStudentId, true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [selectedStudentId]);

  // Fetch Students list on mount (load cepat & non-blocking)
  useEffect(() => {
    async function initData() {
      try {
        const [parentRes, studentsRes] = await Promise.allSettled([
          getMyParentProfile(),
          getStudents({ per_page: 20 }),
        ]);

        let studentArray: any[] = [];
        if (parentRes.status === "fulfilled" && parentRes.value?.students && parentRes.value.students.length > 0) {
          studentArray = parentRes.value.students.map((s) => ({
            id: s.id,
            name: s.name,
            full_name: s.name,
            studentCode: s.studentCode,
            relation: s.relation,
          }));
        } else if (studentsRes.status === "fulfilled" && studentsRes.value) {
          const rawStudents = (studentsRes.value as any)?.data || (studentsRes.value as any) || [];
          studentArray = Array.isArray(rawStudents)
            ? rawStudents.map((s: any) => ({
                id: s.id,
                name: s.name || s.full_name || s.studentCode || "Siswa",
                full_name: s.full_name || s.name || "Siswa",
                studentCode: s.studentCode || s.student_code,
              }))
            : [];
        }

        setStudents(studentArray);

        let initialStudentId = "";
        if (studentArray.length > 0) {
          initialStudentId = studentArray[0].id;
          setSelectedStudentId(initialStudentId);
          // Langsung muat data tagihan siswa tanpa tertahan oleh gateway eksternal
          loadFinanceData(initialStudentId);
        }
      } catch (err) {
        console.warn("Gagal inisialisasi data:", err);
      } finally {
        setIsInitialLoading(false);
      }

      // Ambil daftar metode pembayaran secara background agar tidak menghambat load awal
      getPaymentMethods(true)
        .then((methodsRes) => {
          if (methodsRes?.data && Array.isArray(methodsRes.data)) {
            setGatewayMethods(methodsRes.data);
          }
        })
        .catch((e) => console.warn("Background fetch methods:", e));
    }
    initData();
  }, []);

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    loadFinanceData(studentId);
  };

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
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Detail modal for history items
  const [detailItem, setDetailItem] = useState<typeof historyList[number] | null>(null);

  // Copy VA feedback
  const [vaCopied, setVaCopied] = useState(false);

  // Cash payment state no longer needed — cash handled at front desk only

  // Real Payment Gateway State
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [liveQrUrl, setLiveQrUrl] = useState<string | null>(null);
  const [liveVaNumber, setLiveVaNumber] = useState<string | null>(null);
  const [liveCheckoutUrl, setLiveCheckoutUrl] = useState<string | null>(null);
  const [liveExpiredAt, setLiveExpiredAt] = useState<string | null>(null);
  const [liveFee, setLiveFee] = useState<number | null>(null);
  const [liveAmount, setLiveAmount] = useState<number | null>(null);
  const [liveTotalAmount, setLiveTotalAmount] = useState<number | null>(null);
  const [lastSuccessAmount, setLastSuccessAmount] = useState<string>("");
  const [isCharging, setIsCharging] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  // Filter Gateway Methods based on category
  const vaGatewayList = gatewayMethods.filter((m) => m.category === "Virtual Account" && (m.status === "aktif" || m.status === "on"));
  const ewalletGatewayList = gatewayMethods.filter((m) => m.category === "E-Wallet" && (m.status === "aktif" || m.status === "on"));
  const qrisGatewayList = gatewayMethods.filter((m) => m.category === "QRIS" && (m.status === "aktif" || m.status === "on"));

  // History list state
  const [historyList, setHistoryList] = useState<any[]>([]);

  // Dynamic calculations from real Payment Plans
  const paidPlans = paymentPlans.filter((p) => p.is_paid || p.status === "paid");
  const unpaidPlans = paymentPlans.filter((p) => !p.is_paid && p.status !== "paid");
  const totalSessionsCount = paymentPlans.length > 0 ? paymentPlans.length : 0;
  const completedSessionsCount = paidPlans.length;
  const progressPercent = totalSessionsCount > 0 ? Math.round((completedSessionsCount / totalSessionsCount) * 100) : 0;

  const totalUnpaidNominal = unpaidPlans.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const nextUnpaidSession = unpaidPlans[0] || null;
  const nextUnpaidSessions = nextUnpaidSession ? [nextUnpaidSession] : [];
  const nextUnpaidNominal = nextUnpaidSession ? (Number(nextUnpaidSession.amount) || 0) : 0;

  // Active target plan ID to charge
  const targetPlanId = nextUnpaidSession?.id || unpaidPlans[0]?.id || null;

  // Track pending cash submissions to prevent double submit and 422 errors
  const pendingCashPlanIds = new Set<string>();
  paymentsHistory.forEach((p: any) => {
    if (p.payment_method === "cash" && p.payment_status === "pending" && p.payment_plan_id) {
      pendingCashPlanIds.add(p.payment_plan_id);
    }
  });
  paymentPlans.forEach((plan: any) => {
    if (plan.cash_transactions?.some((c: any) => c.status === "menunggu_konfirmasi_admin")) {
      pendingCashPlanIds.add(plan.id);
    }
  });

  const nextUnpaidIsPendingCash = nextUnpaidSession ? pendingCashPlanIds.has(nextUnpaidSession.id) : false;

  const totalAmount =
    paymentType === "per_pertemuan"
      ? formatRupiah(nextUnpaidNominal)
      : formatRupiah(totalUnpaidNominal);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const childName =
    selectedStudent?.name ||
    selectedStudent?.full_name ||
    paymentPlans[0]?.enrollment?.student?.full_name ||
    paymentPlans[0]?.enrollment?.student?.name ||
    "Siswa";
  const programName =
    paymentPlans[0]?.enrollment?.program?.name ||
    (selectedStudent as any)?.program?.name ||
    (selectedStudent as any)?.enrollment?.program?.name ||
    (paymentPlans.length > 0 ? "Program Belajar" : "Belum Ada Program Aktif");
  const levelName =
    paymentPlans[0]?.enrollment?.program_level?.name ||
    paymentPlans[0]?.enrollment?.programLevel?.name ||
    (paymentPlans.length > 0 ? "Reguler" : "–");

  const formattedHistoryList = paymentsHistory.map((p) => {
    let statusLabel = "Selesai";
    if (p.payment_status === "pending") {
      statusLabel = p.payment_method === "cash" ? "Menunggu Verifikasi" : "Menunggu Pembayaran";
    } else if (p.payment_status === "expired") {
      statusLabel = "Kedaluwarsa";
    } else if (p.payment_status === "failed") {
      statusLabel = "Gagal";
    }

    return {
      id: p.payment_code || p.id,
      tanggal: new Date(p.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      keterangan: p.notes || (p.payment_plan ? `Pertemuan ${p.payment_plan.session_number}` : "Pembayaran Tagihan"),
      metode: p.payment_method === "cash" ? "Cash (Di Cabang)" : (p.payment_channel ? `${p.payment_channel}` : (p.payment_method?.toUpperCase() || "Digital")),
      jumlah: formatRupiah(p.total_amount || p.amount),
      status: statusLabel,
    };
  });

  const itemDescription =
    paymentType === "per_pertemuan"
      ? nextUnpaidSessions.length > 0
        ? `Pertemuan ${nextUnpaidSessions.map((s) => s.session_number).join(" & ")}`
        : "Semua Pertemuan Lunas"
      : unpaidPlans.length > 0
      ? `Pertemuan ${unpaidPlans[0].session_number} - ${unpaidPlans[unpaidPlans.length - 1].session_number} (Sisa Paket)`
      : "Paket Lunas";

  const handleStartPayment = (type: "per_pertemuan" | "pelunasan") => {
    if (paymentPlans.length === 0) {
      alert("Siswa belum memiliki tagihan bimbingan belajar aktif.");
      return;
    }
    if (unpaidPlans.length === 0) {
      alert("Semua tagihan pertemuan sudah berstatus lunas.");
      return;
    }
    if (type === "per_pertemuan" && nextUnpaidIsPendingCash) {
      alert("Pengajuan pembayaran tunai untuk pertemuan ini sudah tercatat dan sedang menunggu verifikasi kasir di cabang.");
      return;
    }
    const currentNominalStr =
      type === "per_pertemuan"
        ? formatRupiah(nextUnpaidNominal)
        : formatRupiah(totalUnpaidNominal);
    setLastSuccessAmount(currentNominalStr);
    setPaymentType(type);
    setSelectedMethod("va");
    setSelectedBank("BCA");
    setSelectedEwallet("ShopeePay");
    setVaCopied(false);
    setIsGenerated(false);
    setLiveVaNumber(null);
    setLiveQrUrl(null);
    setLiveCheckoutUrl(null);
    setLiveExpiredAt(null);
    setLiveFee(null);
    setLiveAmount(null);
    setLiveTotalAmount(null);
    setActivePaymentId(null);
    setModalStep("select_method");
  };

  const handleCopyVa = () => {
    if (liveVaNumber) {
      navigator.clipboard.writeText(liveVaNumber.replace(/\s/g, ""));
      setVaCopied(true);
      setTimeout(() => setVaCopied(false), 2000);
    }
  };

  const handlePrintReceipt = (item: any) => {
    if (!item) return;
    printReceipt({
      invoiceCode: item.id,
      tanggal: item.tanggal,
      studentName: childName,
      programName: programName,
      levelName: levelName,
      keterangan: item.keterangan,
      metode: item.metode,
      jumlah: item.jumlah,
      status: item.status === "Selesai" ? "Lunas" : item.status,
    });
  };


  const requestCharge = async (method: "va" | "qris" | "ewallet", channelName: string) => {
    if (!targetPlanId) {
      alert("Semua tagihan untuk paket ini sudah berstatus lunas.");
      return;
    }

    setIsCharging(true);
    try {
      let channel = channelName;
      if (method === "va") {
        channel = channelName.toUpperCase().endsWith("VA") ? channelName.toUpperCase() : `${channelName.toUpperCase()}VA`;
      } else if (method === "ewallet") {
        channel = channelName.toUpperCase();
      }

      const res = await chargePayment({
        payment_plan_id: targetPlanId,
        payment_type: paymentType,
        payment_method: method,
        payment_channel: channel,
        expired_time: "30m",
      });

      if (res && res.data) {
        const inst = res.data.instructions;
        setActivePaymentId(res.data.payment?.id || null);
        if (inst.qr_url) setLiveQrUrl(inst.qr_url);
        if (inst.virtual_account) setLiveVaNumber(inst.virtual_account);
        if (inst.checkout_url) setLiveCheckoutUrl(inst.checkout_url);
        if (inst.expired_at) setLiveExpiredAt(inst.expired_at);
        if (inst.fee !== undefined) setLiveFee(inst.fee);
        if (inst.amount !== undefined) setLiveAmount(inst.amount);
        if (inst.total_amount !== undefined) {
          setLiveTotalAmount(inst.total_amount);
          setLastSuccessAmount(formatRupiah(inst.total_amount));
        }
        setIsGenerated(true);
      } else if (res && !res.success) {
        alert(res.message || "Gagal membuat tagihan pembayaran.");
      }
    } catch (err: any) {
      console.error("Gagal inisiasi payment gateway:", err);
      alert(err.response?.data?.message || err.message || "Gagal membuat tagihan pembayaran.");
    } finally {
      setIsCharging(false);
    }
  };

  // Hilangkan auto-scroll paksa yang membuat layar mobile melompat / pindah-pindah
  // Scroll halus hanya saat user pertama kali membuka modal
  useEffect(() => {
    if (modalStep === "select_method" && modalContentRef.current) {
      modalContentRef.current.scrollTop = 0;
    }
  }, [modalStep]);

  // Smart Polling realtime: cek status transaksi ke backend setiap 3 detik begitu pembayaran di-generate
  useEffect(() => {
    if (!activePaymentId || !isGenerated || (modalStep !== "payment_detail" && modalStep !== "waiting_confirm")) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await checkPaymentStatus(activePaymentId);
        const data = res?.data;

        if (data?.is_paid || data?.payment_status === "paid") {
          clearInterval(interval);

          const paidAmountDisplay = data?.total_amount
            ? formatRupiah(data.total_amount)
            : liveTotalAmount
            ? formatRupiah(liveTotalAmount)
            : lastSuccessAmount || totalAmount;

          setLastSuccessAmount(paidAmountDisplay);

          // Refresh data rencana pembayaran & riwayat dari backend
          await loadFinanceData();

          setModalStep("success");
          setTimeout(() => {
            historyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }
      } catch (err) {
        console.warn("Realtime payment check status error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activePaymentId, isGenerated, modalStep, itemDescription, totalAmount]);

  const handleSelectMethod = (method: "va" | "ewallet" | "qris" | "cash") => {
    setSelectedMethod(method);
    setActivePaymentId(null);
    setIsGenerated(false);
    setExpandedGuideIndex(null);
    setLiveVaNumber(null);
    setLiveQrUrl(null);
    setLiveCheckoutUrl(null);
    setLiveExpiredAt(null);
    setLiveFee(null);
    setLiveAmount(null);
    setLiveTotalAmount(null);
  };

  const handleSelectBank = (bankKey: string) => {
    setSelectedBank(bankKey);
    setActivePaymentId(null);
    setIsGenerated(false);
    setExpandedGuideIndex(null);
    setLiveVaNumber(null);
    setLiveCheckoutUrl(null);
    setLiveExpiredAt(null);
    setLiveFee(null);
    setLiveAmount(null);
    setLiveTotalAmount(null);
  };

  const handleSelectEwallet = (ewalletKey: string) => {
    setSelectedEwallet(ewalletKey);
    setActivePaymentId(null);
    setIsGenerated(false);
    setExpandedGuideIndex(null);
    setLiveCheckoutUrl(null);
    setLiveExpiredAt(null);
    setLiveFee(null);
    setLiveAmount(null);
    setLiveTotalAmount(null);
  };

  const handleProceedToDetail = () => {
    setActivePaymentId(null);
    setIsGenerated(false);
    setExpandedGuideIndex(null);
    setLiveVaNumber(null);
    setLiveQrUrl(null);
    setLiveCheckoutUrl(null);
    setLiveExpiredAt(null);
    setLiveFee(null);
    setLiveAmount(null);
    setLiveTotalAmount(null);
    setModalStep("payment_detail");
  };

  // Helper untuk normalisasi array panduan (Kategori/Channel, Langkah, Catatan)
  const getNormalizedPanduan = (
    panduanData: unknown
  ): { categoryTitle?: string; steps: string[]; notes?: string }[] => {
    if (!panduanData) return [];

    // Jika panduan berbentuk Array
    if (Array.isArray(panduanData)) {
      return panduanData.map((item, idx) => {
        if (typeof item === "string") {
          return { categoryTitle: `Panduan ${idx + 1}`, steps: [item] };
        }
        if (typeof item === "object" && item !== null) {
          const panduanItem = item as Record<string, unknown>;
          const catTitle =
            (typeof panduanItem.title === "string" ? panduanItem.title : null) ||
            (typeof panduanItem.name === "string" ? panduanItem.name : null) ||
            (typeof panduanItem.channel === "string" ? panduanItem.channel : null) ||
            (typeof panduanItem.method === "string" ? panduanItem.method : null) ||
            `Cara Bayar ${idx + 1}`;

          const steps = Array.isArray(panduanItem.steps)
            ? (panduanItem.steps as string[])
            : Array.isArray(panduanItem.content)
            ? (panduanItem.content as string[])
            : typeof panduanItem.content === "string"
            ? [panduanItem.content]
            : [];

          const notes =
            typeof panduanItem.notes === "string"
              ? panduanItem.notes
              : typeof panduanItem.catatan === "string"
              ? panduanItem.catatan
              : typeof panduanItem.note === "string"
              ? panduanItem.note
              : undefined;

          return { categoryTitle: catTitle, steps, notes };
        }
        return { categoryTitle: `Panduan ${idx + 1}`, steps: [] };
      });
    }

    // Jika panduan berbentuk Object Key-Value (e.g. { "m_bca": [...], "atm_bca": [...] })
    if (typeof panduanData === "object" && panduanData !== null) {
      return Object.entries(panduanData).map(([key, val]) => {
        const catTitle = key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        const steps = Array.isArray(val) ? (val as string[]) : typeof val === "string" ? [val] : [];
        return { categoryTitle: catTitle, steps, notes: undefined };
      });
    }

    if (typeof panduanData === "string") {
      return [{ categoryTitle: "Petunjuk Pembayaran", steps: [panduanData], notes: undefined }];
    }

    return [];
  };

  // Helper format tampilan fee dinamis dari gateway (persen atau nominal)
  const formatGatewayFeeDisplay = (feeVal?: number, feeFmt?: string) => {
    if (feeFmt) {
      if (feeFmt.includes("%")) return feeFmt;
      if (!isNaN(Number(feeFmt))) {
        const num = Number(feeFmt);
        return num <= 10 ? `${num}%` : formatRupiah(num);
      }
      return feeFmt;
    }
    if (feeVal !== undefined && feeVal !== null) {
      if (feeVal <= 10) {
        return `${feeVal}%`;
      }
      return formatRupiah(feeVal);
    }
    return null;
  };

  // Helper untuk mendapatkan metode aktif saat ini
  const getCurrentActiveMethodData = () => {
    if (selectedMethod === "va") {
      return (
        vaGatewayList.find(
          (m) =>
            m.code.toUpperCase().replace(/VA$/, "") === selectedBank.toUpperCase().replace(/VA$/, "") ||
            m.name.toUpperCase().includes(selectedBank.toUpperCase())
        ) || null
      );
    }
    if (selectedMethod === "ewallet") {
      return (
        ewalletGatewayList.find(
          (m) =>
            m.code.toUpperCase() === selectedEwallet.toUpperCase() ||
            m.name.toUpperCase().includes(selectedEwallet.toUpperCase())
        ) || null
      );
    }
    if (selectedMethod === "qris") {
      return qrisGatewayList.length > 0 ? qrisGatewayList[0] : null;
    }
    return null;
  };

  // Format waktu expired lengkap dengan tanggal, jam, dan timezone lokal user (WIB / WITA / WIT)
  const formatUserLocalExpiry = (isoString: string | null) => {
    if (!isoString) return "";
    try {
      let formattedIso = isoString.trim();
      // Jika string waktu tidak memiliki penanda timezone (+07 / Z), anggap bersumber dari WIB (Asia/Jakarta +07:00)
      if (!formattedIso.match(/[Z\+\-]\d{2}(:?\d{2})?$/i)) {
        formattedIso = formattedIso.replace(" ", "T") + "+07:00";
      }
      const d = new Date(formattedIso);
      if (isNaN(d.getTime())) return "";

      // Deteksi timezone & singkatan lokal otomatis (WIB, WITA, WIT)
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      let tzAbbr = "";
      if (tz.includes("Jakarta") || tz.includes("Pontianak") || tz.includes("Bangkok")) {
        tzAbbr = "WIB";
      } else if (tz.includes("Makassar") || tz.includes("Bali") || tz.includes("Ujung_Pandang") || tz.includes("Singapore") || tz.includes("Kuala_Lumpur") || tz.includes("Manila")) {
        tzAbbr = "WITA";
      } else if (tz.includes("Jayapura")) {
        tzAbbr = "WIT";
      }

      const dateStr = d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const timeStr = d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).replace(/\./g, ":");

      if (tzAbbr) {
        return `${dateStr} pukul ${timeStr} ${tzAbbr}`;
      }

      // Fallback format lokal otomatis sesuai perangkat
      const timeFormatted = new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
        hour12: false,
      }).format(d).replace(/\./g, ":");

      return `${dateStr} pukul ${timeFormatted}`;
    } catch {
      return new Date(isoString).toLocaleString("id-ID");
    }
  };

  const handleGeneratePayment = async () => {
    // Cash tidak lagi diproses dari portal orang tua — hanya di front desk BSD
    if (selectedMethod === "cash") return;
    const channel = selectedMethod === "va" ? selectedBank : selectedMethod === "ewallet" ? selectedEwallet : "QRIS";
    await requestCharge(selectedMethod, channel);
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);

    if (activePaymentId) {
      try {
        const res = await checkPaymentStatus(activePaymentId);
        if (res?.data?.is_paid || res?.data?.payment_status === "paid") {
          await loadFinanceData();
          setModalStep("success");
          setIsChecking(false);
          return;
        }
      } catch (err) {
        console.warn("Check status error:", err);
      }
    }

    await loadFinanceData();
    setIsChecking(false);
  };

  if (isInitialLoading) {
    return <SkeletonTable rows={4} cols={3} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      {/* CSS Animations */}
      <style>{`
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
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
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
        @media (max-width: 640px) {
          .pembayaran-header-wrap {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .pembayaran-student-select {
            width: 100% !important;
            min-width: 100% !important;
          }
          .pembayaran-stat-grid {
            grid-template-columns: 1fr !important;
          }
          .pembayaran-main-columns {
            grid-template-columns: 1fr !important;
          }
          .pembayaran-modal-wrapper {
            padding: 8px !important;
          }
          .pembayaran-modal-card {
            padding: 16px !important;
            max-height: 94vh !important;
            border-radius: 14px !important;
          }
          .bank-grid-responsive {
            grid-template-columns: 1fr !important;
          }
          .modal-footer-responsive {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
        }
      `}</style>

      {/* ── 1. TOP HEADER & CHILD SELECTOR ───────────────────────────────── */}
      <div className="pembayaran-header-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", margin: 0, letterSpacing: "-0.02em" }}>
              Pembayaran Siswa
            </h1>
          </div>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0 0" }}>
            Siswa: <strong>{childName}</strong> • {programName} ({levelName})
          </p>
        </div>

        {/* Child Selector Dropdown & Refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => loadFinanceData(selectedStudentId, false)}
            disabled={isLoadingFinance}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: 10,
              padding: "8px 12px",
              fontSize: 12.5,
              fontWeight: 700,
              color: "#334155",
              cursor: "pointer",
            }}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ animation: isLoadingFinance ? "spin 1s linear infinite" : "none" }}>
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            Segarkan
          </button>
          {students.length > 0 && (
            <div className="pembayaran-student-select" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label htmlFor="student-selector" style={{ fontSize: 13, fontWeight: 600, color: "#475569", flexShrink: 0 }}>
                Pilih Siswa:
              </label>
              <div style={{ position: "relative", width: "100%", minWidth: 200 }}>
                <select
                  id="student-selector"
                  value={selectedStudentId}
                  onChange={(e) => handleSelectStudent(e.target.value)}
                  style={{
                    width: "100%",
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 10,
                    padding: "9px 38px 9px 14px",
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: "#1e293b",
                    cursor: "pointer",
                    outline: "none",
                    transition: "all 0.15s ease",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#0e7490")}
                  onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                >
                  {students.map((s) => {
                    const studentLabel = s.name || s.full_name || "Siswa";
                    return (
                      <option key={s.id} value={s.id}>
                        {studentLabel}
                      </option>
                    );
                  })}
                </select>
                <div
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#64748b",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Indicator saat ganti siswa */}
      {isLoadingFinance && (
        <div style={{ fontSize: 12, color: "#0e7490", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid #0e7490", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          Memperbarui data tagihan siswa...
        </div>
      )}

      {/* ── 2. TOP 3 STAT CARDS GRID ───────────────────────────────────── */}
      <div className="pembayaran-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
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
            <div style={{ fontSize: 28, fontWeight: 800, color: totalUnpaidNominal > 0 ? "#dc2626" : "#16a34a", lineHeight: 1.1 }}>
              {formatRupiah(totalUnpaidNominal)}
            </div>
            <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 6, fontWeight: 500 }}>
              {unpaidPlans.length > 0 ? `${unpaidPlans.length} Sesi belum dibayar` : "Semua Sesi Telah Lunas"}
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
            PROGRESS PERTEMUAN (LUNAS)
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#1e293b", lineHeight: 1.1 }}>
              {completedSessionsCount} <span style={{ fontSize: 18, fontWeight: 600, color: "#94a3b8" }}>/{totalSessionsCount}</span>
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
                  width: `${progressPercent}%`,
                  height: "100%",
                  background: progressPercent === 100 ? "#16a34a" : "#0e7490",
                  borderRadius: 999,
                  transition: "width 0.4s ease",
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
          {paymentsHistory.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: paymentsHistory[0].payment_status === "paid" ? "#dcfce7" : "#fef3c7",
                  border: paymentsHistory[0].payment_status === "paid" ? "1.5px solid #bbf7d0" : "1.5px solid #fde68a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: paymentsHistory[0].payment_status === "paid" ? "#16a34a" : "#b45309",
                  flexShrink: 0,
                }}
              >
                {paymentsHistory[0].payment_status === "paid" ? (
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                )}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", lineHeight: 1.2 }}>
                  {paymentsHistory[0].payment_status === "paid" ? "Berhasil Lunas" : paymentsHistory[0].payment_status === "pending" ? "Menunggu" : "Kedaluwarsa"}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  {new Date(paymentsHistory[0].created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>Belum ada transaksi</div>
          )}
        </div>
      </div>

      {/* ── 3. MIDDLE SECTION: 2 COLUMNS ─────────────────────────────────── */}
      <div className="pembayaran-main-columns" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
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
                  {programName}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 2 }}>
                  Total Pertemuan Paket
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>
                  {totalSessionsCount} Pertemuan
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 2 }}>
                  Harga per Pertemuan
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>
                  {formatRupiah(paymentPlans[0]?.amount || 50000)}
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

            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 380, overflowY: "auto" }}>
              {paymentPlans.length > 0 ? (
                paymentPlans.map((plan) => {
                  const isPlanPaid = plan.is_paid || plan.status === "paid";
                  const isPendingCash = pendingCashPlanIds.has(plan.id);
                  return (
                    <div
                      key={plan.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: isPlanPaid ? "#f8fafc" : isPendingCash ? "#fffbeb" : "#ffffff",
                        border: isPendingCash ? "1px solid #fde68a" : "1px solid #f1f5f9",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: isPlanPaid ? "#22c55e" : isPendingCash ? "#fef3c7" : "#f1f5f9",
                            border: isPlanPaid ? "none" : isPendingCash ? "2px solid #f59e0b" : "2px solid #cbd5e1",
                            color: isPlanPaid ? "#ffffff" : isPendingCash ? "#d97706" : "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {isPlanPaid ? (
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : isPendingCash ? (
                            <span style={{ fontSize: 11, fontWeight: 900 }}>⏳</span>
                          ) : (
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }}>
                            Pertemuan {plan.session_number}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            {isPlanPaid
                              ? "Lunas"
                              : isPendingCash
                              ? "Menunggu verifikasi kasir di cabang"
                              : `Jatuh tempo ${new Date(plan.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`} • {formatRupiah(plan.amount)}
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          background: isPlanPaid ? "#dcfce7" : isPendingCash ? "#fef3c7" : "#fee2e2",
                          color: isPlanPaid ? "#16a34a" : isPendingCash ? "#b45309" : "#dc2626",
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "3px 10px",
                          borderRadius: 999,
                        }}
                      >
                        {isPlanPaid ? "LUNAS" : isPendingCash ? "⏳ MENUNGGU KASIR" : "BELUM DIBAYAR"}
                      </span>
                    </div>
                  );
                })
              ) : isLoadingFinance ? (
                <div style={{ fontSize: 13, color: "#94a3b8", display: "flex", alignItems: "center", gap: 8, padding: "16px 8px" }}>
                  <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #0e7490", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Memuat daftar pertemuan...
                </div>
              ) : (
                <div style={{ padding: "28px 16px", textAlign: "center", background: "#f8fafc", borderRadius: 10, border: "1px dashed #cbd5e1" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#475569", marginBottom: 4 }}>Belum Ada Tagihan Pertemuan</div>
                  <div style={{ fontSize: 12, color: "#64748b", maxWidth: 360, margin: "0 auto" }}>
                    Siswa {childName} belum memiliki paket bimbingan aktif atau pendaftaran sedang diproses oleh admin.
                  </div>
                </div>
              )}
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
              <span style={{ background: nextUnpaidSessions.length > 0 ? (nextUnpaidIsPendingCash ? "#fef3c7" : "#fee2e2") : "#dcfce7", color: nextUnpaidSessions.length > 0 ? (nextUnpaidIsPendingCash ? "#b45309" : "#dc2626") : "#16a34a", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999 }}>
                {nextUnpaidSessions.length > 0 ? (nextUnpaidIsPendingCash ? "Menunggu Verifikasi" : `${nextUnpaidSessions.length} Belum Dibayar`) : "Semua Lunas"}
              </span>
            </div>

            <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, lineHeight: 1.4 }}>
              Bayar untuk pertemuan yang sudah berjalan atau akan datang.
            </p>

            <div style={{ background: "#f8fafc", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, border: "1px solid #f1f5f9" }}>
              {nextUnpaidSessions.length > 0 ? (
                nextUnpaidSessions.map((session) => (
                  <div key={session.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13.5, fontWeight: 700, color: "#334155" }}>
                    <span>Pertemuan {session.session_number}</span><span>{formatRupiah(session.amount)}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 13, color: "#16a34a", fontWeight: 700 }}>Semua tagihan pertemuan sudah lunas.</div>
              )}
              <div style={{ height: 1, background: "#e2e8f0", margin: "4px 0" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Total Dibayar</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: nextUnpaidNominal > 0 ? (nextUnpaidIsPendingCash ? "#d97706" : "#dc2626") : "#16a34a" }}>{formatRupiah(nextUnpaidNominal)}</span>
              </div>
            </div>

            <button
              onClick={() => handleStartPayment("per_pertemuan")}
              disabled={unpaidPlans.length === 0 || nextUnpaidIsPendingCash}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: unpaidPlans.length === 0 ? "#94a3b8" : nextUnpaidIsPendingCash ? "#d97706" : "#f59e0b",
                color: "#ffffff",
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                cursor: (unpaidPlans.length === 0 || nextUnpaidIsPendingCash) ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: (unpaidPlans.length === 0 || nextUnpaidIsPendingCash) ? "none" : "0 4px 12px rgba(245,158,11,0.25)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { if (unpaidPlans.length > 0 && !nextUnpaidIsPendingCash) e.currentTarget.style.background = "#d97706"; }}
              onMouseLeave={(e) => { if (unpaidPlans.length > 0 && !nextUnpaidIsPendingCash) e.currentTarget.style.background = "#f59e0b"; }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              <span>
                {unpaidPlans.length === 0
                  ? "Semua Pertemuan Lunas"
                  : nextUnpaidIsPendingCash
                  ? "⏳ Menunggu Verifikasi Kasir"
                  : `Bayar Pertemuan (Rp ${(nextUnpaidNominal / 1000)}k)`}
              </span>
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
                <span>{unpaidPlans.length > 0 ? `Sisa Pertemuan (${unpaidPlans[0]?.session_number}-${unpaidPlans[unpaidPlans.length - 1]?.session_number})` : "Sisa Pertemuan"}</span>
                <span style={{ fontWeight: 700 }}>{unpaidPlans.length > 0 ? `${unpaidPlans.length} x ${formatRupiah(unpaidPlans[0]?.amount || 50000)}` : "0 Pertemuan"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.9)" }}>Total Pelunasan</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: "#ffffff" }}>{formatRupiah(totalUnpaidNominal)}</span>
              </div>
            </div>

            <button
              onClick={() => handleStartPayment("pelunasan")}
              disabled={unpaidPlans.length === 0}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: unpaidPlans.length === 0 ? "rgba(255,255,255,0.4)" : "#ffffff",
                color: unpaidPlans.length === 0 ? "rgba(255,255,255,0.8)" : "#0e7490",
                border: "none",
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 14,
                cursor: unpaidPlans.length === 0 ? "not-allowed" : "pointer",
                textAlign: "center",
                boxShadow: unpaidPlans.length === 0 ? "none" : "0 4px 12px rgba(0,0,0,0.1)",
                transition: "all 0.15s ease",
                marginTop: 4,
              }}
              onMouseEnter={(e) => { if (unpaidPlans.length > 0) e.currentTarget.style.background = "#f8fafc"; }}
              onMouseLeave={(e) => { if (unpaidPlans.length > 0) e.currentTarget.style.background = "#ffffff"; }}
            >
              {unpaidPlans.length === 0 ? "Semua Paket Sudah Lunas" : "Lunasi Paket Sekarang"}
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
              {formattedHistoryList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "36px 20px", color: "#64748b", fontSize: 13.5 }}>
                    Belum ada riwayat transaksi pembayaran untuk siswa ini.
                  </td>
                </tr>
              ) : (
                formattedHistoryList.map((row, idx) => (
                  <tr key={row.id + idx} style={{ borderBottom: idx < formattedHistoryList.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    <td style={{ padding: "16px 20px", fontSize: 13, fontFamily: "monospace", color: "#475569", fontWeight: 600 }}>{row.id}</td>
                    <td style={{ padding: "16px 20px", fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>{row.tanggal}</td>
                    <td style={{ padding: "16px 20px", fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>{row.keterangan}</td>
                    <td style={{ padding: "16px 20px", fontSize: 13, color: "#475569" }}>{row.metode}</td>
                    <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 800, color: "#1e293b" }}>{row.jumlah}</td>
                    <td style={{ padding: "16px 20px" }}>
                      {row.status === "Menunggu Verifikasi" || row.status === "Menunggu Pembayaran" ? (
                        <span style={{ background: "#fef3c7", color: "#b45309", fontSize: 11.5, fontWeight: 700, padding: "5px 12px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                          </svg>
                          {row.status}
                        </span>
                      ) : row.status === "Kedaluwarsa" || row.status === "Gagal" ? (
                        <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: 11.5, fontWeight: 700, padding: "5px 12px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                          </svg>
                          {row.status}
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
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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

                        {row.status === "Selesai" && (
                          <button
                            onClick={() => handlePrintReceipt(row)}
                            title="Cetak Kuitansi / Bukti Pembayaran PDF"
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              padding: "6px 10px", borderRadius: 8,
                              background: "#dcfce7", border: "1px solid #bbf7d0",
                              color: "#15803d", fontSize: 12, fontWeight: 700,
                              cursor: "pointer", transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#bbf7d0"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#dcfce7"; }}
                          >
                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 6 2 18 2 18 9" />
                              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                              <rect x="6" y="14" width="12" height="8" />
                            </svg>
                            PDF
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
          className="pembayaran-modal-wrapper"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalStep(null);
          }}
        >
          <div
            ref={modalContentRef}
            className="pembayaran-modal-card"
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
                    nextUnpaidSessions.length > 0 ? (
                      nextUnpaidSessions.map((session) => (
                        <div key={session.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                          <span>Pertemuan {session.session_number}</span>
                          <span>{formatRupiah(session.amount)}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: 13, color: "#16a34a", fontWeight: 600, marginBottom: 6 }}>
                        Semua pertemuan sudah lunas
                      </div>
                    )
                  ) : (
                    unpaidPlans.length > 0 ? (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                        <span>Sisa Pertemuan ({unpaidPlans[0]?.session_number} - {unpaidPlans[unpaidPlans.length - 1]?.session_number})</span>
                        <span>{unpaidPlans.length} x {formatRupiah(unpaidPlans[0]?.amount || 50000)}</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: "#16a34a", fontWeight: 600, marginBottom: 6 }}>
                        Seluruh paket sudah lunas
                      </div>
                    )
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
                      onClick={() => handleSelectMethod("va")}
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
                      onClick={() => handleSelectMethod("ewallet")}
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
                      onClick={() => handleSelectMethod("qris")}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 16px",
                        background: isSelected ? "#f0f9ff" : "#ffffff",
                        borderBottom: "1px solid #f1f5f9",
                        cursor: "pointer", transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ width: 20, height: 20, borderRadius: "50%", border: isSelected ? "2px solid #0e7490" : "2px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#fff", transition: "border-color 0.15s" }}>
                        {isSelected && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#0e7490" }} />}
                      </div>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: isSelected ? "#e0f2fe" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {/* QRIS logo style */}
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 900, color: "#ED1C24", letterSpacing: "-0.02em" }}>QR</span>
                          <span style={{ fontSize: 11, fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em", marginLeft: 1 }}>IS</span>
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

                  {/* Option 4: Cash — Info Front Desk (Bukan opsi selectable) */}
                  <div
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 14,
                      padding: "16px 16px",
                      background: "#fffbeb",
                      borderTop: "1px dashed #fde68a",
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#92400e" }}>Pembayaran Tunai (Cash)</div>
                      <div style={{ fontSize: 12, color: "#b45309", marginTop: 4, lineHeight: 1.5 }}>
                        Pembayaran tunai dilayani langsung di <strong>Front Desk BSD After School Club</strong> pada jam operasional kantor. Kasir akan memproses pembayaran dan mencetak kwitansi resmi.
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, padding: "6px 10px", background: "#fef9c3", borderRadius: 8, width: "fit-content" }}>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#a16207" strokeWidth={2.5}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#a16207" }}>Tidak perlu upload bukti — dicatat langsung oleh kasir</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="modal-footer-responsive" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 12 }}>
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
                {/* Header with Change Method Button */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0 }}>
                    {selectedMethod === "va"
                      ? `Virtual Account (${selectedBank})`
                      : selectedMethod === "qris"
                      ? "Pembayaran QRIS"
                      : selectedMethod === "ewallet"
                      ? `E-Wallet (${selectedEwallet})`
                      : "Pembayaran Cash / Tunai"}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsGenerated(false);
                        setModalStep("select_method");
                      }}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        background: "#f8fafc",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#0e7490",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Ganti Metode</span>
                    </button>
                    <button
                      onClick={() => setModalStep(null)}
                      style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: 4 }}
                    >
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px 0", lineHeight: 1.4 }}>
                  Silakan selesaikan pembayaran menggunakan {selectedMethod === "va" ? `Virtual Account ${selectedBank}` : selectedMethod.toUpperCase()} sebelum batas waktu pembayaran.
                </p>

                {/* Ringkasan Pembayaran Box */}
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", marginBottom: 18, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                    RINGKASAN PEMBAYARAN
                  </div>
                  {paymentType === "per_pertemuan" ? (
                    nextUnpaidSessions.length > 0 ? (
                      nextUnpaidSessions.map((session) => (
                        <div key={session.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: liveFee ? 4 : 8 }}>
                          <span>Pertemuan {session.session_number}</span>
                          <span>{formatRupiah(session.amount)}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: 13, color: "#16a34a", fontWeight: 600, marginBottom: 8 }}>
                        Semua pertemuan sudah lunas
                      </div>
                    )
                  ) : (
                    unpaidPlans.length > 0 ? (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: liveFee ? 4 : 8 }}>
                        <span>Sisa Pertemuan ({unpaidPlans[0]?.session_number} - {unpaidPlans[unpaidPlans.length - 1]?.session_number})</span>
                        <span>{unpaidPlans.length} x {formatRupiah(unpaidPlans[0]?.amount || 50000)}</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: "#16a34a", fontWeight: 600, marginBottom: 8 }}>
                        Seluruh paket sudah lunas
                      </div>
                    )
                  )}

                  {/* Biaya Layanan Gateway jika sudah digenerate */}
                  {liveFee !== null && liveFee > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 600, color: "#64748b", marginBottom: 10 }}>
                      <span>Biaya Transaksi / Fee Gateway</span>
                      <span>+ {formatRupiah(liveFee)}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0", paddingTop: 8 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>Total yang Harus Ditransfer</div>
                      {liveFee !== null && liveFee > 0 && (
                        <div style={{ fontSize: 10.5, color: "#64748b" }}>(Termasuk Biaya Gateway)</div>
                      )}
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#0e7490" }}>
                      {liveTotalAmount ? formatRupiah(liveTotalAmount) : totalAmount}
                    </span>
                  </div>
                </div>

                {/* ── DETAILS FOR VIRTUAL ACCOUNT ── */}
                {selectedMethod === "va" && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                      PILIH BANK
                    </div>

                    {/* Bank Grid Selector — branded cards with real logos */}
                    <div className="bank-grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 16 }}>
                      {vaGatewayList.length > 0 ? (
                        vaGatewayList.map((bank) => {
                          const bankKey = bank.code.replace("VA", "");
                          const isActive = selectedBank.toUpperCase() === bankKey || selectedBank.toUpperCase() === bank.code;
                          return (
                            <button
                              key={bank.code}
                              onClick={() => handleSelectBank(bankKey)}
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
                                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {formatGatewayFeeDisplay(bank.fee, bank.fee_format) ? `Fee: ${formatGatewayFeeDisplay(bank.fee, bank.fee_format)}` : "Virtual Account"}
                                </div>
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
                            onClick={() => handleSelectBank(bank.id)}
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

                      {liveVaNumber ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <span style={{ fontSize: 22, fontWeight: 800, color: "#0e7490", letterSpacing: "0.04em" }}>
                            {liveVaNumber}
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
                      ) : (
                        <div style={{ padding: "8px 0", color: "#64748b", fontSize: 13, fontWeight: 600 }}>
                          Klik tombol <strong>Bayar</strong> di bawah untuk mendapatkan Nomor Virtual Account resmi.
                        </div>
                      )}

                      <div style={{ fontSize: 13, color: "#475569", marginTop: 8, fontWeight: 600 }}>
                        Total Transfer: <strong>{liveTotalAmount ? formatRupiah(liveTotalAmount) : totalAmount}</strong>
                        {liveFee !== null && liveFee > 0 && (
                          <span style={{ fontSize: 11, color: "#64748b", marginLeft: 6 }}>
                            (Tagihan: {formatRupiah(liveAmount || 0)} + Fee: {formatRupiah(liveFee)})
                          </span>
                        )}
                      </div>
                      {liveExpiredAt && (
                        <div style={{ fontSize: 12, color: "#dc2626", fontWeight: 700, marginTop: 4 }}>
                          Bayar sebelum {formatUserLocalExpiry(liveExpiredAt)}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* ── INFO CASH: BAYAR DI FRONT DESK ── */}
                {selectedMethod === "cash" && (
                  <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 12, padding: "20px", marginBottom: 20, textAlign: "center" }}>
                    <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 10 }}>
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#92400e", marginBottom: 6 }}>Pembayaran Tunai di Front Desk</div>
                    <div style={{ fontSize: 13, color: "#b45309", lineHeight: 1.6 }}>
                      Silakan lakukan pembayaran langsung ke kasir di Front Desk BSD After School Club pada jam operasional kantor.<br />
                      Kasir akan memproses pembayaran dan mencetak kwitansi resmi.
                    </div>
                  </div>
                )}

                {/* ── DETAILS FOR QRIS ── */}
                {selectedMethod === "qris" && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                      PILIH METODE QRIS
                    </div>

                    {/* QRIS Card Selector — Card button sama persis dengan layout VA & E-Wallet */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 16 }}>
                      {(() => {
                        const qrisData = qrisGatewayList.length > 0 ? qrisGatewayList[0] : null;
                        return (
                          <button
                            onClick={() => {
                              if (!isGenerated && !isCharging) {
                                handleGeneratePayment();
                              }
                            }}
                            className="bank-card-btn bank-card-active"
                            style={{
                              padding: "12px",
                              borderRadius: 12,
                              textAlign: "left",
                              border: "2px solid #0e7490",
                              background: "#f0f9ff",
                              cursor: isGenerated ? "default" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 42,
                                height: 42,
                                borderRadius: 10,
                                border: "1px solid #bae6fd",
                                background: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                boxShadow: "0 4px 12px rgba(14, 116, 144, 0.18)",
                                overflow: "hidden",
                              }}
                            >
                              {qrisData?.logo ? (
                                <img src={qrisData.logo} alt="QRIS" style={{ width: 34, height: 34, objectFit: "contain" }} />
                              ) : (
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  <span style={{ fontSize: 13, fontWeight: 900, color: "#ED1C24", letterSpacing: "-0.02em" }}>QR</span>
                                  <span style={{ fontSize: 13, fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em", marginLeft: 1 }}>IS</span>
                                </div>
                              )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#0e7490", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                QRIS
                              </div>
                              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {qrisData?.fee_format ? `Fee: ${formatGatewayFeeDisplay(qrisData.fee, qrisData.fee_format)}` : "Semua Bank & E-Wallet"}
                              </div>
                            </div>
                          </button>
                        );
                      })()}
                    </div>

                    {/* QR Code Container — Hanya muncul barcode jika sudah klik tombol Bayar atau klik Card QRIS */}
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
                        BARCODE QRIS
                      </div>

                      {isGenerated && liveQrUrl ? (
                        <>
                          <div
                            style={{
                              background: "#ffffff",
                              padding: 16,
                              display: "inline-block",
                              borderRadius: 16,
                              border: "2px solid #e2e8f0",
                              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                              margin: "10px 0 14px",
                            }}
                          >
                            <img
                              src={liveQrUrl}
                              alt="QRIS Code"
                              style={{ width: 190, height: 190, objectFit: "contain", borderRadius: 8, display: "block" }}
                            />
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>
                            Scan QRIS ini dengan:
                          </div>
                          <div style={{ display: "flex", justifyContent: "center", gap: 5, flexWrap: "wrap", marginBottom: 12, maxWidth: 420, marginInline: "auto" }}>
                            {[
                              { n: "m-BCA", c: "#0066B3" }, { n: "BRImo", c: "#003D6B" },
                              { n: "Livin'", c: "#FFB81C" }, { n: "BNI", c: "#F58220" },
                              { n: "OVO", c: "#4C3494" }, { n: "GoPay", c: "#00AA13" },
                              { n: "ShopeePay", c: "#EE4D2D" }, { n: "DANA", c: "#108EE9" },
                              { n: "LinkAja", c: "#E4002B" },
                            ].map(a => (
                              <span key={a.n} style={{ fontSize: 10, fontWeight: 700, color: a.c, background: `${a.c}12`, padding: "4px 8px", borderRadius: 6, border: `1px solid ${a.c}20` }}>
                                {a.n}
                              </span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div style={{ padding: "8px 0", color: "#64748b", fontSize: 13, fontWeight: 600 }}>
                          Klik kartu QRIS di atas atau tombol <strong>Bayar</strong> di bawah untuk memunculkan Barcode QRIS resmi.
                        </div>
                      )}

                      <div style={{ fontSize: 13, color: "#475569", marginTop: 8, fontWeight: 600 }}>
                        Total Tagihan: <strong>{liveTotalAmount ? formatRupiah(liveTotalAmount) : totalAmount}</strong>
                        {liveFee !== null && liveFee > 0 && (
                          <span style={{ fontSize: 11, color: "#64748b", marginLeft: 6 }}>
                            (Tagihan: {formatRupiah(liveAmount || 0)} + Fee: {formatRupiah(liveFee)})
                          </span>
                        )}
                      </div>
                      {liveExpiredAt && (
                        <div style={{ fontSize: 12, color: "#dc2626", fontWeight: 700, marginTop: 4 }}>
                          Bayar sebelum {formatUserLocalExpiry(liveExpiredAt)}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* ── DETAILS FOR E-WALLET ── */}
                {selectedMethod === "ewallet" && (
                  <div className="bank-grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
                    {ewalletGatewayList.length > 0 ? (
                      ewalletGatewayList.map((ew) => {
                        const isActive = selectedEwallet.toUpperCase() === ew.code.toUpperCase() || selectedEwallet.toUpperCase() === ew.name.toUpperCase();
                        return (
                          <button
                            key={ew.code}
                            onClick={() => handleSelectEwallet(ew.code)}
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
                              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {formatGatewayFeeDisplay(ew.fee, ew.fee_format) ? `Fee: ${formatGatewayFeeDisplay(ew.fee, ew.fee_format)}` : "E-Wallet"}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      ([
                        { name: "ShopeePay" as const, fullName: "ShopeePay", color: "#EE4D2D", selectedBg: "#FDDDD5", desc: "Fee: 2.9% • Shopee App", logo: "/logo%20pembayaran/shopeepay.webp" },
                        { name: "OVO" as const, fullName: "OVO", color: "#4C3494", selectedBg: "#E2DDF6", desc: "Fee: 2.5% • OVO App", logo: "/logo%20pembayaran/ovo.jpg" },
                        { name: "GoPay" as const, fullName: "GoPay", color: "#00AA13", selectedBg: "#D1FADF", desc: "Fee: 2% • Gojek App", logo: "/logo%20pembayaran/gopay.webp" },
                        { name: "DANA" as const, fullName: "DANA", color: "#108EE9", selectedBg: "#D4ECFC", desc: "Fee: 2.5% • DANA App", logo: "/logo%20pembayaran/Dana.webp" },
                      ]).map((ew) => {
                        const isActive = selectedEwallet === ew.name;
                        return (
                        <button
                          key={ew.name}
                          onClick={() => handleSelectEwallet(ew.name)}
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

                {/* E-Wallet Total & Fee Info jika sudah generated */}
                {selectedMethod === "ewallet" && (
                  <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px", border: "1px solid #e2e8f0", textAlign: "center", marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>
                      Total Transfer: <strong>{liveTotalAmount ? formatRupiah(liveTotalAmount) : totalAmount}</strong>
                      {liveFee !== null && liveFee > 0 && (
                        <span style={{ fontSize: 11, color: "#64748b", marginLeft: 6 }}>
                          (Tagihan: {formatRupiah(liveAmount || 0)} + Fee: {formatRupiah(liveFee)})
                        </span>
                      )}
                    </div>
                    {liveExpiredAt && (
                      <div style={{ fontSize: 12, color: "#dc2626", fontWeight: 700, marginTop: 4 }}>
                        Bayar sebelum {formatUserLocalExpiry(liveExpiredAt)}
                      </div>
                    )}
                  </div>
                )}

                {/* Tombol Buka Invoice / Checkout Resmi Gateway jika tersedia (Hanya E-Wallet) */}
                {liveCheckoutUrl && selectedMethod === "ewallet" && (
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <a
                      href={liveCheckoutUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 16px",
                        background: "#f0f9ff",
                        border: "1px solid #bae6fd",
                        borderRadius: 8,
                        color: "#0284c7",
                        fontWeight: 700,
                        fontSize: 13,
                        textDecoration: "none",
                      }}
                    >
                      <span>Buka Halaman Checkout Resmi {selectedEwallet}</span>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>
                )}

                {/* ── DROPDOWN PANDUAN CARA BAYAR (ZANNSTORE GATEWAY) — HANYA MUNCUL SETELAH KLIK BAYAR ── */}
                {isGenerated && (() => {
                  const activeMethodData = getCurrentActiveMethodData();
                  const rawPanduan = activeMethodData?.panduan;
                  const categories = getNormalizedPanduan(rawPanduan);

                  // Fallback jika tidak ada data dari gateway
                  const defaultCategories: { categoryTitle?: string; steps: string[]; notes?: string }[] =
                    selectedMethod === "va"
                      ? [
                          {
                            categoryTitle: `m-${selectedBank} / Mobile Banking`,
                            steps: [
                              `Login ke aplikasi Mobile Banking ${selectedBank}.`,
                              `Pilih menu 'Transfer' atau 'Bayar' lalu pilih 'Virtual Account'.`,
                              `Masukkan Nomor Virtual Account: ${liveVaNumber || ""}.`,
                              `Pastikan nominal tagihan sesuai (${totalAmount}) lalu masukkan PIN transaksi.`,
                            ],
                          },
                          {
                            categoryTitle: `ATM ${selectedBank}`,
                            steps: [
                              `Masukkan Kartu ATM dan PIN ${selectedBank} Anda.`,
                              `Pilih menu 'Transaksi Lainnya' → 'Transfer' → 'Ke Rekening Virtual Account'.`,
                              `Masukkan Nomor Virtual Account: ${liveVaNumber || ""}.`,
                              `Konfirmasi detail pembayaran dan selesaikan transaksi.`,
                            ],
                          },
                        ]
                      : selectedMethod === "qris"
                      ? [
                          {
                            categoryTitle: "BCA Mobile / Mandiri / BRImo / Bank Lain",
                            steps: [
                              "Buka aplikasi Mobile Banking pilihan Anda.",
                              "Pilih fitur 'QRIS' atau 'Scan QR'.",
                              "Arahkan kamera ke QR Code di atas.",
                              `Periksa nominal (${totalAmount}) dan konfirmasi dengan PIN.`,
                            ],
                          },
                          {
                            categoryTitle: "GoPay / OVO / DANA / ShopeePay",
                            steps: [
                              "Buka aplikasi E-Wallet Anda.",
                              "Pilih menu 'Scan' atau 'Bayar'.",
                              "Arahkan kamera ke QR Code di atas.",
                              "Verifikasi pembayaran dan selesaikan transaksi.",
                            ],
                          },
                        ]
                      : [
                          {
                            categoryTitle: `Aplikasi ${selectedEwallet}`,
                            steps: [
                              `Klik tombol 'Buka Halaman Checkout Resmi ${selectedEwallet}' di atas atau buka aplikasi ${selectedEwallet}.`,
                              "Selesaikan otorisasi dan konfirmasi pembayaran di aplikasi.",
                              "Setelah berhasil, status pembayaran akan terverifikasi otomatis.",
                            ],
                          },
                        ];

                  const categoriesToRender = categories.length > 0 ? categories : defaultCategories;

                  return (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#0e7490" strokeWidth={2}>
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4M12 8h.01" />
                        </svg>
                        <span>Petunjuk & Cara Pembayaran:</span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {categoriesToRender.map((cat, catIdx) => {
                          const isCatOpen = expandedGuideIndex === catIdx;
                          return (
                            <div key={catIdx} style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", background: "#ffffff" }}>
                              <button
                                type="button"
                                onClick={() => setExpandedGuideIndex(isCatOpen ? null : catIdx)}
                                style={{
                                  width: "100%",
                                  padding: "10px 14px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  background: isCatOpen ? "#f8fafc" : "#ffffff",
                                  border: "none",
                                  cursor: "pointer",
                                  textAlign: "left",
                                }}
                              >
                                <span style={{ fontSize: 12, fontWeight: 700, color: isCatOpen ? "#0e7490" : "#334155" }}>
                                  ▸ {cat.categoryTitle}
                                </span>
                                <svg
                                  width={14}
                                  height={14}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#64748b"
                                  strokeWidth={2}
                                  style={{
                                    transform: isCatOpen ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "transform 0.2s ease",
                                  }}
                                >
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </button>

                              {isCatOpen && (
                                <div style={{ padding: "10px 16px 14px", borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}>
                                  <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#334155", lineHeight: 1.6 }}>
                                    {cat.steps.map((st, stIdx) => {
                                      // Ganti placeholder jika ada dengan nomor VA live
                                      const text = liveVaNumber ? st.replace(/Nomor VA/i, `Nomor VA (${liveVaNumber})`) : st;
                                      return (
                                        <li key={stIdx} style={{ marginBottom: 4 }}>
                                          {text}
                                        </li>
                                      );
                                    })}
                                  </ol>

                                  {cat.notes && (
                                    <div style={{ marginTop: 8, padding: "6px 10px", background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: 6, fontSize: 11, color: "#92400e" }}>
                                      <strong>Catatan:</strong> {cat.notes}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Footer Action Buttons */}
                <div className="modal-footer-responsive" style={{ display: "grid", gridTemplateColumns: selectedMethod === "cash" ? (isGenerated ? "1fr 1.4fr" : "1fr 1.4fr") : "1fr", gap: 12 }}>
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

                  {selectedMethod === "cash" ? (
                    <div style={{
                      padding: "12px 16px",
                      background: "#fffbeb",
                      border: "1px solid #fde68a",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#92400e",
                      textAlign: "center",
                    }}>
                      Silakan kunjungi Front Desk BSD untuk pembayaran tunai
                    </div>
                  ) : !isGenerated ? (
                    <button
                      onClick={handleGeneratePayment}
                      disabled={isCharging}
                      style={{
                        padding: "12px",
                        background: isCharging ? "#94a3b8" : "#f59e0b",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: isCharging ? "not-allowed" : "pointer",
                        boxShadow: isCharging ? "none" : "0 4px 12px rgba(245,158,11,0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      {isCharging ? (
                        <>
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              border: "2px solid #ffffff",
                              borderTopColor: "transparent",
                              animation: "spin 0.8s linear infinite",
                            }}
                          />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        "Bayar"
                      )}
                    </button>
                  ) : null}
                </div>
                {/* Live Realtime Listening Banner (Digital Payment) */}
                {selectedMethod !== "cash" && isGenerated && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: "12px 16px",
                      background: "#f0f9ff",
                      border: "1px solid #bae6fd",
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    {/* Spinner loading halus tanpa kedip */}
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: "2px solid #bae6fd",
                        borderTopColor: "#0284c7",
                        animation: "spin 0.8s linear infinite",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ fontSize: 12, color: "#0369a1", fontWeight: 600 }}>
                      Menunggu pembayaran masuk... Halaman akan otomatis lunas begitu transfer selesai.
                    </div>
                  </div>
                )}
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
                    nextUnpaidSessions.length > 0 ? (
                      nextUnpaidSessions.map((session) => (
                        <div key={session.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                          <span>Pertemuan {session.session_number}</span>
                          <span>{formatRupiah(session.amount)}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: 13, color: "#16a34a", fontWeight: 600, marginBottom: 6 }}>
                        Semua pertemuan sudah lunas
                      </div>
                    )
                  ) : (
                    unpaidPlans.length > 0 ? (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                        <span>Sisa Pertemuan ({unpaidPlans[0]?.session_number} - {unpaidPlans[unpaidPlans.length - 1]?.session_number})</span>
                        <span>{unpaidPlans.length} x {formatRupiah(unpaidPlans[0]?.amount || 50000)}</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: "#16a34a", fontWeight: 600, marginBottom: 6 }}>
                        Seluruh paket sudah lunas
                      </div>
                    )
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
                  {selectedMethod === "cash" ? "Informasi Tunai" : "Pembayaran Otomatis Lunas!"}
                </h3>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.5 }}>
                  {selectedMethod === "cash" ? (
                    <>
                      Untuk pembayaran tunai, silakan kunjungi <strong>Front Desk BSD After School Club</strong> pada jam operasional. Kasir akan memproses pembayaran dan mencetak kwitansi resmi.
                    </>
                  ) : (
                    <>
                      Transaksi sebesar <strong>{lastSuccessAmount || (liveTotalAmount ? formatRupiah(liveTotalAmount) : totalAmount)}</strong> untuk <strong>{childName}</strong> telah <strong>terverifikasi OTOMATIS LUNAS</strong> oleh sistem Payment Gateway.
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

            {/* Action Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
              <button
                onClick={() => setDetailItem(null)}
                style={{
                  padding: "11px",
                  background: "#ffffff", color: "#64748b",
                  border: "1px solid #cbd5e1", borderRadius: 10,
                  fontWeight: 700, fontSize: 13.5, cursor: "pointer",
                }}
              >
                Tutup
              </button>
              <button
                onClick={() => handlePrintReceipt(detailItem)}
                style={{
                  padding: "11px",
                  background: "#0e7490", color: "#ffffff",
                  border: "none", borderRadius: 10,
                  fontWeight: 700, fontSize: 13.5, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                <span>Cetak Kuitansi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
