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
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        black: '#000000',
                        white: '#ffffff',
                        primary: '#39FF14',
                        border: '#333333'
                    },
                    fontFamily: {
                        sans: ['Space Grotesk', 'sans-serif'],
                        mono: ['Space Mono', 'monospace'],
                    }
                }
            }
        }
    </script>
    <style>
        * { border-radius: 0 !important; }
        body { 
            background-color: #000000; 
            color: #ffffff;
            font-family: 'Space Grotesk', sans-serif;
            background-image: linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px);
            background-size: 40px 40px;
            margin: 0;
        }
        .bg-overlay {
            position: fixed;
            inset: 0;
            background-color: rgba(0,0,0,0.92);
            z-index: -1;
        }
        .brutal-border {
            border: 2px solid #ffffff;
        }
        .brutal-shadow {
            box-shadow: 6px 6px 0px 0px #39FF14;
            transition: transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out;
        }
        .brutal-shadow:hover {
            transform: translate(2px, 2px);
            box-shadow: 4px 4px 0px 0px #39FF14;
        }
        .brutal-shadow:active {
            transform: translate(6px, 6px);
            box-shadow: 0px 0px 0px 0px #39FF14;
        }
        a { text-decoration: none; }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen selection:bg-primary selection:text-black">
    <div class="bg-overlay"></div>
    <div class="max-w-3xl w-full mx-4 p-8 md:p-12 bg-black brutal-border brutal-shadow relative">
        <div class="absolute -top-4 -left-4 w-8 h-8 bg-primary brutal-border hidden sm:block"></div>
        <div class="absolute -bottom-4 -right-4 w-8 h-8 bg-primary brutal-border hidden sm:block"></div>
        
        <h1 class="text-5xl md:text-7xl font-black font-mono tracking-tighter uppercase mb-4">
            Nutri<span class="text-primary">Sense</span><span class="text-white text-3xl">_API</span>
        </h1>
        <p class="text-lg md:text-xl font-mono text-gray-400 mb-12 uppercase tracking-wide border-b-2 border-border pb-6 relative">
            Nutrition & Measurement Tracking Architecture
            <span class="absolute bottom-0 left-0 w-24 h-1 bg-primary"></span>
        </p>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
            <a href="/scalar" class="flex flex-col items-start justify-center p-6 bg-black brutal-border brutal-shadow hover:bg-primary group transition-none">
                <span class="text-xs font-bold font-mono tracking-widest text-gray-400 group-hover:text-black mb-2 uppercase">Documentation</span>
                <span class="text-2xl font-black font-mono text-white group-hover:text-black uppercase">Scalar</span>
            </a>
            <a href="/swagger" class="flex flex-col items-start justify-center p-6 bg-black brutal-border brutal-shadow hover:bg-primary group transition-none">
                <span class="text-xs font-bold font-mono tracking-widest text-gray-400 group-hover:text-black mb-2 uppercase">Documentation</span>
                <span class="text-2xl font-black font-mono text-white group-hover:text-black uppercase">Swagger</span>
            </a>
        </div>

        <a href="https://nutri-sense.onrender.com" target="_blank" class="block w-full text-center p-6 bg-black brutal-border brutal-shadow hover:bg-white group transition-none">
            <span class="text-xl font-black font-mono text-primary group-hover:text-black uppercase tracking-widest">Go to Frontend</span>
            <div class="text-xs font-mono text-gray-400 group-hover:text-black mt-2">nutri-sense.onrender.com</div>
        </a>
        
        <div class="mt-12 pt-6 border-t-2 border-border flex flex-wrap items-center justify-between gap-6 text-sm font-mono text-gray-500 uppercase">
            <div class="flex items-center gap-2 font-bold text-white">
                <div class="w-3 h-3 bg-primary border border-primary"></div>
                System_Online
            </div>
            <span>V_1.0.0</span>
        </div>
    </div>
</body>
</html>`;
  }
}
