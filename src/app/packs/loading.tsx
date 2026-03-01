export default function Loading() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-10 md:p-20 h-full">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse mb-4">
                <span className="material-symbols-outlined text-2xl text-primary">sync</span>
            </div>
            <p className="font-medium text-sm text-text-secondary">Cargando contexto...</p>
        </div>
    );
}
