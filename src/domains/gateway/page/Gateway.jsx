import { useState } from "react";
import { Globe, Key, Copy, RefreshCw, Shield, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { Label } from "@/components/ui/label.js";
import { Card, CardContent } from "@/components/ui/card.js";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert.js";
import { Badge } from "@/components/ui/badge.js";
import { Separator } from "@/components/ui/separator.js";

const STATUS_ITEMS = [
  { label: "API 연결",   status: "정상",   ok: true },
  { label: "Auth 서비스", status: "정상",   ok: true },
  { label: "결제 서비스", status: "점검 중", ok: false },
  { label: "알림 서비스", status: "정상",   ok: true },
];
const WEBHOOK_EVENTS = ["주문 생성", "주문 취소", "결제 완료", "펀딩 달성"];

export default function GatewayPage() {
  const [apiKey] = useState("biz_live_sk_a1b2c3d4e5f6g7h8i9j0");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState(["주문 생성", "결제 완료"]);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleEvent = (event) =>
    setSelectedEvents((p) => p.includes(event) ? p.filter((e) => e !== event) : [...p, event]);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">게이트웨이</h1>
        <p className="text-muted-foreground text-sm mt-1">API 연동 및 서비스 상태를 관리하세요.</p>
      </div>

      {saved && (
        <Alert className="mb-4">
          <AlertTitle>저장 완료</AlertTitle>
          <AlertDescription>설정이 저장되었습니다.</AlertDescription>
        </Alert>
      )}

      {/* Service Status */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Shield size={15} className="text-primary" />서비스 상태
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {STATUS_ITEMS.map((s) => (
              <div key={s.label}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <Badge variant={s.ok ? "outline" : "destructive"} className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${s.ok ? "bg-green-500" : "bg-white"}`} />
                  {s.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Key */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Key size={15} className="text-primary" />API Key
          </h3>
          <div className="flex gap-2">
            <Input value={apiKey} readOnly className="font-mono text-muted-foreground flex-1" />
            <Button variant="outline" onClick={handleCopy} size="sm">
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              {copied ? "복사됨" : "복사"}
            </Button>
            <Button variant="outline" size="icon">
              <RefreshCw size={14} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <AlertCircle size={12} />API Key는 외부에 노출되지 않도록 주의하세요.
          </p>
        </CardContent>
      </Card>

      {/* Webhook */}
      <Card>
        <CardContent className="p-5 flex flex-col gap-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Globe size={15} className="text-primary" />Webhook 설정
          </h3>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="webhook">Webhook URL</Label>
            <Input id="webhook" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-service.com/webhook" />
          </div>
          <Separator />
          <div>
            <Label className="mb-2 block">수신할 이벤트</Label>
            <div className="grid grid-cols-2 gap-2">
              {WEBHOOK_EVENTS.map((event) => (
                <label key={event}
                  className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg hover:bg-accent/40 transition-colors">
                  <input type="checkbox" checked={selectedEvents.includes(event)}
                    onChange={() => toggleEvent(event)} className="accent-primary" />
                  {event}
                </label>
              ))}
            </div>
          </div>
          <Button onClick={handleSave} className="self-end">저장</Button>
        </CardContent>
      </Card>
    </div>
  );
}
