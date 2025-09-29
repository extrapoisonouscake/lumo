import { FormInput } from "@/components/ui/form-input";
import { useMask } from "@react-input/mask";
export function PhoneInput() {
  const inputRef = useMask({
    mask: "(___) ___-____",
    replacement: { _: /\d/ },
  });
  return (
    <FormInput
      required
      placeholder="(000) 000-0000"
      name="fields.phone"
      autoComplete="tel"
      ref={inputRef}
      label="Phone"
    />
  );
}
