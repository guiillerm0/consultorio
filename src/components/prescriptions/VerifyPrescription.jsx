import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function VerifyPrescription() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user && user.role === 'pharmacist') {
      fetchPendingPrescriptions();
    }
  }, [user]);

  const fetchPendingPrescriptions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/prescriptions?status=pending');
      if (!res.ok) {
        throw new Error('Failed to fetch prescriptions');
      }
      const data = await res.json();
      setPrescriptions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPrescription = async (prescriptionId) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('/api/prescriptions/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptionId,
          pharmacistId: user._id
        })
      });
      
      if (!res.ok) {
        throw new Error('Failed to verify prescription');
      }
      
      const updatedPrescription = await res.json();
      setPrescriptions(prescriptions.map(p => 
        p._id === updatedPrescription._id ? updatedPrescription : p
      ));
      setSuccess('Prescription verified and signed successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Verify Prescriptions</h2>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}
      
      {isLoading && !prescriptions.length ? (
        <div>Loading...</div>
      ) : prescriptions.length === 0 ? (
        <div>No pending prescriptions</div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <div key={prescription._id} className="p-4 border rounded">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">
                    Patient: {prescription.patientId?.name || 'Unknown'}
                  </h3>
                  <p>Date: {new Date(prescription.issueDate).toLocaleDateString()}</p>
                  <p>Doctor: {prescription.doctorId?.name || 'Unknown'}</p>
                </div>
                <button
                  onClick={() => handleVerifyPrescription(prescription._id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Verify & Sign'}
                </button>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Medications:</h4>
                <ul className="space-y-2">
                  {prescription.medications.map((med, idx) => (
                    <li key={idx} className="pl-4 border-l-2 border-gray-200">
                      <p><span className="font-medium">Name:</span> {med.name}</p>
                      <p><span className="font-medium">Dosage:</span> {med.dosage}</p>
                      <p><span className="font-medium">Frequency:</span> {med.frequency}</p>
                      <p><span className="font-medium">Duration:</span> {med.duration}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}