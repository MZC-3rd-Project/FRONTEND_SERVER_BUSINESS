import { useState } from "react";
import { Zap, Target, Calendar, DollarSign, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { Label } from "@/components/ui/label.js";
import { Textarea } from "@/components/ui/textarea.js";
import { Card, CardContent } from "@/components/ui/card.js";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert.js";
import { Switch } from "@/components/ui/switch.js";

export default function FundingPage() {
  const [form, setForm] = useState({
    title: "", target_amount: "", min_amount: "",
    start_date: "", end_date: "", description: "",
    reward_threshold: "50", is_active: false,
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const progress = form.target_amount
    ? Math.min(100, Math.round((Number(form.min_amount) / Number(form.target_amount)) * 100)) : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">펀딩 설정</h1>
        <p className="text-muted-foreground text-sm mt-1">가게 펀딩 캠페인을 설정하세요.</p>
      </div>

      {saved && (
        <Alert className="mb-4">
          <AlertTitle>저장 완료</AlertTitle>
          <AlertDescription>설정이 저장되었습니다.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border border-accent">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-accent-foreground" />
              <span className="text-sm font-medium">펀딩 활성화</span>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">펀딩 제목 <span className="text-destructive">*</span></Label>
            <Input id="title" name="title" value={form.title} onChange={handleChange}
              placeholder="펀딩 캠페인 제목" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1">
                <Target size={13} className="text-primary" />목표 금액 (원)
              </Label>
              <Input name="target_amount" value={form.target_amount} onChange={handleChange}
                type="number" placeholder="1,000,000" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1">
                <DollarSign size={13} className="text-primary" />최소 참여 금액 (원)
              </Label>
              <Input name="min_amount" value={form.min_amount} onChange={handleChange}
                type="number" placeholder="10,000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1">
                <Calendar size={13} className="text-primary" />시작일
              </Label>
              <Input name="start_date" value={form.start_date} onChange={handleChange} type="date" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1">
                <Calendar size={13} className="text-primary" />종료일
              </Label>
              <Input name="end_date" value={form.end_date} onChange={handleChange} type="date" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="flex items-center gap-1">
              <Users size={13} className="text-primary" />리워드 발동 기준 ({form.reward_threshold}%)
            </Label>
            <input type="range" name="reward_threshold" min="10" max="100" step="5"
              value={form.reward_threshold} onChange={handleChange} className="w-full accent-primary" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10%</span><span>50%</span><span>100%</span>
            </div>
          </div>

          {form.target_amount && (
            <div className="p-3 bg-accent/30 rounded-lg border border-accent">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Info size={12} />미리보기 진행률
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{progress}% 달성</p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>펀딩 설명</Label>
            <Textarea name="description" value={form.description} onChange={handleChange}
              placeholder="펀딩 목적, 사용 계획 등을 입력하세요..." rows={3} />
          </div>

          <Button onClick={handleSave} className="self-end">설정 저장</Button>
        </CardContent>
      </Card>
    </div>
  );
}
