import {ConfirmOptions, useConfirm} from "material-ui-confirm";

export function useConfirmDelete(): (description: string, title?: string) => Promise<void> {
  const confirm = useConfirm();
  const options: ConfirmOptions = {
    confirmationText: "Delete",
    confirmationButtonProps: {
      variant: "contained",
      color: "error"
    },
    cancellationButtonProps: {
      variant: "outlined",
      autoFocus: true
    }
  };
  return (description: string, title?: string) => confirm({
    ...options,
    title,
    description
  });
}