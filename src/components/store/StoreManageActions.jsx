import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUpdateStoreStatusMutation, useDeleteStoreMutation } from "@/domains/store/hook/useStoreQuery.js";

/**
 * 스토어 활성화/비활성화 토글 및 삭제 기능 컴포넌트
 *
 * Props:
 *   storeId   - 스토어 ID
 *   storeName - 스토어 이름 (삭제 확인 다이얼로그에 표시)
 *   status    - 현재 상태 ("ACTIVE" | "INACTIVE")
 *   onDeleted - 삭제 성공 후 콜백 (예: navigate)
 */
export default function StoreManageActions({ storeId, storeName, status, onDeleted }) {
  const updateStatusMutation = useUpdateStoreStatusMutation();
  const deleteStoreMutation = useDeleteStoreMutation();

  const isActive = status === "ACTIVE";

  function handleToggleStatus() {
    const nextStatus = isActive ? "INACTIVE" : "ACTIVE";
    updateStatusMutation.mutate({ storeId, status: nextStatus });
  }

  function handleDelete() {
    deleteStoreMutation.mutate(
      { storeId },
      { onSuccess: () => onDeleted?.() }
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* 활성/비활성 토글 */}
        <div className="flex items-center gap-3">
          <Switch
            id="store-status-toggle"
            checked={isActive}
            onCheckedChange={handleToggleStatus}
            disabled={updateStatusMutation.isPending}
          />
          <Label htmlFor="store-status-toggle" className="cursor-pointer">
            {updateStatusMutation.isPending
              ? "변경 중..."
              : isActive
                ? "운영 중 (비활성화하려면 클릭)"
                : "비공개 (활성화하려면 클릭)"}
          </Label>
        </div>

        {/* 가게 삭제 */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteStoreMutation.isPending}
            >
              <Trash2 size={14} />
              {deleteStoreMutation.isPending ? "삭제 중..." : "가게 삭제"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>정말로 가게를 삭제하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                <strong className="text-destructive">"{storeName}"</strong> 가게와 이 가게에 등록된{" "}
                <strong className="text-destructive">모든 상품</strong>이 함께 삭제됩니다.
                삭제된 데이터는 복구되지 않습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {updateStatusMutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {updateStatusMutation.error?.message ?? "상태 변경에 실패했습니다."}
          </AlertDescription>
        </Alert>
      )}
      {deleteStoreMutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {deleteStoreMutation.error?.message ?? "가게 삭제에 실패했습니다."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
