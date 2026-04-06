import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NutriSense API</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        dark: '#0f172a',
                        primary: '#38bdf8',
                    }
                }
            }
        }
    </script>
    <style>
        body { background-color: #0f172a; }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen text-slate-200 selection:bg-primary/30">
    <div class="max-w-2xl px-8 py-12 text-center bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl">
        <div class="inline-flex items-center justify-center w-20 h-20 mb-8 bg-primary/10 rounded-2xl border border-primary/20">
            <svg class="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
        </div>
        <h1 class="text-5xl font-bold tracking-tight text-white mb-4">
            NutriSense <span class="text-primary italic">API</span>
        </h1>
        <p class="text-xl text-slate-400 mb-12">
            Professional Nutrition & Measurement Tracking API service for modern health applications.
        </p>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="/scalar" class="group relative flex items-center justify-center px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl transition-all duration-300">
                <div class="flex flex-col items-center">
                    <span class="text-sm font-medium text-slate-500 mb-1">Documentation</span>
                    <span class="text-lg font-semibold text-white group-hover:text-primary transition-colors">Scalar API Ref</span>
                </div>
                <div class="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 rounded-2xl transition-all pointer-events-none"></div>
            </a>
            <a href="/swagger" class="group relative flex items-center justify-center px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl transition-all duration-300">
                <div class="flex flex-col items-center">
                    <span class="text-sm font-medium text-slate-500 mb-1">Testing UI</span>
                    <span class="text-lg font-semibold text-white group-hover:text-primary transition-colors">Swagger UI</span>
                </div>
                <div class="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 rounded-2xl transition-all pointer-events-none"></div>
            </a>
        </div>
        
        <div class="mt-12 pt-12 border-t border-slate-800 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                API Operational
            </div>
            <span>Version 1.0</span>
            <span>NestJS Core</span>
        </div>
    </div>
</body>
</html>`;
  }
}
