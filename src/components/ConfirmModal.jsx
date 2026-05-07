export default function ConfirmModal({ modal, onClose }) {
  if (!modal) return null;
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title"
      onKeyDown={e => { if (e.key === "Escape") onClose(); }}>
      <div className="modal">
        <div id="confirm-title" className="modal-title">{modal.title}</div>
        <div className="modal-text">{modal.message}</div>
        <div className="modal-actions">
          <button className="modal-btn-ghost" onClick={onClose}>Annulla</button>
          <button
            className={modal.danger ? "modal-btn-danger" : "modal-btn"}
            onClick={() => { modal.onConfirm(); onClose(); }}
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
}
