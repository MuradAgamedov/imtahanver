import { useState } from "react";
import type { Route } from "./+types/settings";
import { cn } from "../lib/utils";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Ayarlar — İmtahanVer Admin" }];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, description, children }: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-6 py-5">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>
      <div className="space-y-5 px-6 py-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-6">
      <div className="sm:w-48 shrink-0">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
          checked ? "bg-indigo-600" : "bg-gray-200",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [siteName, setSiteName] = useState("İmtahanVer");
  const [supportEmail, setSupportEmail] = useState("support@imtahanver.az");
  const [maxAttempts, setMaxAttempts] = useState("3");

  const [emailNotif, setEmailNotif] = useState(true);
  const [newUserNotif, setNewUserNotif] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(true);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // TODO: persist settings
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-gray-400";

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
      {/* General */}
      <Section
        title="Ümumi ayarlar"
        description="Platforma üçün əsas konfiqurasiya parametrləri"
      >
        <Field label="Sayt adı">
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Dəstək emaili" hint="İstifadəçilərə göstərilən email">
          <input
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Maks. cəhd sayı" hint="Bir imtahana maksimum cəhd">
          <input
            type="number"
            min="1"
            max="10"
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(e.target.value)}
            className={cn(inputClass, "max-w-xs")}
          />
        </Field>
      </Section>

      {/* Notifications */}
      <Section
        title="Bildiriş ayarları"
        description="Admin panelinə gələn bildirişləri idarə edin"
      >
        <Field label="Email bildirişləri">
          <Toggle
            checked={emailNotif}
            onChange={setEmailNotif}
            label="Email bildirişlərini aktivləşdir"
          />
        </Field>
        <Field label="Yeni istifadəçi">
          <Toggle
            checked={newUserNotif}
            onChange={setNewUserNotif}
            label="Yeni qeydiyyat zamanı bildiriş al"
          />
        </Field>
        <Field label="Həftəlik hesabat">
          <Toggle
            checked={weeklyReport}
            onChange={setWeeklyReport}
            label="Həftəlik statistika hesabatı al"
          />
        </Field>
      </Section>

      {/* System */}
      <Section
        title="Sistem ayarları"
        description="Platformanın iş rejiminə aid kritik parametrlər"
      >
        <Field label="Texniki baxış rejimi" hint="Aktiv olduqda istifadəçilər daxil ola bilmir">
          <Toggle
            checked={maintenanceMode}
            onChange={setMaintenanceMode}
            label={maintenanceMode ? "Aktiv — istifadəçilər giriş edə bilmir" : "Deaktiv"}
          />
          {maintenanceMode && (
            <p className="mt-2 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
              Diqqət: Texniki baxış rejimi aktivdir. İstifadəçilər platforma daxil ola bilmir.
            </p>
          )}
        </Field>
        <Field label="Qeydiyyat">
          <Toggle
            checked={registrationOpen}
            onChange={setRegistrationOpen}
            label="Yeni qeydiyyata icazə ver"
          />
        </Field>
        <Field label="Pulsuz sınaq">
          <Toggle
            checked={freeTrialEnabled}
            onChange={setFreeTrialEnabled}
            label="Pulsuz plan mövcuddur"
          />
        </Field>
      </Section>

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Ləğv et
        </button>
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-700 hover:to-violet-700"
        >
          Saxla
        </button>
      </div>
    </form>
  );
}
