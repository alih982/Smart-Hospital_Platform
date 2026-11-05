import CreatePrescriptionForm from '@/components/prescriptions/CreatePrescriptionForm';

export default function CreatePrescriptionPage() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">
                New Electronic Prescription
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <CreatePrescriptionForm />
                </div>
                <div>
                    {/* Sidebar for AI Suggestions or Recent History */}
                    <div className="bg-blue-50 dark:bg-slate-800 p-6 rounded-xl border border-blue-100 dark:border-slate-700 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-300">
                            AI Assistant
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Enter symptoms to get real-time medication suggestions based on clinical guidelines.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
