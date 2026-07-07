import {
  Breakpoint,
  Dialog,
  DialogProps,
  Drawer,
  DrawerProps,
  useMediaQuery,
  useTheme,
} from '@mui/material'

type CommonKeys<A, B> = Extract<keyof A, keyof B>
type CommonOverlayProps = Pick<DialogProps, CommonKeys<DialogProps, DrawerProps>>

export type ResponsiveDialogProps = CommonOverlayProps & {
  /**
   * Renders as a drawer at/below this MUI breakpoint, and as a dialog above it.
   * Defaults to "sm".
   */
  breakpoint?: Breakpoint
  dialogProps?: Omit<DialogProps, keyof CommonOverlayProps>
  drawerProps?: Omit<DrawerProps, keyof CommonOverlayProps>
}

export function ResponsiveDialog({
  breakpoint = 'sm',
  dialogProps,
  drawerProps,
  ...commonProps
}: ResponsiveDialogProps) {
  const theme = useTheme()
  const useDrawer = useMediaQuery(theme.breakpoints.down(breakpoint))

  if (useDrawer) {
    return <Drawer anchor="bottom" {...drawerProps} {...commonProps} />
  }

  return <Dialog fullWidth maxWidth="sm" {...dialogProps} {...commonProps} />
}
