import { useToastContext } from '@/context/ToastContext';

export default function useToast() {
  const { showToast } = useToastContext();

  return {
    success: (title: string, message: string) => showToast('success', title, message),
    error: (title: string, message: string) => showToast('error', title, message),
    info: (title: string, message: string) => showToast('info', title, message),
    warning: (title: string, message: string) => showToast('warning', title, message),
  };
}
