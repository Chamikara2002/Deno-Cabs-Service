import mongoose from 'mongoose';

const adminSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'super_admin_credentials',
      unique: true,
      index: true
    },
    email: {
      type: String,
      default: 'wdinushac@gmail.com',
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      default: 'Dinu_@1996'
    },
    name: {
      type: String,
      default: 'Dinusha Chandima',
      trim: true
    },
    role: {
      type: String,
      default: 'Chief Ops Controller',
      trim: true
    },
    avatarInitials: {
      type: String,
      default: 'DC'
    },
    avatarBg: {
      type: String,
      default: '#0f243a'
    },
    department: {
      type: String,
      default: 'Executive Operations & Fleet Dispatch'
    }
  },
  {
    timestamps: true
  }
);

export const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);
export default AdminSettings;
