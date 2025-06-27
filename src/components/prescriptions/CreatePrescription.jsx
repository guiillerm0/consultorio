import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function CreatePrescription() {
  const { user } = useAuth();
  const [patientEmail, setPatientEmail] = useState('');
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Farmacéuticos y farmacias
  const [pharmacists, setPharmacists] = useState([]);
  const [selectedPharmacist, setSelectedPharmacist] = useState('');
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState('');

  useEffect(() => {
    // Obtener farmacéuticos al cargar
    const fetchPharmacists = async () => {
      try {
        const res = await fetch('/api/users/fetchPharmacists');
        if (res.ok) {
          const data = await res.json();
          setPharmacists(data);
          // Extraer farmacias únicas
          const uniquePharmacies = Array.from(new Set(data.map(ph => ph.pharmacy).filter(Boolean)));
          setPharmacies(uniquePharmacies);
        }
      } catch (err) {
        // No hacer nada
      }
    };
    fetchPharmacists();
  }, []);

  const handleAddMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...medications];
    updatedMedications[index][field] = value;
    setMedications(updatedMedications);
  };

  const handleRemoveMedication = (index) => {
    if (medications.length > 1) {
      const updatedMedications = [...medications];
      updatedMedications.splice(index, 1);
      setMedications(updatedMedications);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Buscar al paciente por email
      const patientRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: patientEmail })
      });

      if (!patientRes.ok) {
        throw new Error('Patient not found');
      }

      const patient = await patientRes.json();

      // Crear receta
      const res = await fetch('/api/prescriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: user._id,
          patientId: patient._id,
          medications: medications.filter(m => m.name && m.dosage && m.frequency && m.duration),
          pharmacistId: selectedPharmacist || undefined
        })
      });

      if (!res.ok) {
        throw new Error('Failed to create prescription');
      }

      const prescription = await res.json();
      setSuccess('Prescription created successfully');
      setPatientEmail('');
      setMedications([{ name: '', dosage: '', frequency: '', duration: '' }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create New Prescription</h2>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        {/* Selección de farmacia */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="pharmacy">
            Asignar a farmacia
          </label>
          <select
            id="pharmacy"
            className="w-full p-2 border rounded"
            value={selectedPharmacy}
            onChange={e => {
              setSelectedPharmacy(e.target.value);
              setSelectedPharmacist(''); // Limpiar farmacéutico al cambiar farmacia
            }}
            required
          >
            <option value="">Seleccione una farmacia</option>
            {pharmacies.map(pharmacy => (
              <option key={pharmacy} value={pharmacy}>{pharmacy}</option>
            ))}
          </select>
        </div>
        {/* Selección de farmacéutico filtrado por farmacia */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="pharmacist">
            Asignar a farmacéutico
          </label>
          <select
            id="pharmacist"
            className="w-full p-2 border rounded"
            value={selectedPharmacist}
            onChange={e => setSelectedPharmacist(e.target.value)}
            required
            disabled={!selectedPharmacy}
          >
            <option value="">Seleccione un farmacéutico</option>
            {pharmacists
              .filter(ph => ph.pharmacy === selectedPharmacy)
              .map(ph => (
                <option key={ph._id} value={ph._id}>
                  {ph.name} ({ph.email})
                </option>
              ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="patientEmail">
            Patient Email
          </label>
          <input
            id="patientEmail"
            type="email"
            className="w-full p-2 border rounded"
            value={patientEmail}
            onChange={(e) => setPatientEmail(e.target.value)}
            required
          />
        </div>
        
        <h3 className="text-lg font-semibold mb-3">Medications</h3>
        
        {medications.map((med, index) => (
          <div key={index} className="mb-4 p-4 border rounded relative">
            <button
              type="button"
              onClick={() => handleRemoveMedication(index)}
              className="absolute top-2 right-2 text-red-500"
              disabled={medications.length <= 1}
            >   
            </button>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={med.name}
                  onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Dosage</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={med.dosage}
                  onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Frequency</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={med.frequency}
                  onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={med.duration}
                  onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={handleAddMedication}
          className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Add Another Medication
        </button>
        
        <div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Prescription'}
          </button>
        </div>
      </form>
    </div>
  );
}