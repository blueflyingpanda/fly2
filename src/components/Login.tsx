import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Spinner } from "../ui/Spinner";

export function Login() {
  const { t } = useLocale();
  const { telegramPending, telegramError, retryTelegram, loginOtp } = useAuth();
  const [chatId, setChatId] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await loginOtp(chatId, code);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-accent text-white shadow-soft">
            <Plane className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-text">{t.login_title}</h1>
          <p className="mt-1 text-sm text-muted">{t.login_subtitle}</p>
        </div>

        {telegramPending ? (
          <div className="flex flex-col items-center gap-3 py-8 text-muted">
            <Spinner className="h-7 w-7" />
            <p className="text-sm">{t.login_connecting}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <p className="rounded-xl2 bg-accent-soft/60 px-4 py-3 text-sm text-text">
              {t.login_otpInstructions}
            </p>

            <Field label={t.login_chatId}>
              <Input
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                inputMode="numeric"
                autoComplete="off"
                placeholder="123456789"
                required
              />
            </Field>
            <Field label={t.login_code}>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                required
              />
            </Field>

            {(error || telegramError) && (
              <p className="text-sm text-danger">{error ?? telegramError}</p>
            )}

            <Button type="submit" full loading={submitting} size="lg">
              {t.login_submit}
            </Button>

            {telegramError && (
              <Button variant="ghost" full onClick={retryTelegram}>
                {t.login_telegramRetry}
              </Button>
            )}
          </form>
        )}
      </motion.div>
    </div>
  );
}
