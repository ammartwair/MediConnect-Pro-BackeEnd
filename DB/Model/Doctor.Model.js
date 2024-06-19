import mongoose, { Schema, Types, model } from "mongoose";

const validSpecialties = [
  'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
  'Hematology', 'InfectiousDisease', 'Neurology', 'ObstetricsAndGynecology(OB/GYN)',
  'Oncology', 'Ophthalmology', 'Orthopedics', 'Otolaryngology(ENT)',
  'Pediatrics', 'Pulmonology', 'Rheumatology', 'Urology',
  'Psychiatry', 'Anesthesiology', 'EmergencyMedicine', 'FamilyMedicine'
];
const doctorSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    confirmEmail: {
      type: Boolean,
      required: true,
      default: false,
    },
    accepted: {
      type: Boolean,
      required: true,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: Object,
      required: true,
    },
    address: {
      type: String,
      min: 3,
      max: 20,
      required: true,
    },
    phoneNumber: {
      type: String,
      length: 13,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
    },
    licenseNumber: {
      type: String,
    },
    yearsOfExperience: {
      type: Number,
      min: 1,
    },
    consultationFees: {
      type: Number,
    },
    bio: {
      type: String,
      min: 10,
      max: 15000,
    },
    patientList: [
      {
        type: Types.ObjectId,
        ref: "patientModel",
      },
    ],
    specialties: {
      type: [String], // Array of strings
      validate: {
        validator: function (specialties) {
          return specialties.every(specialty => validSpecialties.includes(specialty));
        },
        message: props => `${props.value} is not a valid specialty!`
      }
    },
    role: {
      type: String,
      required: true,
      enum: ["Doctor"],
    },
    sendCode: {
      type: String,
      length: 4,
      default: null,
    },
    workingHours: [{
      dayOfWeek: {
        type: Number, // Example: 0 for Sunday, 1 for Monday, ..., 6 for Saturday
        required: true
      },
      startTime: {
        type: String, // Example: "09:00 AM"
        required: true
      },
      endTime: {
        type: String, // Example: "05:00 PM"
        required: true
      }
    }],
    changePasswordTime: {
      type: Date,
    },
    currentAppointments: [
      {
        type: Types.ObjectId,
        ref: "Appointment",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const doctorModel = mongoose.models.Doctor || model("Doctor", doctorSchema);

export default doctorModel;
