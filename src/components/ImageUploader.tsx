'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';


interface ImageUploaderProps {
  onImageConverted?: (originalImage: string, convertedImage: string) => void;
}

export default function ImageUploader({ onImageConverted }: ImageUploaderProps) {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [convertedImage, setConvertedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [technique, setTechnique] = useState<string>('average');
  const [singleChannel, setSingleChannel] = useState<'r' | 'g' | 'b'>('r');
  const [weights, setWeights] = useState<{ wr: string; wg: string; wb: string }>({
    wr: '0.2126',
    wg: '0.7152',
    wb: '0.0722',
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setOriginalImage(result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setOriginalImage(result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const convertToGrayscale = async () => {
    if (!originalImage) return;

    setIsLoading(true);
    setError('');

    try {
      // Converter Data URL para Blob
      const response = await fetch(originalImage);
      const blob = await response.blob();

      // Montar FormData
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');

      // Montar query string com técnica e parâmetros
      const params = new URLSearchParams();
      params.set('technique', technique);
      if (technique === 'single_channel') {
        params.set('channel', singleChannel);
      }
      if (technique === 'weighted') {
        params.set('weights', `${weights.wr},${weights.wg},${weights.wb}`);
      }

      // Chamar API 
      const apiResponse = await fetch(`https://apigrayfy.onrender.com/grayscale?${params.toString()}`, {
        method: 'POST',
        mode: 'cors',
        body: formData,
      });

      if (!apiResponse.ok) {
        throw new Error(`Erro na API: ${apiResponse.status}`);
      }

      // Detectar tipo de resposta
      const contentType = apiResponse.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const result = await apiResponse.json();
        const candidate: unknown =
          result.converted_image || result.image || result.url || result.processedImageUrl;

        if (typeof candidate === 'string') {
          const dataUrl = candidate.startsWith('data:')
            ? candidate
            : `data:image/jpeg;base64,${candidate}`;
          setConvertedImage(dataUrl);
          onImageConverted?.(originalImage, dataUrl);
        } else {
          throw new Error('Resposta da API inválida');
        }
      } else {
        // Tratar como binário (imagem)
        const outBlob = await apiResponse.blob();
        const objectUrl = URL.createObjectURL(outBlob);
        setConvertedImage(objectUrl);
        onImageConverted?.(originalImage, objectUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao converter imagem');
      console.error('Erro na conversão:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetImages = () => {
    setOriginalImage('');
    setConvertedImage('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          originalImage
            ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {originalImage ? (
          <div className="space-y-4">
            <div className="text-green-600 dark:text-green-400 font-medium">
              ✅ Imagem carregada com sucesso!
            </div>
            <div className="flex items-center justify-center">
              <Image
                src={originalImage}
                alt="Imagem original"
                width={200}
                height={200}
                className="rounded-lg object-cover"
              />
            </div>
            <button
              onClick={resetImages}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Carregar outra imagem
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Arraste uma imagem aqui ou clique para selecionar
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Formatos suportados: JPG, PNG, GIF
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Selecionar Imagem
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Botão de Conversão */}
      {originalImage && !convertedImage && (
        <div className="text-center space-y-6">
          {/* Seleção de Técnica */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Técnica de Conversão
              </label>
              <select
                value={technique}
                onChange={(e) => setTechnique(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100"
              >
                <option value="average">average (avg)</option>
                <option value="luminosity">luminosity</option>
                <option value="lightness">lightness</option>
                <option value="desaturation">desaturation</option>
                <option value="single_channel">single_channel</option>
                <option value="weighted">weighted</option>
              </select>
            </div>

            {technique === 'single_channel' && (
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Canal (r, g ou b)
                </label>
                <select
                  value={singleChannel}
                  onChange={(e) => setSingleChannel(e.target.value as 'r' | 'g' | 'b')}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100"
                >
                  <option value="r">r</option>
                  <option value="g">g</option>
                  <option value="b">b</option>
                </select>
              </div>
            )}

            {technique === 'weighted' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pesos (wr, wg, wb)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    step="0.0001"
                    value={weights.wr}
                    onChange={(e) => setWeights({ ...weights, wr: e.target.value })}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100"
                    placeholder="wr"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={weights.wg}
                    onChange={(e) => setWeights({ ...weights, wg: e.target.value })}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100"
                    placeholder="wg"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={weights.wb}
                    onChange={(e) => setWeights({ ...weights, wb: e.target.value })}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100"
                    placeholder="wb"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">Sugestão BT.709: wr=0.2126, wg=0.7152, wb=0.0722</p>
              </div>
            )}
          </div>

          <button
            onClick={convertToGrayscale}
            disabled={isLoading}
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Convertendo...
              </div>
            ) : (
              'Converter para Escala de Cinza'
            )}
          </button>
        </div>
      )}

      {/* Resultado da Conversão */}
      {convertedImage && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center">
            Resultado da Conversão
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Imagem Original
              </h4>
              <div className="max-w-xs mx-auto">
                <Image
                  src={originalImage}
                  alt="Imagem original"
                  width={200}
                  height={200}
                  className="rounded-lg object-cover"
                />
              </div>
            </div>
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Escala de Cinza
              </h4>
              <div className="max-w-xs mx-auto">
                <Image
                  src={convertedImage}
                  alt="Imagem convertida"
                  width={200}
                  height={200}
                  className="rounded-lg object-cover"
                />
              </div>
            </div>
          </div>
          <div className="text-center space-x-4">
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = convertedImage;
                link.download = 'imagem-grayscale.jpg';
                link.click();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Baixar Imagem
            </button>
            <button
              onClick={resetImages}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Nova Conversão
            </button>
          </div>
        </div>
      )}

      {/* Mensagem de Erro */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
