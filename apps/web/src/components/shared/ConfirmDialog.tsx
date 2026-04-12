import type { ReactElement } from 'react'
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
} from '../ui/alert-dialog'

export function ConfirmDialog({
  trigger,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Continue',
  cancelText = 'Cancel',
  onConfirm,
}: {
  trigger: ReactElement
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent className="brutal-border bg-black rounded-none">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-mono uppercase text-white tracking-widest">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="font-mono text-xs uppercase text-muted-foreground tracking-widest mt-2 block">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2 sm:gap-0 bg-transparent border-0 -mx-4 -mb-4">
          <AlertDialogCancel className="brutal-border rounded-none font-mono uppercase font-bold transition-none hover:bg-neutral-800 bg-black text-white">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm()
            }}
            className="brutal-border rounded-none font-mono uppercase font-bold transition-none bg-primary text-black hover:bg-primary/80"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
