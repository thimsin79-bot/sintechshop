"use client";

import { useState } from "react";
import { UserModal } from "@/components/modals/UserModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { useData } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { usePagination } from "@/lib/pagination";
import { primaryButton, secondaryButton } from "@/lib/styles";
import { initials } from "@/lib/utils";
import type { User } from "@/lib/types";

export function UsersPage() {
  const { data, deleteRecord, reset, toggleUserStatus } = useData();
  const { showToast } = useToast();
  const [editing, setEditing] = useState<User | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [resetting, setResetting] = useState(false);
  const pagination = usePagination(data.users, 10);

  function handleDelete() {
    if (!deleting) return;
    deleteRecord("users", deleting.id);
    setDeleting(null);
    showToast("User deleted");
  }

  function handleToggle(user: User) {
    toggleUserStatus(user.id);
    showToast(
      `${user.name} ${user.status === "active" ? "deactivated" : "activated"}`,
    );
  }

  function handleReset() {
    reset();
    setResetting(false);
    showToast("Demo data restored");
  }

  return (
    <div className="fade-in space-y-5">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <p className="text-sm text-slate-500">
          {data.users.length} system users
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setResetting(true)}
            className={secondaryButton}
          >
            <i className="fas fa-rotate-left" /> Reset Demo Data
          </button>
          <button
            type="button"
            onClick={() => setEditing(null)}
            className={primaryButton}
          >
            <i className="fas fa-plus" /> Add User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-left">
                <th className="px-5 py-3.5 font-medium">User</th>
                <th className="px-5 py-3.5 font-medium">Role</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((user) => (
                <tr key={user.id} className="table-row border-t border-slate-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                        {initials(user.name)}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-slate-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="badge bg-brand-50 text-brand-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`badge ${
                        user.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setEditing(user)}
                      className="text-slate-400 hover:text-brand-600 p-1.5"
                      title="Edit"
                    >
                      <i className="fas fa-edit" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggle(user)}
                      className="text-slate-400 hover:text-amber-600 p-1.5"
                      title={
                        user.status === "active" ? "Deactivate" : "Activate"
                      }
                    >
                      <i
                        className={`fas ${
                          user.status === "active"
                            ? "fa-user-slash"
                            : "fa-user-check"
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(user)}
                      className="text-slate-400 hover:text-rose-600 p-1.5"
                      title="Delete"
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
              {!data.users.length ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No users yet
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          onPageChange={pagination.goToPage}
          itemLabel="users"
        />
      </div>

      <UserModal
        open={editing !== undefined}
        user={editing ?? null}
        onClose={() => setEditing(undefined)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete user"
        message={`Are you sure you want to delete ${deleting?.name ?? "this user"}? This action cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
      <ConfirmDialog
        open={resetting}
        title="Reset demo data"
        message="This will restore all products, sales, customers, and other records to the original demo data. Your current changes will be lost."
        confirmLabel="Reset"
        onCancel={() => setResetting(false)}
        onConfirm={handleReset}
      />
    </div>
  );
}
