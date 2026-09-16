import { AlertTriangle, X, Trash2 } from "lucide-react";

const DeleteAccountModal = ({
  isOpen,
  account,
  loading,
  error,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !account) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">Delete Account</h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning icon */}
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={28} />
            </div>
          </div>

          <div className="mt-5 text-center">
            <h3 className="text-base font-bold text-gray-900">
              Delete "{account.name}"?
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              This action cannot be undone. The account will be permanently
              removed from your account.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium leading-5 text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={17} />

              {loading ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
