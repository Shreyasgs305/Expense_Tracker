import { useEffect, useState } from "react";
import {
  Plus,
  HandCoins,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  RefreshCw,
  X,
  CalendarDays,
  User,
} from "lucide-react";

import PageLayout from "../components/layout/PageLayout";

import {
  createLoan,
  getLoans,
  recordRepayment,
  deleteLoan,
} from "../api/loanApi";

import { getAccounts } from "../api/accountApi";

// =========================
// HELPERS
// =========================

const toNumber = (value) => {
  if (value === null || value === undefined) return 0;

  if (typeof value === "number") return value;

  if (value?.$numberDecimal !== undefined) {
    return Number(value.$numberDecimal);
  }

  return Number(value);
};

const formatMoney = (value, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(toNumber(value));
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// =========================
// MAIN COMPONENT
// =========================

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loanToDelete, setLoanToDelete] = useState(null);

  const [formData, setFormData] = useState({
    type: "LENT",
    personName: "",
    amount: "",
    accountId: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
  });

  const [repaymentAmount, setRepaymentAmount] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // LOAD DATA
  // =========================

  const loadData = async () => {
    try {
      setError("");

      const [loanResponse, accountResponse] = await Promise.all([
        getLoans(),
        getAccounts(),
      ]);

      setLoans(loanResponse?.loans || []);

      const accountData =
        accountResponse?.accounts ||
        accountResponse?.data?.accounts ||
        accountResponse?.data ||
        [];

      setAccounts(
        Array.isArray(accountData)
          ? accountData.filter((account) =>
              ["BANK", "CASH", "WALLET"].includes(account.type),
            )
          : [],
      );
    } catch (err) {
      console.error(err);

      setError(err?.response?.data?.message || "Failed to load loans");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // REFRESH
  // =========================

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // CREATE LOAN
  // =========================

  const handleCreateLoan = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (!formData.personName.trim()) {
        setError("Please enter person name");
        return;
      }

      if (!formData.amount || Number(formData.amount) <= 0) {
        setError("Please enter a valid amount");
        return;
      }

      if (!formData.accountId) {
        setError("Please select an account");
        return;
      }

      await createLoan({
        type: formData.type,
        personName: formData.personName.trim(),
        amount: Number(formData.amount),
        accountId: formData.accountId,
        date: formData.date,
        dueDate: formData.dueDate || null,
        notes: formData.notes.trim(),
      });

      setSuccess("Loan added successfully");

      setShowAddModal(false);

      setFormData({
        type: "LENT",
        personName: "",
        amount: "",
        accountId: "",
        date: new Date().toISOString().split("T")[0],
        dueDate: "",
        notes: "",
      });

      await loadData();
    } catch (err) {
      console.error(err);

      setError(err?.response?.data?.message || "Failed to create loan");
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // REPAYMENT
  // =========================

  const openRepaymentModal = (loan) => {
    setSelectedLoan(loan);
    setRepaymentAmount("");
    setError("");
    setSuccess("");
    setShowRepaymentModal(true);
  };

  const handleRepayment = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const amount = Number(repaymentAmount);

      if (!amount || amount <= 0) {
        setError("Enter a valid repayment amount");
        return;
      }

      const remaining = toNumber(selectedLoan.remainingAmount);

      if (amount > remaining) {
        setError(`Maximum repayment is ${formatMoney(remaining)}`);
        return;
      }

      await recordRepayment(selectedLoan._id, amount);

      setSuccess("Repayment recorded successfully");

      setShowRepaymentModal(false);
      setSelectedLoan(null);
      setRepaymentAmount("");

      await loadData();
    } catch (err) {
      console.error(err);

      setError(err?.response?.data?.message || "Failed to record repayment");
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const openDeleteModal = (loan) => {
    setLoanToDelete(loan);
    setError("");
    setSuccess("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (submitting) return;

    setShowDeleteModal(false);
    setLoanToDelete(null);
  };

  const handleDelete = async () => {
    if (!loanToDelete) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await deleteLoan(loanToDelete._id);

      setSuccess("Loan deleted successfully");

      setShowDeleteModal(false);
      setLoanToDelete(null);

      await loadData();
    } catch (err) {
      console.error(err);

      setError(err?.response?.data?.message || "Failed to delete loan");
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // SUMMARY
  // =========================

  const toReceive = loans
    .filter((loan) => loan.type === "LENT")
    .reduce((sum, loan) => sum + toNumber(loan.remainingAmount), 0);

  const toPay = loans
    .filter((loan) => loan.type === "BORROWED")
    .reduce((sum, loan) => sum + toNumber(loan.remainingAmount), 0);

  const outstanding = toReceive + toPay;

  // =========================
  // RENDER
  // =========================

  return (
    <PageLayout
      title="Loans & Borrowings"
      subtitle="Track money you lend and borrow"
    >
      <div className="space-y-6">
        {/* HEADER */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Loans & Borrowings
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage money you need to receive or pay.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />

              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setShowAddModal(true);
              }}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:from-violet-700 hover:to-purple-700"
            >
              <Plus size={18} />
              Add Loan
            </button>
          </div>
        </div>

        {/* MESSAGES */}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* SUMMARY */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            title="To Receive"
            value={formatMoney(toReceive)}
            icon={ArrowDownLeft}
            description="Money others owe you"
          />

          <SummaryCard
            title="To Pay"
            value={formatMoney(toPay)}
            icon={ArrowUpRight}
            description="Money you owe others"
          />

          <SummaryCard
            title="Outstanding"
            value={formatMoney(outstanding)}
            icon={HandCoins}
            description="Total outstanding loans"
          />
        </div>

        {/* LOAN LIST */}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 md:px-6">
            <div>
              <h3 className="font-semibold text-gray-900">Your Loans</h3>

              <p className="text-xs text-gray-500">
                {loans.length} loan
                {loans.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <RefreshCw size={24} className="animate-spin text-violet-600" />
            </div>
          ) : loans.length === 0 ? (
            <EmptyLoans
              onAdd={() => {
                setError("");
                setShowAddModal(true);
              }}
            />
          ) : (
            <>
              {/* DESKTOP */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr className="text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-6 py-3">Person</th>

                      <th className="px-6 py-3">Type</th>

                      <th className="px-6 py-3">Original</th>

                      <th className="px-6 py-3">Repaid</th>

                      <th className="px-6 py-3">Remaining</th>

                      <th className="px-6 py-3">Due Date</th>

                      <th className="px-6 py-3">Status</th>

                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {loans.map((loan) => (
                      <LoanRow
                        key={loan._id}
                        loan={loan}
                        onRepay={openRepaymentModal}
                        onDelete={openDeleteModal}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE + TABLET */}

              <div className="grid gap-4 p-4 md:grid-cols-2 lg:hidden">
                {loans.map((loan) => (
                  <LoanCard
                    key={loan._id}
                    loan={loan}
                    onRepay={openRepaymentModal}
                    onDelete={openDeleteModal}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* =========================
          ADD LOAN MODAL
      ========================= */}

      {showAddModal && (
        <Modal
          title="Add Loan"
          onClose={() => {
            if (!submitting) {
              setShowAddModal(false);
            }
          }}
        >
          <form onSubmit={handleCreateLoan} className="space-y-4">
            {/* TYPE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Loan Type
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      type: "LENT",
                    }))
                  }
                  className={`rounded-lg border px-3 py-3 text-sm font-semibold ${
                    formData.type === "LENT"
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  I Lent Money
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      type: "BORROWED",
                    }))
                  }
                  className={`rounded-lg border px-3 py-3 text-sm font-semibold ${
                    formData.type === "BORROWED"
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  I Borrowed Money
                </button>
              </div>
            </div>

            {/* PERSON */}

            <Input
              label="Person Name"
              name="personName"
              value={formData.personName}
              onChange={handleChange}
              placeholder="Enter person name"
            />

            {/* AMOUNT */}

            <Input
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0.01"
              step="0.01"
            />

            {/* ACCOUNT */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Account
              </label>

              <select
                name="accountId"
                value={formData.accountId}
                onChange={handleChange}
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              >
                <option value="">Select account</option>

                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.name} •{" "}
                    {formatMoney(account.balance, account.currency || "INR")}
                  </option>
                ))}
              </select>
            </div>

            {/* DATES */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
              />

              <Input
                label="Due Date"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>

            {/* NOTES */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Notes
              </label>

              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Optional notes"
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* ACTIONS */}

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowAddModal(false)}
                className="h-11 rounded-lg border border-gray-200 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="h-11 rounded-lg bg-violet-600 px-5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Add Loan"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================
          REPAYMENT MODAL
      ========================= */}

      {showRepaymentModal && selectedLoan && (
        <Modal
          title="Record Repayment"
          onClose={() => {
            if (!submitting) {
              setShowRepaymentModal(false);
            }
          }}
        >
          <form onSubmit={handleRepayment} className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                {selectedLoan.type === "LENT"
                  ? "Repayment from"
                  : "Repayment to"}
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {selectedLoan.personName}
              </p>

              <p className="mt-2 text-sm text-gray-500">Remaining</p>

              <p className="text-lg font-bold text-gray-900">
                {formatMoney(selectedLoan.remainingAmount)}
              </p>
            </div>

            <Input
              label="Repayment Amount"
              type="number"
              value={repaymentAmount}
              onChange={(e) => setRepaymentAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
            />

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowRepaymentModal(false)}
                className="h-11 rounded-lg border border-gray-200 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="h-11 rounded-lg bg-violet-600 px-5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Record Repayment"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================
          DELETE CONFIRMATION
      ========================= */}

      {showDeleteModal && loanToDelete && (
        <Modal title="Delete Loan" onClose={closeDeleteModal}>
          <div className="space-y-5">
            <div className="rounded-lg border border-red-100 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">
                Delete this loan?
              </p>

              <p className="mt-1 text-sm text-red-600">
                {loanToDelete.personName} • {formatMoney(loanToDelete.amount)}
              </p>
            </div>

            <p className="text-sm leading-6 text-gray-500">
              This will remove the loan and its related transactions and restore
              the account balance.
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={submitting}
                onClick={closeDeleteModal}
                className="h-11 rounded-lg border border-gray-200 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleDelete}
                className="h-11 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Delete Loan"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </PageLayout>
  );
};

// =========================
// SUMMARY CARD
// =========================

const SummaryCard = ({ title, value, icon: Icon, description }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <p className="mt-1 text-xl font-bold text-gray-900 md:text-2xl">
            {value}
          </p>

          <p className="mt-1 text-xs text-gray-400">{description}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

// =========================
// LOAN CARD
// =========================

const LoanCard = ({ loan, onRepay, onDelete }) => {
  const original = toNumber(loan.amount);
  const repaid = toNumber(loan.repaidAmount);
  const remaining = toNumber(loan.remainingAmount);

  const progress = original > 0 ? Math.min((repaid / original) * 100, 100) : 0;

  const isLent = loan.type === "LENT";

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isLent
                ? "bg-green-50 text-green-600"
                : "bg-orange-50 text-orange-600"
            }`}
          >
            {isLent ? <ArrowDownLeft size={19} /> : <ArrowUpRight size={19} />}
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">
              {loan.personName}
            </p>

            <p className="text-xs text-gray-500">
              {isLent ? "Money lent" : "Money borrowed"}
            </p>
          </div>
        </div>

        <StatusBadge status={loan.status} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <AmountInfo label="Original" value={formatMoney(original)} />

        <AmountInfo label="Repaid" value={formatMoney(repaid)} />

        <AmountInfo label="Remaining" value={formatMoney(remaining)} />
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>Repayment progress</span>

          <span>{Math.round(progress)}%</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-violet-600 transition-all"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <CalendarDays size={14} />

        <span>Due: {formatDate(loan.dueDate)}</span>
      </div>

      <div className="mt-4 flex gap-2">
        {loan.status !== "PAID" && (
          <button
            type="button"
            onClick={() => onRepay(loan)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <RefreshCw size={16} />
            Repay
          </button>
        )}

        <button
          type="button"
          onClick={() => onDelete(loan)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
          title="Delete"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
};

// =========================
// DESKTOP ROW
// =========================

const LoanRow = ({ loan, onRepay, onDelete }) => {
  const isLent = loan.type === "LENT";

  return (
    <tr className="text-sm">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
            <User size={17} />
          </div>

          <span className="font-semibold text-gray-900">{loan.personName}</span>
        </div>
      </td>

      <td className="px-6 py-4">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            isLent
              ? "bg-green-50 text-green-700"
              : "bg-orange-50 text-orange-700"
          }`}
        >
          {isLent ? "Lent" : "Borrowed"}
        </span>
      </td>

      <td className="px-6 py-4 font-medium">{formatMoney(loan.amount)}</td>

      <td className="px-6 py-4 text-gray-600">
        {formatMoney(loan.repaidAmount)}
      </td>

      <td className="px-6 py-4 font-semibold">
        {formatMoney(loan.remainingAmount)}
      </td>

      <td className="px-6 py-4 text-gray-500">{formatDate(loan.dueDate)}</td>

      <td className="px-6 py-4">
        <StatusBadge status={loan.status} />
      </td>

      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">
          {loan.status !== "PAID" && (
            <button
              type="button"
              onClick={() => onRepay(loan)}
              className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700"
            >
              Repay
            </button>
          )}

          <button
            type="button"
            onClick={() => onDelete(loan)}
            className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
};

// =========================
// STATUS
// =========================

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "bg-yellow-50 text-yellow-700",

    PARTIALLY_PAID: "bg-blue-50 text-blue-700",

    PAID: "bg-green-50 text-green-700",
  };

  const labels = {
    PENDING: "Pending",
    PARTIALLY_PAID: "Partially Paid",
    PAID: "Paid",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-50 text-gray-600"
      }`}
    >
      {labels[status] || status}
    </span>
  );
};

// =========================
// AMOUNT INFO
// =========================

const AmountInfo = ({ label, value }) => {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-gray-400">{label}</p>

      <p className="mt-0.5 truncate text-xs font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
};

// =========================
// INPUT
// =========================

const Input = ({ label, ...props }) => {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        {...props}
        className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
      />
    </div>
  );
};

// =========================
// MODAL
// =========================

const Modal = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 sm:p-5">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

// =========================
// EMPTY STATE
// =========================

const EmptyLoans = ({ onAdd }) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600">
        <HandCoins size={26} />
      </div>

      <h3 className="mt-4 font-semibold text-gray-900">No loans yet</h3>

      <p className="mt-1 max-w-sm text-sm text-gray-500">
        Add money you lent or borrowed to keep track of outstanding payments.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-5 flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
      >
        <Plus size={17} />
        Add Loan
      </button>
    </div>
  );
};

export default Loans;
