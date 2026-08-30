import { api } from "../utils/fetchClient";
import type {
  ProfileResponse,
  UpdateProfilePayload,
  AvatarResponse,
  SettingsResponse,
  UpdateSettingsPayload,
} from "../../../types";

export const profileService = {
  async getProfile(): Promise<ProfileResponse> {
    return await api.get<ProfileResponse>("/profile");
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<ProfileResponse> {
    return await api.put<ProfileResponse>("/profile", payload);
  },

  async uploadAvatar(file: File): Promise<AvatarResponse> {
    const formData = new FormData();
    formData.append("file", file);
    return await api.post<AvatarResponse>("/profile/avatar", formData);
  },

  async getSettings(): Promise<SettingsResponse> {
    return await api.get<SettingsResponse>("/profile/settings");
  },

  async updateSettings(payload: UpdateSettingsPayload): Promise<SettingsResponse> {
    return await api.put<SettingsResponse>("/profile/settings", payload);
  },
};
