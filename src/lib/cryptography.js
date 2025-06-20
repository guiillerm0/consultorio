import * as ed from '@noble/ed25519';

// Generar par de claves
export const generateKeyPair = async () => {
  // Usar la función correcta para generar clave privada
  const privateKey = ed.utils.randomPrivateKey() || crypto.getRandomValues(new Uint8Array(32));
  const publicKey = await ed.getPublicKeyAsync(privateKey);
  return {
    privateKey: Buffer.from(privateKey).toString('hex'),
    publicKey: Buffer.from(publicKey).toString('hex')
  };
};


// Firmar receta
export const signPrescription = async (privateKeyHex, prescriptionData) => {
  const privateKey = Buffer.from(privateKeyHex, 'hex');
  const message = Buffer.from(JSON.stringify(prescriptionData));
  const signature = await ed25519.sign(message, privateKey);
  return Buffer.from(signature).toString('hex');
};

// Verificar firma
export const verifySignature = async (publicKeyHex, signatureHex, prescriptionData) => {
  try {
    const publicKey = Buffer.from(publicKeyHex, 'hex');
    const signature = Buffer.from(signatureHex, 'hex');
    const message = Buffer.from(JSON.stringify(prescriptionData));
    return await ed25519.verify(signature, message, publicKey);
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
};