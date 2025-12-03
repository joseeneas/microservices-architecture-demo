import axios from 'axios';
import type { User, UserCreate, UserUpdate } from '../types';

const API_BASE = '/users';

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await axios.get(API_BASE + '/');
    return data;
  },

  getById: async (id: number): Promise<User> => {
    const { data } = await axios.get(`${API_BASE}/${id}`);
    return data;
  },

  create: async (user: UserCreate): Promise<User> => {
    const { data } = await axios.post(API_BASE + '/', user);
    return data;
  },

  update: async (id: number, user: UserUpdate): Promise<User> => {
    const { data } = await axios.put(`${API_BASE}/${id}`, user);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/${id}`);
  },
};
