import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Building2,
  Wallet,
  CreditCard,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

import PageLayout from "../components/layout/PageLayout";
import AddAccountModal from "../components/accounts/AddAccountModal";
import EditAccountModal from "../components/accounts/EditAccountModal";
import DeleteAccountModal from "../components/accounts/DeleteAccountModal";
import { getAccounts, deleteAccount } from "../api/accountApi";

const Accounts = () => {
  const navigate = useNavigate();

  // ======================================================
  // STATE
  // ======================================================

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Menu
  const [openMenu, setOpenMenu] = useState(null);

  // Delete
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  // ======================================================
  // LOAD ACCOUNTS
  // ======================================================

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAccounts();

      console.log("Accounts API:", response);

      setAccounts(response?.data || response?.accounts || []);
    } catch (error) {
      console.error("Accounts error:", error);

      setError(error.response?.data?.message || "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // ======================================================
  // FORMAT CURRENCY
  // ======================================================

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ======================================================
  // ICON
  // ======================================================

  const getIcon = (type) => {
    switch (type) {
      case "BANK":
        return Building2;

      case "CREDIT":
      case "CREDIT_CARD":
        return CreditCard;

      case "CASH":
      case "WALLET":
        return Wallet;

      default:
        return Wallet;
    }
  };

  // ======================================================
  // ICON STYLE
  // ======================================================

  const getIconStyle = (type) => {
    switch (type) {
      case "BANK":
        return "bg-blue-50 text-blue-600";

      case "CREDIT":
      case "CREDIT_CARD":
        return "bg-orange-50 text-orange-600";

      case "CASH":
        return "bg-green-50 text-green-600";

      case "WALLET":
        return "bg-purple-50 text-purple-600";

      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  // ======================================================
  // ACCOUNT TYPE
  // ======================================================

  const getAccountTypeName = (type) => {
    switch (type) {
      case "BANK":
        return "Bank Account";

      case "CASH":
        return "Cash";

      case "WALLET":
        return "Wallet";

      case "CREDIT":
      case "CREDIT_CARD":
        return "Credit Card";

      default:
        return "Account";
    }
  };

  // ======================================================
  // EDIT
  // ======================================================

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setShowEditModal(true);
    setOpenMenu(null);
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = (account) => {
    setAccountToDelete(account);
    setDeleteError("");
    setOpenMenu(null);
    setShowDeleteModal(true);
  };

  // ======================================================
  // CONFIRM DELETE
  // ======================================================

  const confirmDelete = async () => {
    if (!accountToDelete) {
      return;
    }

    try {
      setDeletingId(accountToDelete._id);
      setDeleteError("");

      await deleteAccount(accountToDelete._id);

      setAccounts((prevAccounts) =>
        prevAccounts.filter((item) => item._id !== accountToDelete._id),
      );

      setShowDeleteModal(false);
      setAccountToDelete(null);
    } catch (error) {
      console.error("Delete account error:", error);

      setDeleteError(
        error.response?.data?.message || "Failed to delete account",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <PageLayout
      title="Accounts"
      subtitle="Manage your bank accounts, wallets and cards"
    >
      <div className="mx-auto w-full max-w-[1400px] space-y-4 sm:space-y-5 lg:space-y-6">
        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              Your Accounts
            </h2>

            <p className="mt-0.5 text-[11px] text-gray-500 sm:mt-1 sm:text-sm">
              Keep track of all your money in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:from-violet-700 hover:to-purple-700 sm:h-10 sm:w-auto sm:px-5 sm:text-sm"
          >
            <Plus size={17} />
            Add Account
          </button>
        </div>

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (
          <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm sm:min-h-[280px]">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600" />

              <p className="mt-3 text-xs text-gray-500 sm:text-sm">
                Loading accounts...
              </p>
            </div>
          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}

        {!loading && error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-5 text-center sm:p-6">
            <p className="text-sm font-medium text-red-600">{error}</p>

            <button
              type="button"
              onClick={loadAccounts}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 sm:mt-4 sm:text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ==================================================
            ACCOUNT LIST
        ================================================== */}

        {!loading && !error && (
          <>
            {accounts.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 xl:gap-5">
                {accounts.map((account) => {
                  const Icon = getIcon(account.type);

                  // ------------------------------------------
                  // BALANCE
                  // ------------------------------------------

                  const balance = Number(
                    account.balance?.$numberDecimal ??
                      account.balance ??
                      account.currentBalance?.$numberDecimal ??
                      account.currentBalance ??
                      0,
                  );

                  // ------------------------------------------
                  // CREDIT CARD
                  // ------------------------------------------

                  const isCredit =
                    account.type === "CREDIT" || account.type === "CREDIT_CARD";

                  const creditLimit = Number(
                    account.creditLimit?.$numberDecimal ??
                      account.creditLimit ??
                      0,
                  );

                  const outstanding = Math.abs(balance);

                  const availableCredit = Math.max(
                    creditLimit - outstanding,
                    0,
                  );

                  return (
                    <div
                      key={account._id}
                      className="relative rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm transition hover:shadow-md sm:p-4 lg:p-5"
                    >
                      {/* =====================================
                          CARD TOP
                      ===================================== */}

                      <div className="flex items-center justify-between gap-2">
                        {/* ACCOUNT INFO */}

                        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                          {/* ICON */}

                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11 sm:rounded-xl ${getIconStyle(
                              account.type,
                            )}`}
                          >
                            <Icon
                              size={18}
                              className="sm:h-[21px] sm:w-[21px]"
                            />
                          </div>

                          {/* NAME */}

                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-gray-900 sm:text-base">
                              {account.name}
                            </h3>

                            <p className="mt-0.5 truncate text-[10px] text-gray-500 sm:text-xs">
                              {getAccountTypeName(account.type)}
                            </p>
                          </div>
                        </div>

                        {/* ==================================
                            MENU
                        ================================== */}

                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenu(
                                openMenu === account._id ? null : account._id,
                              )
                            }
                            disabled={deletingId === account._id}
                            title="More options"
                            aria-label="Account options"
                            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 sm:p-2"
                          >
                            <MoreVertical size={17} />
                          </button>

                          {/* DROPDOWN */}

                          {openMenu === account._id && (
                            <div className="absolute right-0 top-9 z-30 w-28 overflow-hidden rounded-lg border border-gray-100 bg-white py-1 shadow-lg sm:top-10 sm:w-32">
                              {/* EDIT */}

                              <button
                                type="button"
                                onClick={() => handleEdit(account)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 transition hover:bg-gray-50 sm:px-3.5 sm:text-sm"
                              >
                                <Pencil size={14} />
                                Edit
                              </button>

                              {/* DELETE */}

                              <button
                                type="button"
                                onClick={() => handleDelete(account)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 transition hover:bg-red-50 sm:px-3.5 sm:text-sm"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* =====================================
                          ACCOUNT DETAILS
                      ===================================== */}

                      <div className="mt-4 sm:mt-5">
                        {isCredit ? (
                          <>
                            {/* =================================
                                CREDIT CARD
                            ================================= */}

                            <div className="rounded-lg bg-gray-50 px-3 py-2.5 sm:px-3.5 sm:py-3">
                              {/* CREDIT LIMIT */}

                              <div className="flex items-center justify-between gap-3">
                                <p className="text-[10px] text-gray-500 sm:text-xs">
                                  Credit Limit
                                </p>

                                <p className="truncate text-xs font-semibold text-gray-900 sm:text-sm">
                                  {formatCurrency(creditLimit)}
                                </p>
                              </div>

                              {/* OUTSTANDING */}

                              <div className="mt-2 flex items-center justify-between gap-3">
                                <p className="text-[10px] text-gray-500 sm:text-xs">
                                  Outstanding
                                </p>

                                <p className="truncate text-xs font-semibold text-red-600 sm:text-sm">
                                  {formatCurrency(outstanding)}
                                </p>
                              </div>

                              {/* AVAILABLE CREDIT */}

                              <div className="mt-2 flex items-center justify-between gap-3">
                                <p className="text-[10px] text-gray-500 sm:text-xs">
                                  Available Credit
                                </p>

                                <p className="truncate text-xs font-semibold text-green-600 sm:text-sm">
                                  {formatCurrency(availableCredit)}
                                </p>
                              </div>
                            </div>

                            {/* PAY BUTTON */}

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/credit-card-payment?card=${account._id}`,
                                )
                              }
                              className="mt-2.5 h-9 w-full rounded-lg bg-blue-600 px-3 text-[11px] font-semibold text-white transition hover:bg-blue-700 sm:mt-3 sm:h-10 sm:text-xs"
                            >
                              Pay Credit Card
                            </button>
                          </>
                        ) : (
                          <>
                            {/* =================================
                                NORMAL ACCOUNT
                            ================================= */}

                            <p className="text-[10px] font-medium text-gray-500 sm:text-xs">
                              Current Balance
                            </p>

                            <p className="mt-0.5 truncate text-xl font-bold text-gray-900 sm:mt-1 sm:text-2xl">
                              {formatCurrency(balance)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ============================================
                  EMPTY STATE
              ============================================ */

              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-gray-100 bg-white px-4 py-10 text-center shadow-sm sm:min-h-[350px] sm:px-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 text-purple-600 sm:h-16 sm:w-16">
                  <Wallet size={27} className="sm:h-[30px] sm:w-[30px]" />
                </div>

                <h3 className="mt-3 text-base font-bold text-gray-900 sm:mt-4 sm:text-lg">
                  No accounts yet
                </h3>

                <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500 sm:text-sm sm:leading-6">
                  Add your first bank account, wallet or credit card to start
                  tracking your finances.
                </p>

                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 flex h-9 items-center gap-2 rounded-lg bg-purple-600 px-4 text-xs font-semibold text-white transition hover:bg-purple-700 sm:mt-5 sm:h-10 sm:text-sm"
                >
                  <Plus size={16} />
                  Add Account
                </button>
              </div>
            )}
          </>
        )}

        {/* ==================================================
            ADD ACCOUNT MODAL
        ================================================== */}

        <AddAccountModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAccountCreated={loadAccounts}
        />

        {/* ==================================================
            EDIT ACCOUNT MODAL
        ================================================== */}

        <EditAccountModal
          isOpen={showEditModal}
          account={selectedAccount}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAccount(null);
          }}
          onAccountUpdated={loadAccounts}
        />

        {/* ==================================================
            DELETE ACCOUNT MODAL
        ================================================== */}

        <DeleteAccountModal
          isOpen={showDeleteModal}
          account={accountToDelete}
          loading={deletingId === accountToDelete?._id}
          error={deleteError}
          onClose={() => {
            if (deletingId) {
              return;
            }

            setShowDeleteModal(false);
            setAccountToDelete(null);
            setDeleteError("");
          }}
          onConfirm={confirmDelete}
        />
      </div>
    </PageLayout>
  );
};

export default Accounts;
