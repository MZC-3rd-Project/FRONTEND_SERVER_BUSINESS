import { useState } from "react";
import { Package, Plus, Trash2, Search, Tag, DollarSign, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = ["식품", "음료", "디저트", "생활용품", "기타"];
const INIT = { name: "", category: "식품", price: "", stock: "", description: "", active: true };
const MOCK = [
  { id: 1, name: "유기농 사과", category: "식품", price: 12000, stock: 50, active: true },
  { id: 2, name: "제주 감귤 주스", category: "음료", price: 6500, stock: 120, active: true },
  { id: 3, name: "수제 쿠키 세트", category: "디저트", price: 18000, stock: 30, active: false },
];

export default function ItemsPage() {
  const [items, setItems] = useState(MOCK);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INIT);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "아이템명을 입력해주세요.";
    if (!form.price || isNaN(Number(form.price))) errs.price = "올바른 가격을 입력해주세요.";
    if (!form.stock || isNaN(Number(form.stock))) errs.stock = "재고를 입력해주세요.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setItems((p) => [...p, { ...form, id: Date.now(), price: Number(form.price), stock: Number(form.stock) }]);
    setForm(INIT);
    setShowForm(false);
  };

  const filtered = items.filter((it) => it.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">아이템 등록</h1>
        <p className="text-muted-foreground text-sm mt-1">가게에서 판매할 아이템을 관리하세요.</p>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="아이템 검색..." className="pl-9" />
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> 아이템 추가
        </Button>
      </div>

      {showForm && (
        <Card className="mb-5 border-primary/30 p-5">
          <h3 className="font-semibold text-sm text-primary mb-4">새 아이템 등록</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="name">아이템명 <span className="text-destructive">*</span></Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="아이템명" />
              {errors.name && <span className="text-destructive text-xs">{errors.name}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>카테고리</Label>
              <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>가격 (원) <span className="text-destructive">*</span></Label>
              <Input name="price" value={form.price} onChange={handleChange} type="number" placeholder="0" />
              {errors.price && <span className="text-destructive text-xs">{errors.price}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>재고 <span className="text-destructive">*</span></Label>
              <Input name="stock" value={form.stock} onChange={handleChange} type="number" placeholder="0" />
              {errors.stock && <span className="text-destructive text-xs">{errors.stock}</span>}
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <Label>설명</Label>
              <Textarea name="description" value={form.description} onChange={handleChange}
                placeholder="아이템 설명" rows={2} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>취소</Button>
            <Button onClick={handleSubmit}>등록</Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/30 px-5 py-3 border-b border-border">
          <span>아이템</span><span>가격</span><span>재고</span><span>상태</span><span></span>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">아이템이 없습니다.</div>
        ) : filtered.map((item) => (
          <div key={item.id}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-5 py-4 border-b border-border last:border-0 hover:bg-accent/20 transition-colors">
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-sm">{item.name}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Tag size={10} />{item.category}
              </span>
            </div>
            <span className="text-sm font-medium flex items-center gap-0.5">
              <DollarSign size={13} className="text-muted-foreground" />{item.price.toLocaleString()}
            </span>
            <span className="text-sm">{item.stock.toLocaleString()}</span>
            <button
              onClick={() => setItems((p) => p.map((it) => it.id === item.id ? { ...it, active: !it.active } : it))}
              className="flex items-center gap-1.5 text-xs">
              {item.active
                ? <><ToggleRight size={20} className="text-primary" /><span className="text-primary font-medium">활성</span></>
                : <><ToggleLeft size={20} className="text-muted-foreground" /><span className="text-muted-foreground">비활성</span></>
              }
            </button>
            <button
              onClick={() => setItems((p) => p.filter((it) => it.id !== item.id))}
              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </Card>
      <p className="text-xs text-muted-foreground mt-3">총 {filtered.length}개 아이템</p>
    </div>
  );
}
