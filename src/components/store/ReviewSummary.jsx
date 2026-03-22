import {Card, CardContent} from "@/components/ui/card.js";
import {Badge} from "@/components/ui/badge.js";

const ADDRESS_LABEL = { MAIN: "메인", PICKUP: "픽업", RETURN: "반품", WAREHOUSE: "창고" }

export default function ReviewSummary({ data }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold">입력 내용 확인</h2>
      <Card><CardContent className="p-4 flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">가게명</p>
        <p className="font-semibold">{data.store_name || "—"}</p>
        <Badge variant={data.status === "ACTIVE" ? "default" : "outline"} className="w-fit mt-1">{data.status}</Badge>
      </CardContent></Card>
      <Card><CardContent className="p-4 flex flex-col gap-1.5">
        <p className="text-xs text-muted-foreground">주소 ({data.addresses.length}개)</p>
        {data.addresses.length === 0 && <p className="text-sm text-muted-foreground">—</p>}
        {data.addresses.map((a, i) => (
          <div key={i} className="flex items-center gap-2">
            <Badge variant="outline" className="shrink-0">{ADDRESS_LABEL[a.address_type]}</Badge>
            <p className="text-sm truncate">{a.address || "주소 없음"}</p>
            {a.is_default && <Badge className="shrink-0">기본</Badge>}
          </div>
        ))}
      </CardContent></Card>
      <Card><CardContent className="p-4 flex flex-col gap-1.5">
        <p className="text-xs text-muted-foreground">연락처 ({data.contacts.length}개)</p>
        {data.contacts.length === 0 && <p className="text-sm text-muted-foreground">—</p>}
        {data.contacts.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <Badge variant="secondary" className="shrink-0">{c.contact_type}</Badge>
            <p className="text-sm">{c.contact_value || "—"}</p>
            {c.is_primary && <Badge className="shrink-0">대표</Badge>}
          </div>
        ))}
      </CardContent></Card>
    </div>
  )
}