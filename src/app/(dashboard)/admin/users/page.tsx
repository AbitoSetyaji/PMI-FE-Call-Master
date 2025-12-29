"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { users } from "@/lib/api";
import { Plus, Edit, Trash2, Shield } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { User, UserRole, CreateUserRequest } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

export default function UsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch users
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", roleFilter],
    queryFn: () =>
      users.getUsers(roleFilter !== "all" ? { role: roleFilter } : {}),
    staleTime: 0,
    refetchInterval: 10 * 1000, // Auto-refetch every 10 seconds
    refetchIntervalInBackground: true,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => users.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (error: Error) => {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      toast.error(
        axiosError?.response?.data?.detail || "Failed to delete user"
      );
    },
  });

  const isAdmin = user?.role === "admin";

  // Redirect if not admin
  if (!isAdmin) {
    router.push("/dashboard");
    return null;
  }

  const handleDelete = (id: string, name: string) => {
    if (id === user?.id) {
      toast.error("You cannot delete your own account");
      return;
    }
    if (confirm(`Are you sure you want to delete user "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (editUser: User) => {
    if (editUser.id === user?.id) {
      toast.info("To edit your own account, use the profile settings");
      return;
    }
    setSelectedUser(editUser);
    setIsEditModalOpen(true);
  };

  const usersList = usersData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Users Management
            </h1>
            <p className="text-gray-600 mt-1">Manage system users and roles</p>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Filter by Role:
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="driver">Driver</option>
            <option value="reporter">Reporter</option>
          </select>
          <div className="ml-auto text-sm text-gray-600">
            Total: {usersList.length} user{usersList.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            Error loading users
          </div>
        ) : usersList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No users found for the selected filter.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usersList.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {userItem.name}
                              {userItem.id === user?.id && (
                                <span className="ml-2 text-xs text-blue-600">
                                  (You)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {userItem.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={userItem.role}>{userItem.role}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userItem.created_at ? formatDateTime(userItem.created_at) : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {userItem.id !== user?.id && (
                          <>
                            <button
                              onClick={() => handleEdit(userItem)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              <Edit className="w-4 h-4 inline" />
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(userItem.id, userItem.name)
                              }
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {usersList.map((userItem) => (
                <div key={userItem.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {userItem.name}
                        {userItem.id === user?.id && (
                          <span className="ml-2 text-xs text-blue-600">
                            (You)
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {userItem.email}
                      </p>
                    </div>
                    <Badge variant={userItem.role}>{userItem.role}</Badge>
                  </div>

                  <p className="text-xs text-gray-500 mb-3">
                    Created: {userItem.created_at ? formatDateTime(userItem.created_at) : "-"}
                  </p>

                  {userItem.id !== user?.id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(userItem)}
                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        <Edit className="w-4 h-4 inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(userItem.id, userItem.name)}
                        className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4 inline mr-1" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <UserModal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}
    </div>
  );
}

// User Modal Component
function UserModal({
  isOpen,
  onClose,
  user: editUser,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: editUser?.name || "",
    email: editUser?.email || "",
    password: "",
    role: (editUser?.role || "reporter") as UserRole,
  });

  const mutation = useMutation({
    mutationFn: (data: CreateUserRequest) =>
      editUser
        ? users.updateUser(editUser.id, {
          name: data.name,
          email: data.email,
          role: data.role,
          ...(data.password ? { password: data.password } : {}),
        })
        : users.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(
        editUser ? "User updated successfully" : "User created successfully"
      );
      onClose();
    },
    onError: (error: Error) => {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      toast.error(axiosError?.response?.data?.detail || "Failed to save user");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password for new user
    if (!editUser && !formData.password) {
      toast.error("Password is required for new users");
      return;
    }

    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {editUser ? "Edit User" : "Add New User"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="user@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password {editUser && "(Leave empty to keep current)"}
              {!editUser && <span className="text-red-600">*</span>}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="••••••••"
              required={!editUser}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as UserRole })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              <option value="reporter">Reporter</option>
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending
                ? "Saving..."
                : editUser
                  ? "Update"
                  : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
