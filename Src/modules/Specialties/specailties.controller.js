import doctorModel from "../../../DB/Model/Doctor.Model.js";

// Get Doctors:
export const getDoctors = async (req, res, next) => {

    const { specialtyName } = req.params; 
    const doctors = await doctorModel.find({ specialties: { $in: [specialtyName] } , accepted:true });
  if (doctors.length == 0) {
    return res.json({message:"No Doctors found !"});
  }

  return res.json({ message: "Success", doctors });
};

