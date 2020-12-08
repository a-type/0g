import * as React from 'react';

export type ModalProps = React.HTMLAttributes<HTMLDivElement> & {
  isOpen: boolean;
  onClose: () => void;
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(({ isOpen, onClose, ...props }, ref) => {
  if (!isOpen) return null;

  return (
    <div {...props} ref={ref} style={{ ...props.style, backgroundColor: 'white', position: 'fixed', padding: 16, left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}>
      <button onClick={onClose}>close</button>
      {props.children}
    </div>
  );
});
