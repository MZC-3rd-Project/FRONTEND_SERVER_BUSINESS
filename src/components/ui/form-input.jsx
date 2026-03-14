import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// 커스텀 폼 인풋 — shadcn Input + Label 조합
export default function FormInput({
  label,
  name,
  errors = [],
  className,
  required,
  ...rest
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      <Input id={name} name={name} {...rest} />
      {errors.map((error, index) => (
        <span key={index} className="text-destructive text-xs font-medium">
          {error}
        </span>
      ))}
    </div>
  );
}
