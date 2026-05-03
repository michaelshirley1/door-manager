export interface FormWrapperProps {
    title: string;
    onSubmit: () => void;
    onCancel: () => void;
    onDelete?: () => void;
    extraActions?: React.ReactNode;
    children: React.ReactNode;
}
