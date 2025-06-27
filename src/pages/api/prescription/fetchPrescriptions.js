import Prescription from "../../../models/Prescription";
import dbConnect from "../../../lib/database";

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            await dbConnect();

            const { patientId, doctorId, pharmacistId } = req.query;
            let filter = {};

            // Filtrar por paciente (para vista del paciente)
            if (patientId) {
                filter.patientId = patientId;
            }

            // Filtrar por doctor (para vista del doctor)
            if (doctorId) {
                filter.doctorId = doctorId;
            }

            // Filtrar por farmacéutico (para vista del farmacéutico)
            if (pharmacistId) {
                filter.pharmacistId = pharmacistId;
            }

            // Buscar recetas con población de datos relacionados
            const prescriptions = await Prescription.find(filter)
                .populate('patientId', 'name email')
                .populate('doctorId', 'name email specialty clinic')
                .populate('pharmacistId', 'name email pharmacy')
                .sort({ createdAt: -1 }); // Ordenar por más recientes primero

            

            res.status(200).json(prescriptions);
        } catch (error) {
            console.error("Error fetching prescriptions:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    } else {
        res.setHeader("Allow", ["GET"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
