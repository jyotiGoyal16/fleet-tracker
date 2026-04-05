import type { ReactNode } from 'react';
import Button from './Button';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

const Modal = (props: ModalProps) => {
  const { title, onClose, children } = props;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-4 shadow-lg dark:bg-slate-900"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-medium">
            {title}
          </h2>
          <Button variant="icon-only" onClick={onClose}>
            ✕
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal;