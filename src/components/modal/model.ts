export interface IModal {
    isOpen: boolean
    onClose: () => void
    title: string
    children: any
    onConfirm?: () => void
    confirmLabel?: string
}