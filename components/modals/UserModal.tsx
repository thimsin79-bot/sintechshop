"use client";

import { useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { ModalHeader } from "@/components/ui/ModalHeader";
import { FormActions } from "@/components/forms/FormActions";
import { FormError } from "@/components/forms/FormError";
import { FormField } from "@/components/forms/FormField";
import { useData } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { useForm } from "@/lib/useForm";
import { validateUser } from "@/lib/validation";
import { inputClass } from "@/lib/styles";
import type { User, UserDraft } from "@/lib/types";

interface UserModalProps {
  open: boolean;
  user?: User | null;
  onClose: () => void;
}

const roles = [
  "Administrator",
  "Sales Staff",
  "Inventory Manager",
  "Accountant",
];

const emptyUser: UserDraft = {
  name: "",
  email: "",
  role: "Sales Staff",
  status: "active",
};

export function UserModal({ open, user, onClose }: UserModalProps) {
  const { data, saveUser } = useData();
  const { showToast } = useToast();
  const { values, errors, formError, setValue, reset, submit } =
    useForm<UserDraft>(emptyUser, (draft) =>
      validateUser(draft, data.users, user?.id ?? null),
    );

  useEffect(() => {
    if (!open) return;
    reset(
      user
        ? {
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
          }
        : emptyUser,
    );
  }, [open, user, reset]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    submit(event, (draft) => {
      saveUser(draft, user?.id ?? null);
      showToast(user ? "User updated" : "User added");
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <ModalHeader title={user ? "Edit User" : "Add User"} onClose={onClose} />
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField label="Full Name" required error={errors.name}>
            <input
              value={values.name}
              onChange={(event) => setValue("name", event.target.value)}
              className={inputClass}
              placeholder="Jane Doe"
            />
          </FormField>
          <FormField label="Email" required error={errors.email}>
            <input
              type="email"
              value={values.email}
              onChange={(event) => setValue("email", event.target.value)}
              className={inputClass}
              placeholder="jane@sintech.com"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Role" error={errors.role}>
              <select
                value={values.role}
                onChange={(event) => setValue("role", event.target.value)}
                className={inputClass}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Status">
              <select
                value={values.status}
                onChange={(event) =>
                  setValue("status", event.target.value as UserDraft["status"])
                }
                className={inputClass}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>
          </div>
          <FormError message={formError} />
          <FormActions
            onCancel={onClose}
            submitLabel={user ? "Save Changes" : "Add User"}
          />
        </form>
      </div>
    </Modal>
  );
}
