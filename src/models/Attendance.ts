//models/Attendance.ts
// models/Attendance.js
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  date: { type: String, required: true }, // yyyy-mm-dd format
  checkIn: { type: String },  // "09:00"
  checkOut: { type: String }, // "15:00"
  totalHours: { type: Number, default: 0 },
  status: { type: String, enum: ["Present", "Absent", "Leave"], default: "Present" },
  remarks: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
