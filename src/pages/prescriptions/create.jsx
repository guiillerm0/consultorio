import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';

export default function CreatePrescriptionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [patientEmail, setPatientEmail] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchingPatient, setSearchingPatient] = useState(false);
  // Verificar que el usuario sea un doctor
  useEffect(() => {
    if (user && user.role !== 'doctor') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Debug del AuthContext
  useEffect(() => {
    console.log('=== AUTH CONTEXT DEBUG ===');
    console.log('User object:', user);
    console.log('User type:', typeof user);
    console.log('User keys:', user ? Object.keys(user) : 'user is null/undefined');
    console.log('User role:', user?.role);
    console.log('User _id:', user?._id);
    console.log('User name:', user?.name);
    console.log('User email:', user?.email);
    console.log('User privateKey exists:', !!user?.privateKey);
    console.log('User privateKey length:', user?.privateKey?.length);
    console.log('User privateKey first 20 chars:', user?.privateKey?.substring(0, 20));
    console.log('=========================');
  }, [user]);

  // Buscar paciente por email
  const searchPatient = async (email) => {
    if (!email) {
      setPatientData(null);
      return;
    }

    setSearchingPatient(true);
    setError('');

    try {
      const res = await fetch(`/api/users/fetchUser?email=${email}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const patient = await res.json();
        if (patient.role === 'patient') {
          setPatientData(patient);
        } else {
          setPatientData(null);
          setError('User found but not a patient');
        }
      } else {
        setPatientData(null);
        setError('Patient not found');
      }
    } catch (err) {
      setPatientData(null);
      setError('Error searching for patient');
    } finally {
      setSearchingPatient(false);
    }
  };
  // Manejar cambio en email del paciente
  const handlePatientEmailChange = (e) => {
    const email = e.target.value;
    setPatientEmail(email);
    setError(''); // Limpiar errores previos
  };

  // Effect para buscar paciente con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (patientEmail) {
        searchPatient(patientEmail);
      } else {
        setPatientData(null);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [patientEmail]);

  // Agregar nuevo medicamento
  const handleAddMedication = () => {
    setMedications([
      ...medications, 
      { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
  };

  // Cambiar datos de medicamento
  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...medications];
    updatedMedications[index][field] = value;
    setMedications(updatedMedications);
  };

  // Remover medicamento
  const handleRemoveMedication = (index) => {
    if (medications.length > 1) {
      const updatedMedications = [...medications];
      updatedMedications.splice(index, 1);
      setMedications(updatedMedications);
    }
  };
  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Debug antes de enviar el formulario
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('user object:', user);
    console.log('user._id:', user?._id);
    console.log('user.privateKey exists:', !!user?.privateKey);
    console.log('user.privateKey value:', user?.privateKey);
    console.log('patientData:', patientData);
    console.log('patientData._id:', patientData?._id);
    console.log('medications:', medications);
    console.log('============================');
    
    if (!patientData) {
      setError('Please select a valid patient');
      return;
    }

    // Validar medicamentos
    const validMedications = medications.filter(med => 
      med.name.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()
    );

    if (validMedications.length === 0) {
      setError('Please add at least one complete medication');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const requestBody = {
        doctorId: user._id,
        patientId: patientData._id,
        medications: validMedications
      };
      
      console.log('Request body being sent:', requestBody);
      
      const res = await fetch('/api/prescription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create prescription');
      }

      const prescription = await res.json();
      setSuccess('Prescription created successfully');
      
      // Reset form
      setPatientEmail('');
      setPatientData(null);
      setMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
      
      // Redirect to prescription detail after 2 seconds
      setTimeout(() => {
        router.push(`/prescriptions/${prescription._id}`);
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Componente temporal para debugging
  const UserDebugInfo = ({ user }) => {
    if (!user) return (
      <div className="p-4 bg-red-100 border border-red-300 rounded mb-4">
        <h3 className="font-bold text-red-800">DEBUG: No user data</h3>
      </div>
    );
    
    return (
      <div className="p-4 text-black bg-yellow-100 border border-yellow-300 rounded mb-4">
        <h3 className="font-bold text-yellow-800 mb-2">DEBUG: User Information</h3>
        <div className="text-sm space-y-1">
          <p><strong>Name:</strong> {user.name || 'N/A'}</p>
          <p><strong>Email:</strong> {user.email || 'N/A'}</p>
          <p><strong>Role:</strong> {user.role || 'N/A'}</p>
          <p><strong>ID:</strong> {user._id || 'N/A'}</p>
          <p><strong>Private Key exists:</strong> {user.privateKey ? 'YES' : 'NO'}</p>
          <p><strong>Private Key length:</strong> {user.privateKey?.length || 'N/A'}</p>
          <p><strong>Specialty:</strong> {user.specialty || 'N/A'}</p>
          <p><strong>Clinic:</strong> {user.clinic || 'N/A'}</p>
        </div>
        <details className="mt-2">
          <summary className="cursor-pointer font-medium">View full user object</summary>
          <pre className="text-xs overflow-x-auto mt-2 p-2 bg-gray-100 rounded">
            {JSON.stringify(user, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  if (!user || user.role !== 'doctor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Debug Component */}
        <UserDebugInfo user={user} />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Create New Prescription</h1>
            <Link 
              href="/prescriptions"
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to Prescriptions
            </Link>
          </div>
          <p className="text-gray-600 mt-2">Fill out the form below to create a new prescription for your patient</p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Patient Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="patientEmail">
                    Patient Email *
                  </label>
                  <input
                    id="patientEmail"
                    type="email"
                    className="w-full p-3 text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={patientEmail}
                    onChange={handlePatientEmailChange}
                    placeholder="Enter patient's email address"
                    required
                  />
                  {searchingPatient && (
                    <p className="text-sm text-gray-500 mt-1">Searching for patient...</p>
                  )}
                </div>

                {/* Patient Data Display */}
                {patientData && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm font-medium text-green-800">
                      ✓ Patient Found: {patientData.name}
                    </p>
                    <p className="text-sm text-green-600">Email: {patientData.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Medications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Medications</h2>
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  + Add Medication
                </button>
              </div>

              <div className="space-y-4">
                {medications.map((medication, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-700">
                        Medication {index + 1}
                      </h3>
                      {medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(index)}
                          className="text-red-500 hover:text-red-700 text-xl font-bold"
                          title="Remove medication"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Medication Name *
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={medication.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                          placeholder="e.g., Amoxicillin"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dosage *
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border text-black border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          placeholder="e.g., 500mg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequency *
                        </label>
                        <select
                          className="w-full p-2 border text-black border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={medication.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                          required
                        >
                          <option value="">Select frequency</option>
                          <option value="Once daily">Once daily</option>
                          <option value="Twice daily">Twice daily</option>
                          <option value="Three times daily">Three times daily</option>
                          <option value="Four times daily">Four times daily</option>
                          <option value="Every 4 hours">Every 4 hours</option>
                          <option value="Every 6 hours">Every 6 hours</option>
                          <option value="Every 8 hours">Every 8 hours</option>
                          <option value="Every 12 hours">Every 12 hours</option>
                          <option value="As needed">As needed</option>
                          <option value="Before meals">Before meals</option>
                          <option value="After meals">After meals</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration *
                        </label>
                        <select
                          className="w-full p-2 border text-black border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={medication.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                          required
                        >
                          <option value="">Select duration</option>
                          <option value="3 days">3 days</option>
                          <option value="5 days">5 days</option>
                          <option value="7 days">7 days</option>
                          <option value="10 days">10 days</option>
                          <option value="14 days">14 days</option>
                          <option value="21 days">21 days</option>
                          <option value="30 days">30 days</option>
                          <option value="60 days">60 days</option>
                          <option value="90 days">90 days</option>
                          <option value="Until finished">Until finished</option>
                          <option value="Ongoing">Ongoing</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Special Instructions
                        </label>
                        <textarea
                          className="w-full p-2 border text-black border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows="2"
                          value={medication.instructions}
                          onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                          placeholder="e.g., Take with food, avoid alcohol, etc."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2 text-blue-800">Doctor Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-medium">Name:</span> {user.name}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                </div>
                <div>
                  <p><span className="font-medium">Specialty:</span> {user.specialty || 'General Practice'}</p>
                  <p><span className="font-medium">Clinic:</span> {user.clinic || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Debug User Info */}
            <UserDebugInfo user={user} />

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/prescriptions"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                disabled={isLoading || !patientData}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Prescription...
                  </span>
                ) : (
                  'Create Prescription'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}