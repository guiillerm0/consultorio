import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';

export default function CreatePrescriptionPage() {
  const router = useRouter();
  const { patientId, patientName, patientEmail: queryPatientEmail } = router.query;
  const { user } = useAuth();
  const [patientEmail, setPatientEmail] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchingPatient, setSearchingPatient] = useState(false);  // Verificar que el usuario sea un doctor
  useEffect(() => {
    if (user && user.role !== 'doctor') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Cargar datos del paciente desde parámetros de consulta
  useEffect(() => {
    if (router.isReady && patientId && queryPatientEmail) {
      setPatientEmail(queryPatientEmail);
      
      // Si tenemos todos los datos del paciente desde la consulta, creamos el objeto de paciente
      if (patientId && patientName && queryPatientEmail) {
        setPatientData({
          _id: patientId,
          name: patientName,
          email: queryPatientEmail,
          role: 'patient'
        });
      } else {
        // Si sólo tenemos el email, realizamos la búsqueda
        searchPatient(queryPatientEmail);
      }
    }
  }, [router.isReady, patientId, patientName, queryPatientEmail]);

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

 
  if (!user || user.role !== 'doctor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Debug Component */}
        {/* <UserDebugInfo user={user} /> */}
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-extrabold text-blue-900 drop-shadow-sm">Crear nueva receta</h1>
            <Link 
              href="/prescriptions"
              className="px-4 py-2 text-blue-700 hover:text-white border border-blue-300 rounded-md hover:bg-blue-600 transition-colors font-semibold shadow-sm"
            >
              ← Volver a recetas
            </Link>
          </div>
          <p className="text-blue-700 mt-2 text-lg">Llena el formulario para crear una nueva receta para tu paciente</p>
        </div>

        {/* Main Form */}
        <div className="bg-white/90 rounded-2xl shadow-2xl p-8 border border-blue-100">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg font-semibold shadow">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg font-semibold shadow">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Patient Information */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-blue-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Información del paciente
            </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2" htmlFor="patientEmail">
                    Correo electrónico del paciente *
                  </label>
                  <input
                    id="patientEmail"
                    type="email"
                    className="w-full p-3 text-blue-900 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-white/80 shadow-sm"
                    value={patientEmail}
                    onChange={handlePatientEmailChange}
                    placeholder="Ingresa el correo del paciente"
                    required
                  />
                  {searchingPatient && (
                    <p className="text-sm text-blue-500 mt-1 animate-pulse">Buscando paciente...</p>
                  )}
                </div>
                {/* Patient Data Display */}
                {patientData && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                    <p className="text-base font-semibold text-green-800 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Paciente encontrado: {patientData.name}
                    </p>
                    <p className="text-sm text-green-700">Correo: {patientData.email}</p>
                    {patientId && patientName && queryPatientEmail && (
                      <p className="mt-1 text-xs text-blue-700">
                        <span className="bg-blue-100 px-2 py-0.5 rounded">
                          Paciente seleccionado desde cita
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Medications */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h4m0 0V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10a4 4 0 004 4h4" /></svg>
                  Medicamentos
                </h2>
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Agregar medicamento
                </button>
              </div>

              <div className="space-y-8">
                {medications.map((medication, index) => (
                  <div key={index} className="border-2 border-blue-200 rounded-2xl p-6 bg-white/80 shadow-md relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m7-7v14" /></svg>
                        Medicamento {index + 1}
                      </h3>
                      {medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(index)}
                          className="text-red-500 hover:text-white bg-red-100 hover:bg-red-500 text-xl font-bold rounded-full w-8 h-8 flex items-center justify-center shadow transition-colors"
                          title="Eliminar medicamento"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-blue-700 mb-1">
                          Nombre del medicamento *
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 text-blue-900 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-white/90 shadow-sm"
                          value={medication.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                          placeholder="Ejemplo: Amoxicilina"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-700 mb-1">
                          Dosis *
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 border text-blue-900 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-white/90 shadow-sm"
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          placeholder="Ejemplo: 500mg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-700 mb-1">
                          Frecuencia *
                        </label>
                        <select
                          className="w-full p-3 border text-blue-900 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-white/90 shadow-sm"
                          value={medication.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                          required
                        >
                          <option value="">Selecciona la frecuencia</option>
                          <option value="Una vez al día">Una vez al día</option>
                          <option value="Dos veces al día">Dos veces al día</option>
                          <option value="Tres veces al día">Tres veces al día</option>
                          <option value="Cuatro veces al día">Cuatro veces al día</option>
                          <option value="Cada 4 horas">Cada 4 horas</option>
                          <option value="Cada 6 horas">Cada 6 horas</option>
                          <option value="Cada 8 horas">Cada 8 horas</option>
                          <option value="Cada 12 horas">Cada 12 horas</option>
                          <option value="Según necesidad">Según necesidad</option>
                          <option value="Antes de comidas">Antes de comidas</option>
                          <option value="Después de comidas">Después de comidas</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-700 mb-1">
                          Duración *
                        </label>
                        <select
                          className="w-full p-3 border text-blue-900 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-white/90 shadow-sm"
                          value={medication.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                          required
                        >
                          <option value="">Selecciona la duración</option>
                          <option value="3 días">3 días</option>
                          <option value="5 días">5 días</option>
                          <option value="7 días">7 días</option>
                          <option value="10 días">10 días</option>
                          <option value="14 días">14 días</option>
                          <option value="21 días">21 días</option>
                          <option value="30 días">30 días</option>
                          <option value="60 días">60 días</option>
                          <option value="90 días">90 días</option>
                          <option value="Hasta terminar">Hasta terminar</option>
                          <option value="Crónico">Crónico</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-blue-700 mb-1">
                          Instrucciones especiales
                        </label>
                        <textarea
                          className="w-full p-3 border text-blue-900 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-white/90 shadow-sm"
                          rows="2"
                          value={medication.instructions}
                          onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                          placeholder="Ejemplo: Tomar con alimentos, evitar alcohol, etc."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-blue-200 mt-8">
              <Link
                href="/prescriptions"
                className="px-6 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 hover:text-blue-900 transition-colors font-semibold shadow"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className="px-8 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-900 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-bold shadow flex items-center gap-2"
                disabled={isLoading || !patientData}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando receta...
                  </span>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Crear receta
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}