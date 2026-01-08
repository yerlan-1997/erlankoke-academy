"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/Card";
import Button from "@/components/Button";

export default function AuthPage() {
  const [phone, setPhone] = useState("+7");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [msg, setMsg] = useState("");

  async function sendOtp() {
    setMsg("");
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) return setMsg(error.message);
    setStep("otp");
    setMsg("SMS код жіберілді.");
  }

  async function verifyOtp() {
    setMsg("");
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    if (error) return setMsg(error.message);
    window.location.href = "/dashboard";
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black">Телефонмен кіру</h1>
      <p className="mt-2 opacity-80 text-sm">Пробный сабақтар тегін. Ақылы сабақтар төлемнен кейін ашылады.</p>

      <div className="max-w-md mt-6">
        <Card>
          {step === "phone" ? (
            <>
              <label className="text-sm font-bold">Телефон</label>
              <input className="w-full mt-1 border-2 border-ink rounded-xl px-3 py-2"
                value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7XXXXXXXXXX" />
              <div className="mt-3">
                <Button onClick={sendOtp} variant="sun" full>Код жіберу</Button>
              </div>
            </>
          ) : (
            <>
              <label className="text-sm font-bold">SMS код</label>
              <input className="w-full mt-1 border-2 border-ink rounded-xl px-3 py-2"
                value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
              <div className="mt-3">
                <Button onClick={verifyOtp} variant="ink" full>Растау</Button>
              </div>
              <p className="mt-3 text-xs opacity-80">Формат: +7XXXXXXXXXX</p>
            </>
          )}
          {msg && <p className="mt-3 text-sm">{msg}</p>}
        </Card>
      </div>
    </div>
  );
}
