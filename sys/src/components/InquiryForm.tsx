import { useState, type SyntheticEvent } from "react";
import { CONTACT_EMAIL, FORM_ENDPOINT } from "../config";

type Topic = "software" | "consulting" | "other";

const TOPIC_LABELS: Record<Topic, string> = {
  software: "ソフトウェア・Web開発",
  consulting: "ITコンサルティング",
  other: "その他",
};

const inputClass =
  "w-full border border-[var(--border)] bg-[var(--field-bg)] px-4 py-3 text-base text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)]";
const labelClass = "mb-2 block text-sm font-medium tracking-[0.12em] text-[var(--deep)]";

type Errors = {
  name?: string;
  email?: string;
  message?: string;
  submit?: string;
};

/** お問い合わせフォーム本体（見出し・説明文は Contact.astro 側）。 */
export default function InquiryForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [topic, setTopic] = useState<Topic>("software");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "お名前を入力してください。";
    if (!email.trim()) next.email = "メールアドレスを入力してください。";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = "メールアドレスの形式が正しくありません。";
    if (!message.trim()) next.message = "お問い合わせ内容を入力してください。";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const payload = {
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      topic,
      message: message.trim(),
    };

    // 送信先が設定されている場合: JSON で POST します。
    if (FORM_ENDPOINT) {
      setSending(true);
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setSent(true);
      } catch {
        setErrors({
          submit:
            "送信できませんでした。時間をおいてもう一度お試しいただくか、メールでご連絡ください。",
        });
      } finally {
        setSending(false);
      }
      return;
    }

    // フォールバック: メールアドレスが設定されていれば mailto で開きます。
    if (CONTACT_EMAIL) {
      const subject = encodeURIComponent(`${TOPIC_LABELS[topic]}について`);
      const body = encodeURIComponent(
        [
          `お名前: ${payload.name}`,
          `メールアドレス: ${payload.email}`,
          `会社名・団体名: ${payload.company || "（未入力）"}`,
          `ご相談の種類: ${TOPIC_LABELS[topic]}`,
          "",
          payload.message,
        ].join("\n"),
      );
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      setSent(true);
      return;
    }

    // どちらも未設定の場合の案内（src/config.ts で設定してください）。
    setErrors({
      submit:
        "送信先が未設定です。src/config.ts の FORM_ENDPOINT または CONTACT_EMAIL を設定してください。",
    });
  };

  const reset = () => {
    setName("");
    setEmail("");
    setCompany("");
    setTopic("software");
    setMessage("");
    setErrors({});
    setSent(false);
  };

  if (sent) {
    return (
      <div className="border border-[var(--accent)] bg-[var(--surface)] px-7 py-10 text-center">
        <p className="text-lg font-medium tracking-[0.1em] text-[var(--deep)]">
          お問い合わせを受け付けました
        </p>
        <p className="mt-3 leading-loose text-[var(--text)]">
          送信ありがとうございます。内容を確認のうえ、ご入力いただいたメールアドレスへご連絡します。
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-7 border border-[var(--deep)] px-6 py-3 text-sm font-medium tracking-[0.14em] text-[var(--deep)] transition-colors hover:bg-[var(--bg)]"
        >
          もう一件送る
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7">
      <div>
        <label htmlFor="inq-name" className={labelClass}>
          お名前 <span className="text-[var(--accent)]">必須</span>
        </label>
        <input
          id="inq-name"
          name="name"
          required
          maxLength={100}
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          aria-invalid={errors.name ? true : undefined}
        />
        {errors.name && <p className="mt-2 text-sm text-[var(--error)]">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="inq-email" className={labelClass}>
          メールアドレス <span className="text-[var(--accent)]">必須</span>
        </label>
        <input
          id="inq-email"
          name="email"
          type="email"
          required
          maxLength={200}
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
        />
        {errors.email && <p className="mt-2 text-sm text-[var(--error)]">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="inq-company" className={labelClass}>
          会社名・団体名（任意）
        </label>
        <input
          id="inq-company"
          name="company"
          maxLength={200}
          className={inputClass}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          autoComplete="organization"
        />
      </div>

      <div>
        <label htmlFor="inq-topic" className={labelClass}>
          ご相談の種類
        </label>
        <select
          id="inq-topic"
          name="topic"
          className={inputClass}
          value={topic}
          onChange={(e) => setTopic(e.target.value as Topic)}
        >
          <option value="software">ソフトウェア・Web開発</option>
          <option value="consulting">ITコンサルティング</option>
          <option value="other">その他</option>
        </select>
      </div>

      <div>
        <label htmlFor="inq-message" className={labelClass}>
          お問い合わせ内容 <span className="text-[var(--accent)]">必須</span>
        </label>
        <textarea
          id="inq-message"
          name="message"
          required
          maxLength={4000}
          className={`${inputClass} min-h-40`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={errors.message ? true : undefined}
        />
        {errors.message && <p className="mt-2 text-sm text-[var(--error)]">{errors.message}</p>}
      </div>

      {errors.submit && (
        <p
          role="alert"
          className="border border-[var(--error)] bg-[var(--field-bg)] px-4 py-3 text-sm text-[var(--error)]"
        >
          {errors.submit}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full bg-[var(--deep)] px-7 py-4 text-sm font-medium tracking-[0.18em] text-white transition-colors hover:bg-[var(--accent)] disabled:opacity-60 sm:w-auto sm:px-12"
      >
        {sending ? "送信しています…" : "送信する"}
      </button>
    </form>
  );
}
