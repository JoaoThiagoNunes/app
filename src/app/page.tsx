import ImageUploader from '../components/ImageUploader';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Conversão de Escala de Cinza
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Transforme suas imagens coloridas em escala de cinza de forma rápida e eficiente
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <ImageUploader />
          </div>
        </div>
      </main>
    </div>
  );
}
