import { useState } from "react";
import { Tag, Clock, Percent, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

const MOCK_ITEMS = [
  { id: 1, name: "유기농 사과", price: 12000 },
  { id: 2, name: "제주 감귤 주스", price: 6500 },
  { id: 3, name: "수제 쿠키 세트", price: 18000 },
];

export default function HotDealPage() {
  const [form, setForm] = useState({
    item_id: "", discount_rate: "10",
    start_at: "", end_at: "", stock_limit: "", is_active: false,
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const selectedItem = MOCK_ITEMS.find((i) => i.id === Number(form.item_id));
  const discountedPrice = selectedItem
    ? Math.round(selectedItem.price * (1 - Number(form.discount_rate) / 100)) : null;

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">핫딜 설정</h1>
        <p className="text-muted-foreground text-sm mt-1">한정 시간 할인 이벤트를 설정하세요.</p>
      </div>

      {saved && (
        <Alert className="mb-4">
          <AlertTitle>저장 완료</AlertTitle>
          <AlertDescription>핫딜이 저장되었습니다.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-destructive" />
              <span className="text-sm font-medium">핫딜 활성화</span>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="flex items-center gap-1">
              <Package size={13} className="text-primary" />핫딜 아이템 <span className="text-destructive">*</span>
            </Label>
            <Select value={form.item_id} onValueChange={(v) => setForm((p) => ({ ...p, item_id: v }))}>
              <SelectTrigger><SelectValue placeholder="아이템을 선택하세요" /></SelectTrigger>
              <SelectContent>
                {MOCK_ITEMS.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name} ({item.price.toLocaleString()}원)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="flex items-center gap-1">
              <Percent size={13} className="text-primary" />할인율 ({form.discount_rate}%)
            </Label>
            <input type="range" name="discount_rate" min="5" max="90" step="5"
              value={form.discount_rate} onChange={handleChange} className="w-full accent-primary" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5%</span><span>50%</span><span>90%</span>
            </div>
          </div>

          {selectedItem && (
            <div className="p-4 bg-accent/30 rounded-lg border border-accent flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">원가</p>
                <p className="text-sm font-medium line-through text-muted-foreground">
                  {selectedItem.price.toLocaleString()}원
                </p>
              </div>
              <div className="text-2xl font-bold text-destructive">-{form.discount_rate}%</div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">할인가</p>
                <p className="text-lg font-bold text-primary">{discountedPrice?.toLocaleString()}원</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1">
                <Clock size={13} className="text-primary" />시작 시간
              </Label>
              <Input name="start_at" value={form.start_at} onChange={handleChange} type="datetime-local" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1">
                <Clock size={13} className="text-primary" />종료 시간
              </Label>
              <Input name="end_at" value={form.end_at} onChange={handleChange} type="datetime-local" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>한정 수량</Label>
            <Input name="stock_limit" value={form.stock_limit} onChange={handleChange}
              type="number" placeholder="비워두면 제한 없음" />
          </div>

          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>핫딜은 지정된 시간에 자동으로 시작 및 종료됩니다. 활성화 상태여야 노출됩니다.</span>
          </div>

          <Button onClick={handleSave} className="self-end">핫딜 저장</Button>
        </CardContent>
      </Card>
    </div>
  );
}
