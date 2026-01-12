export interface MyComponentProps {
    text: string;
    variant?: 'primary' | 'secondary';
    onClick?: () => void;
}