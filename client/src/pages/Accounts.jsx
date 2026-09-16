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

  // Delete loading
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [accountToDelete, setAccountToDelete] = useState(null);

  const [deleteError, setDeleteError] = useState("");
  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAccounts();

      console.log("Accounts API:", response);

      setAccounts(response.data || response.accounts || []);
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

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

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

  const getIconStyle = (type) => {
    switch (type) {
      case "BANK":
        return "bg-blue-100 text-blue-600";

      case "CREDIT":
      case "CREDIT_CARD":
        return "bg-orange-100 text-orange-600";

      case "CASH":
        return "bg-green-100 text-green-600";

      case "WALLET":
        return "bg-purple-100 text-purple-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

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

  // =========================
  // EDIT ACCOUNT
  // =========================

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setShowEditModal(true);
    setOpenMenu(null);
  };

  // =========================
  // DELETE ACCOUNT
  // =========================

  const handleDelete = (account) => {
    setAccountToDelete(account);
    setDeleteError("");
    setOpenMenu(null);
    setShowDeleteModal(true);
  };
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
  return (
    <PageLayout
      title="Accounts"
      subtitle="Manage your bank accounts, wallets and cards"
    >
      <div className="space-y-6">
        {/* =========================
            PAGE HEADER
        ========================== */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Your Accounts</h2>

            <p className="mt-1 text-sm text-gray-500">
              Keep track of all your money in one place.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-violet-700 hover:to-purple-700"
          >
            <Plus size={18} />
            Add Account
          </button>
        </div>

        {/* =========================
            LOADING
        ========================== */}

        {loading && (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600" />

              <p className="mt-3 text-sm text-gray-500">Loading accounts...</p>
            </div>
          </div>
        )}

        {/* =========================
            ERROR
        ========================== */}

        {!loading && error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-600">{error}</p>

            <button
              onClick={loadAccounts}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* =========================
            ACCOUNT LIST
        ========================== */}

        {!loading && !error && (
          <>
            {accounts.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {accounts.map((account) => {
                  const Icon = getIcon(account.type);

                  const balance = Number(
                    account.balance?.$numberDecimal ??
                      account.balance ??
                      account.currentBalance?.$numberDecimal ??
                      account.currentBalance ??
                      0,
                  );

                  const isCredit =
                    account.type === "CREDIT" || account.type === "CREDIT_CARD";

                  return (
                    <div
                      key={account._id}
                      className="relative rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {/* =========================
                          CARD TOP
                      ========================== */}

                      <div className="flex items-start justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${getIconStyle(
                              account.type,
                            )}`}
                          >
                            <Icon size={23} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-bold text-gray-900">
                              {account.name}
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                              {getAccountTypeName(account.type)}
                            </p>
                          </div>
                        </div>

                        {/* =========================
                            THREE DOT MENU
                        ========================== */}

                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenMenu(
                                openMenu === account._id ? null : account._id,
                              )
                            }
                            disabled={deletingId === account._id}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                          >
                            <MoreVertical size={19} />
                          </button>

                          {/* Dropdown */}
                          {openMenu === account._id && (
                            <div className="absolute right-0 top-10 z-20 w-36 overflow-hidden rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                              {/* Edit */}
                              <button
                                onClick={() => handleEdit(account)}
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Pencil size={16} />
                                Edit
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(account)}
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* =========================
    BALANCE
========================== */}

                      {/* =========================
    ACCOUNT BALANCE
========================== */}

                      <div className="mt-6">
                        {isCredit ? (
                          <>
                            {/* Credit Card Details */}
                            <div className="space-y-2.5">
                              {/* Credit Limit */}
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                  Credit Limit
                                </p>

                                <p className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(
                                    Number(
                                      account.creditLimit?.$numberDecimal ??
                                        account.creditLimit ??
                                        0,
                                    ),
                                  )}
                                </p>
                              </div>

                              {/* Outstanding */}
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                  Outstanding
                                </p>

                                <p className="text-sm font-semibold text-red-600">
                                  {formatCurrency(Math.abs(balance))}
                                </p>
                              </div>

                              {/* Available Credit */}
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                  Available Credit
                                </p>

                                <p className="text-sm font-semibold text-green-600">
                                  {formatCurrency(
                                    Math.max(
                                      Number(
                                        account.creditLimit?.$numberDecimal ??
                                          account.creditLimit ??
                                          0,
                                      ) - Math.abs(balance),
                                      0,
                                    ),
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Pay Credit Card */}
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/credit-card-payment?card=${account._id}`,
                                )
                              }
                              className="mt-4 w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                            >
                              Pay Credit Card
                            </button>
                          </>
                        ) : (
                          <>
                            <p className="text-xs font-medium text-gray-500">
                              Current Balance
                            </p>

                            <p className="mt-1 text-2xl font-bold text-gray-900">
                              {formatCurrency(balance)}
                            </p>
                          </>
                        )}
                      </div>

                      {/* =========================
                          ACCOUNT ID
                      ========================== */}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* =========================
                 EMPTY STATE
              ========================== */

              <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-gray-100 bg-white px-5 text-center shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <Wallet size={30} />
                </div>

                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  No accounts yet
                </h3>

                <p className="mt-1 max-w-sm text-sm leading-6 text-gray-500">
                  Add your first bank account, wallet or credit card to start
                  tracking your finances.
                </p>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-5 flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
                >
                  <Plus size={18} />
                  Add Account
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* =========================
          ADD ACCOUNT MODAL
      ========================== */}

      <AddAccountModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAccountCreated={loadAccounts}
      />

      {/* =========================
          EDIT ACCOUNT MODAL
      ========================== */}

      <EditAccountModal
        isOpen={showEditModal}
        account={selectedAccount}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAccount(null);
        }}
        onAccountUpdated={loadAccounts}
      />
      {/* =========================
          DELETE ACCOUNT MODAL
      ========================== */}
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
    </PageLayout>
  );
};

export default Accounts;
