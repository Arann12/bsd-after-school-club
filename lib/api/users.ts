import axiosInstance from "./axiosInstance";

export interface UserItem {
  id: string | number;
  user_code?: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "owner" | "admin" | "teacher" | "parent" | string;
  is_active: boolean | number;
  created_at?: string;
  updated_at?: string;
}

export interface UserQueryParams {
  role?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

export async function getUsers(params?: UserQueryParams) {
  const res = await axiosInstance.get("/users", { params });
  return res.data;
}

export async function getUser(id: string | number) {
  const res = await axiosInstance.get(`/users/${id}`);
  return res.data;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
  is_active?: boolean;
}) {
  const res = await axiosInstance.post("/users", data);
  return res.data;
}

export async function updateUser(
  id: string | number,
  data: {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    is_active?: boolean;
  }
) {
  const res = await axiosInstance.put(`/users/${id}`, data);
  return res.data;
}

export async function deleteUser(id: string | number) {
  const res = await axiosInstance.delete(`/users/${id}`);
  return res.data;
}
