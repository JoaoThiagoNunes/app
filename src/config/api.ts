// Configuração da API Flask
export const API_CONFIG = {
  // URL base da sua API Flask
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  
  // Endpoints da API
  ENDPOINTS: {
    CONVERT_TO_GRAYSCALE: '/convert-to-grayscale',
    HEALTH_CHECK: '/health',
  },
  
  // Configurações de timeout
  TIMEOUT: 30000, // 30 segundos
};

// Função para verificar se a API está funcionando
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH_CHECK}`, {
      method: 'GET',
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    console.error('Erro ao verificar API:', error);
    return false;
  }
};
