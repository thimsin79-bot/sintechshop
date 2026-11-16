interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export function ModalHeader({ title, subtitle, onClose }: ModalHeaderProps) {
  return (
    <div className="header-dark -mx-6 -mt-6 mb-5 px-6 py-4 rounded-t-2xl flex items-start justify-between">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle ? (
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-slate-400 hover:text-white transition-colors"
        aria-label="Close"
      >
        <i className="fas fa-times" />
      </button>
    </div>
  );
}
